<?php

namespace App\Services;

use App\Models\Analyse;
use App\Models\ParametreScore;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Cas d'utilisation : Traiter l'analyse.
 * Exécute les vérifications non intrusives, calcule le score et enregistre
 * les résultats. Correspond au diagramme de séquence (section 8 du dossier).
 *
 * Toutes les vérifications sont passives : lecture de ce que le serveur
 * expose déjà (en-têtes, certificat, enregistrements DNS publics...), sans
 * jamais tenter d'exploiter une faille.
 */
class AnalyseSecuriteService
{
    public function executer(Analyse $analyse): void
    {
        try {
            $hote = parse_url($analyse->url, PHP_URL_HOST) ?: preg_replace('#^https?://#i', '', $analyse->url);

            // Deuxième vérification (défense en profondeur) : le contrôleur a déjà
            // rejeté les adresses privées/internes à la soumission, mais on
            // revérifie ici au cas où la résolution DNS aurait changé entre-temps.
            if (! $this->hoteEstAutorise($hote)) {
                $analyse->update([
                    'statut' => 'echec',
                    'motif_echec' => "Adresse non autorisée : elle pointe vers une ressource réseau privée, interne ou introuvable.",
                ]);

                return;
            }

            $capture = $this->recupererReponse($analyse->url);

            if ($capture === null) {
                $analyse->update([
                    'statut' => 'echec',
                    'motif_echec' => 'Le site est injoignable (aucune réponse en HTTPS ni en HTTP dans le délai imparti).',
                ]);

                return;
            }

            ['reponse' => $reponse, 'https' => $https, 'urlBase' => $urlBase] = $capture;

            // Une connexion réussie ne veut pas dire qu'il y a un vrai site à
            // cette adresse : un domaine sans déploiement (ex. Netlify, Vercel)
            // répond quand même, mais avec une page d'erreur générique de
            // l'hébergeur. Sans ce contrôle, les 7 vérifications s'exécuteraient
            // sur cette page d'erreur et produiraient un score trompeur.
            if ($reponse->status() >= 400) {
                $analyse->update([
                    'statut' => 'echec',
                    'motif_echec' => "Le site retourne une erreur HTTP {$reponse->status()} : aucun contenu n'est accessible à cette adresse.",
                ]);

                return;
            }

            $infosRedirection = $this->verifierRedirectionHttp($hote, $https);

            $resultats = [
                $this->verifierHttps($https, $reponse, $infosRedirection),
                $this->controlerCertificatSsl($hote),
                $this->analyserEnTetesSecurite($reponse),
                $this->verifierCookies($reponse),
                $this->rechercherVulnerabilites($reponse, $urlBase),
                $this->verifierFichiersExposes($urlBase),
                $this->verifierSecuriteEmail($hote),
            ];

            $bareme = ParametreScore::actuels();
            $poidsParType = $this->poidsParType($bareme);

            foreach ($resultats as $resultat) {
                $resultat['poids'] = $poidsParType[$resultat['type']] ?? 0;
                $analyse->resultatsVerification()->create($resultat);
            }

            [$score, $niveauRisque] = $this->calculerScore($resultats, $bareme);

            $analyse->score = $score;
            $analyse->niveau_risque = $niveauRisque;
            $analyse->statut = 'terminee';

            try {
                $analyse->chemin_rapport_pdf = $this->genererRapportPdf($analyse);
            } catch (\Throwable $e) {
                logger()->error("Erreur lors de la génération du PDF pour l'analyse #{$analyse->id}: ".$e->getMessage());
                $analyse->chemin_rapport_pdf = null;
            }

            $analyse->save();
        } catch (\Throwable $e) {
            logger()->error("Échec inattendu de l'analyse #{$analyse->id}: ".$e->getMessage());
            $analyse->update([
                'statut' => 'echec',
                'motif_echec' => "Une erreur inattendue est survenue pendant l'analyse : ".$e->getMessage(),
            ]);
        }
    }

    /**
     * Vérifie qu'un hôte ne pointe vers aucune adresse privée, réservée ou
     * de bouclage, avant d'y envoyer la moindre requête — empêche un
     * utilisateur de détourner l'outil pour sonder le réseau interne du
     * serveur (SSRF), y compris via une adresse IP saisie directement.
     */
    public function hoteEstAutorise(string $hote): bool
    {
        return $this->resoudreIpsPubliques($hote) !== null;
    }

    /**
     * @return array<int, string>|null la liste des IP résolues si toutes sont
     *                                  publiques, sinon null (hôte refusé ou non résolu)
     */
    private function resoudreIpsPubliques(string $hote): ?array
    {
        if (filter_var($hote, FILTER_VALIDATE_IP)) {
            return $this->toutesPubliques([$hote]) ? [$hote] : null;
        }

        $ips = [];
        foreach (@dns_get_record($hote, DNS_A + DNS_AAAA) ?: [] as $enregistrement) {
            if (isset($enregistrement['ip'])) {
                $ips[] = $enregistrement['ip'];
            }
            if (isset($enregistrement['ipv6'])) {
                $ips[] = $enregistrement['ipv6'];
            }
        }

        if (empty($ips)) {
            return null;
        }

        return $this->toutesPubliques($ips) ? $ips : null;
    }

    /**
     * @param  array<int, string>  $ips
     */
    private function toutesPubliques(array $ips): bool
    {
        foreach ($ips as $ip) {
            if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Génère le rapport PDF de l'analyse et le stocke sur le disque privé.
     * Retourne le chemin relatif à enregistrer dans chemin_rapport_pdf.
     */
    private function genererRapportPdf(Analyse $analyse): string
    {
        $analyse->load(['utilisateur', 'resultatsVerification']);

        $pdf = Pdf::loadView('pdf.rapport-analyse', ['analyse' => $analyse]);

        $chemin = 'rapports/analyse_'.$analyse->id.'.pdf';
        Storage::disk('local')->put($chemin, $pdf->output());

        return $chemin;
    }

    /**
     * Tente la connexion en HTTPS puis, à défaut, en HTTP — pour pouvoir
     * quand même analyser les en-têtes d'un site qui ne supporte pas HTTPS.
     *
     * @return array{reponse: Response, https: bool, urlBase: string}|null
     */
    private function recupererReponse(string $url): ?array
    {
        $hoteEtChemin = preg_replace('#^https?://#i', '', $url);
        $urlHttps = 'https://'.$hoteEtChemin;

        try {
            return ['reponse' => Http::timeout(8)->get($urlHttps), 'https' => true, 'urlBase' => $urlHttps];
        } catch (ConnectionException) {
            // Le site ne répond pas en HTTPS : on retente en HTTP plutôt que
            // d'abandonner toute l'analyse.
        }

        $urlHttp = 'http://'.$hoteEtChemin;

        try {
            return ['reponse' => Http::timeout(8)->get($urlHttp), 'https' => false, 'urlBase' => $urlHttp];
        } catch (ConnectionException) {
            return null;
        }
    }

    /**
     * Vérifie, indépendamment de la requête principale, si le site reste
     * accessible en HTTP non chiffré sans rediriger vers HTTPS.
     *
     * @return array{accessible: bool|null, redirige_vers_https: bool|null}
     */
    private function verifierRedirectionHttp(string $hote, bool $https): array
    {
        if (! $https) {
            // Le site ne répond déjà pas en HTTPS : ce constat est couvert
            // par le contrôle HTTPS principal, pas la peine de vérifier une
            // redirection qui n'a pas de sens ici.
            return ['accessible' => null, 'redirige_vers_https' => null];
        }

        try {
            $reponse = Http::withoutRedirecting()->timeout(5)->get('http://'.$hote);
        } catch (\Throwable) {
            return ['accessible' => false, 'redirige_vers_https' => null];
        }

        $emplacement = $reponse->header('Location');
        $redirige = in_array($reponse->status(), [301, 302, 307, 308], true)
            && $emplacement
            && str_starts_with($emplacement, 'https://');

        return ['accessible' => true, 'redirige_vers_https' => $redirige];
    }

    /**
     * @param  array{accessible: bool|null, redirige_vers_https: bool|null}  $infosRedirection
     */
    private function verifierHttps(bool $https, Response $reponse, array $infosRedirection): array
    {
        if (! $https) {
            return [
                'type' => 'https',
                'statut' => 'non_conforme',
                'description' => "Le site n'est pas protégé par le cadenas de sécurité (HTTPS) : tout ce qu'échangent les visiteurs avec le site (mots de passe, formulaires...) circule en clair et peut être intercepté.",
                'recommandation' => "Installer un certificat de sécurité (HTTPS) sur le serveur — souvent gratuit et automatique via un service comme Let's Encrypt — pour que le site s'affiche avec le cadenas dans le navigateur.",
            ];
        }

        $problemes = [];

        if ($infosRedirection['accessible'] === true && $infosRedirection['redirige_vers_https'] === false) {
            $problemes[] = "une version non protégée du site (sans le cadenas de sécurité) reste accessible, au lieu de rediriger automatiquement vers la version sécurisée";
        }

        $ressourcesMixtes = $this->detecterContenuMixte($reponse->body());
        if (! empty($ressourcesMixtes)) {
            $problemes[] = 'certains éléments de la page (images, scripts...) sont chargés de façon non sécurisée, ce qui affaiblit la protection même si le site utilise le cadenas de sécurité';
        }

        if (empty($problemes)) {
            return [
                'type' => 'https',
                'statut' => 'conforme',
                'description' => 'Le site est bien protégé par le cadenas de sécurité (HTTPS) et redirige automatiquement les visiteurs vers la version sécurisée.',
                'recommandation' => null,
            ];
        }

        return [
            'type' => 'https',
            'statut' => 'non_conforme',
            'description' => 'Le site utilise le cadenas de sécurité (HTTPS), mais avec des faiblesses : '.implode(' ; ', $problemes).'.',
            'recommandation' => "S'assurer que toutes les pages et tous les éléments du site (images, scripts, styles) passent uniquement par la version sécurisée, sans exception.",
        ];
    }

    /**
     * @return array<int, string> chemins des ressources chargées en http:// sur une page https
     */
    private function detecterContenuMixte(string $html): array
    {
        preg_match_all('/\b(?:src|href)=["\']http:\/\/([^"\']+)["\']/i', $html, $correspondances);

        return array_values(array_unique($correspondances[1] ?? []));
    }

    private function controlerCertificatSsl(string $hote): array
    {
        $infos = $this->inspecterCertificatSsl($hote);

        if ($infos === null) {
            return [
                'type' => 'certificat_ssl',
                'statut' => 'non_conforme',
                'description' => "Impossible de vérifier le certificat de sécurité du site : la connexion sécurisée n'a pas pu être établie.",
                'recommandation' => "Installer un certificat de sécurité valide sur le serveur — souvent gratuit via un service comme Let's Encrypt.",
            ];
        }

        $problemes = [];

        $joursRestants = $infos['expire_le'] !== null
            ? (int) floor(($infos['expire_le'] - time()) / 86400)
            : null;

        if ($joursRestants !== null && $joursRestants < 0) {
            $problemes[] = 'le certificat de sécurité a expiré depuis '.abs($joursRestants)." jour(s) : les visiteurs voient un avertissement effrayant en arrivant sur le site";
        } elseif ($joursRestants !== null && $joursRestants < 30) {
            $problemes[] = 'le certificat de sécurité expire dans moins de 30 jours et doit être renouvelé bientôt';
        }

        if (! $infos['nom_correspond']) {
            $problemes[] = "le certificat de sécurité ne correspond pas au nom de domaine du site, ce qui déclenche un avertissement dans le navigateur du visiteur";
        }

        if ($infos['tls_obsolete']) {
            $problemes[] = 'le serveur accepte encore d\'anciennes méthodes de chiffrement, aujourd\'hui considérées comme peu sûres';
        }

        if (empty($problemes)) {
            return [
                'type' => 'certificat_ssl',
                'statut' => 'conforme',
                'description' => $joursRestants !== null
                    ? "Certificat de sécurité valide (délivré par {$infos['emetteur']}), correspond bien au nom de domaine, et expire dans {$joursRestants} jour(s)."
                    : "Certificat de sécurité valide (délivré par {$infos['emetteur']}) et correspond bien au nom de domaine.",
                'recommandation' => null,
            ];
        }

        return [
            'type' => 'certificat_ssl',
            'statut' => 'non_conforme',
            'description' => "Certificat délivré par {$infos['emetteur']}, mais avec un ou plusieurs problèmes : ".implode(' ; ', $problemes).'.',
            'recommandation' => "Renouveler ou corriger le certificat de sécurité, et demander à l'hébergeur de désactiver les anciennes méthodes de chiffrement devenues peu sûres.",
        ];
    }

    /**
     * @return array{expire_le: int|null, emetteur: string, nom_correspond: bool, tls_obsolete: bool}|null
     */
    private function inspecterCertificatSsl(string $hote, int $port = 443): ?array
    {
        $contexte = stream_context_create([
            'ssl' => [
                'capture_peer_cert' => true,
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ]);

        $client = @stream_socket_client(
            "ssl://{$hote}:{$port}",
            $errno,
            $errstr,
            6,
            STREAM_CLIENT_CONNECT,
            $contexte
        );

        if (! $client) {
            return null;
        }

        $parametres = stream_context_get_params($client);
        fclose($client);

        if (! isset($parametres['options']['ssl']['peer_certificate'])) {
            return null;
        }

        $certificat = openssl_x509_parse($parametres['options']['ssl']['peer_certificate']);

        return [
            'expire_le' => $certificat['validTo_time_t'] ?? null,
            'emetteur' => $certificat['issuer']['O'] ?? ($certificat['issuer']['CN'] ?? 'inconnu'),
            'nom_correspond' => $this->nomCertificatCorrespond($certificat, $hote),
            'tls_obsolete' => $this->accepteTlsObsolete($hote, $port),
        ];
    }

    /**
     * @param  array<string, mixed>  $certificat
     */
    private function nomCertificatCorrespond(array $certificat, string $hote): bool
    {
        $noms = [];

        if (! empty($certificat['subject']['CN'])) {
            $noms[] = $certificat['subject']['CN'];
        }

        if (! empty($certificat['extensions']['subjectAltName'])) {
            foreach (explode(',', $certificat['extensions']['subjectAltName']) as $entree) {
                $noms[] = trim(str_replace('DNS:', '', $entree));
            }
        }

        foreach ($noms as $nom) {
            if (strcasecmp($nom, $hote) === 0) {
                return true;
            }
            if (str_starts_with($nom, '*.') && str_ends_with(strtolower($hote), strtolower(substr($nom, 1)))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Teste si le serveur accepte encore une négociation en TLS 1.0/1.1 —
     * des versions du protocole considérées obsolètes et vulnérables.
     * Simple tentative de connexion (aucune donnée n'est envoyée au-delà de
     * la poignée de main TLS), donc toujours non intrusif.
     */
    private function accepteTlsObsolete(string $hote, int $port = 443): bool
    {
        if (! defined('CURL_SSLVERSION_TLSv1_0') || ! defined('CURL_SSLVERSION_MAX_TLSv1_1')) {
            return false;
        }

        $ch = curl_init("https://{$hote}:{$port}");
        curl_setopt_array($ch, [
            CURLOPT_SSLVERSION => CURL_SSLVERSION_TLSv1_0 | CURL_SSLVERSION_MAX_TLSv1_1,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_TIMEOUT => 6,
            CURLOPT_CONNECTTIMEOUT => 6,
            CURLOPT_NOBODY => true,
            CURLOPT_RETURNTRANSFER => true,
        ]);
        $resultat = curl_exec($ch);
        $erreur = curl_errno($ch);
        curl_close($ch);

        return $resultat !== false && $erreur === 0;
    }

    private function analyserEnTetesSecurite(Response $reponse): array
    {
        $problemes = [];

        if (! $reponse->hasHeader('Strict-Transport-Security')) {
            $problemes[] = "le navigateur n'est pas obligé de toujours utiliser la connexion sécurisée pour ce site, ce qui laisse une petite fenêtre pour une interception";
        } elseif (! preg_match('/max-age=(\d+)/i', (string) $reponse->header('Strict-Transport-Security'), $m) || (int) $m[1] < 15552000) {
            $problemes[] = "l'obligation d'utiliser la connexion sécurisée n'est activée que pour une durée trop courte";
        }

        if (! $reponse->hasHeader('X-Content-Type-Options') || strtolower(trim((string) $reponse->header('X-Content-Type-Options'))) !== 'nosniff') {
            $problemes[] = 'le navigateur peut être trompé sur le type de certains fichiers envoyés par le site, une faiblesse parfois exploitée pour faire exécuter du code malveillant';
        }

        if (! $reponse->hasHeader('X-Frame-Options') || ! in_array(strtoupper(trim((string) $reponse->header('X-Frame-Options'))), ['DENY', 'SAMEORIGIN'], true)) {
            $problemes[] = "le site peut être affiché à l'intérieur d'une autre page web à l'insu du visiteur, une technique utilisée pour le piéger en lui faisant cliquer sur quelque chose sans le savoir";
        }

        if (! $reponse->hasHeader('Content-Security-Policy')) {
            $problemes[] = "aucune protection supplémentaire n'est activée contre l'injection de scripts malveillants dans les pages du site";
        } else {
            $csp = strtolower((string) $reponse->header('Content-Security-Policy'));
            if (str_contains($csp, 'default-src *') || trim($csp) === '*') {
                $problemes[] = "une protection contre l'injection de scripts malveillants est activée mais autorise pratiquement n'importe quelle source, ce qui la rend quasiment inutile";
            }
        }

        if (! $reponse->hasHeader('Referrer-Policy')) {
            $problemes[] = "l'adresse complète de la page visitée peut être transmise à des sites tiers lorsqu'un visiteur clique sur un lien sortant";
        } elseif (strtolower(trim((string) $reponse->header('Referrer-Policy'))) === 'unsafe-url') {
            $problemes[] = "l'adresse complète de la page visitée (pouvant contenir des informations sensibles) est systématiquement transmise aux sites tiers";
        }

        if (empty($problemes)) {
            return [
                'type' => 'en_tetes_securite',
                'statut' => 'conforme',
                'description' => 'Toutes les protections de sécurité recommandées au niveau du serveur sont activées et bien configurées.',
                'recommandation' => null,
            ];
        }

        return [
            'type' => 'en_tetes_securite',
            'statut' => 'non_conforme',
            'description' => 'Protections manquantes ou mal configurées : '.implode(' ; ', $problemes).'.',
            'recommandation' => "Demander à un développeur d'ajouter les protections manquantes au niveau du serveur (souvent quelques lignes de configuration) pour réduire les risques de piégeage, d'injection de code malveillant et de fuite d'informations.",
        ];
    }

    private function verifierCookies(Response $reponse): array
    {
        $cookies = $reponse->headers()['Set-Cookie'] ?? [];

        if (empty($cookies)) {
            return [
                'type' => 'cookies',
                'statut' => 'conforme',
                'description' => 'Le site ne dépose aucun cookie sur cette page.',
                'recommandation' => null,
            ];
        }

        $problemes = [];
        foreach ($cookies as $cookie) {
            if (! str_contains(strtolower($cookie), 'secure')) {
                $problemes['non_securise'] = 'certains cookies peuvent être transmis même sur une connexion non sécurisée';
            }
            if (! str_contains(strtolower($cookie), 'httponly')) {
                $problemes['lisible'] = 'certains cookies peuvent être lus par un script sur la page, ce qui facilite leur vol en cas de faille';
            }

            if (! preg_match('/samesite=(lax|strict|none)/i', $cookie, $m)) {
                $problemes['sans_samesite'] = "certains cookies peuvent être envoyés automatiquement depuis un autre site, ce qui facilite certaines arnaques en ligne";
            } elseif (strtolower($m[1]) === 'none' && ! str_contains(strtolower($cookie), 'secure')) {
                $problemes['samesite_risque'] = "certains cookies autorisent l'envoi depuis d'autres sites sans exiger de connexion sécurisée, une combinaison risquée";
            }
        }

        if (empty($problemes)) {
            return [
                'type' => 'cookies',
                'statut' => 'conforme',
                'description' => 'Les cookies déposés par le site sont correctement protégés.',
                'recommandation' => null,
            ];
        }

        return [
            'type' => 'cookies',
            'statut' => 'non_conforme',
            'description' => 'Un ou plusieurs cookies déposés par le site ne sont pas suffisamment protégés : '.implode(' ; ', array_values($problemes)).'.',
            'recommandation' => "Demander à un développeur de sécuriser la configuration des cookies du site pour empêcher qu'ils soient interceptés, lus par un script malveillant, ou envoyés à l'insu du visiteur depuis un autre site.",
        ];
    }

    private function rechercherVulnerabilites(Response $reponse, string $urlBase): array
    {
        $expositions = [];

        $enTetesSensibles = ['Server', 'X-Powered-By', 'X-AspNet-Version', 'X-AspNetMvc-Version', 'X-Generator', 'X-Drupal-Cache'];
        foreach ($enTetesSensibles as $entete) {
            $valeur = $reponse->header($entete);
            if ($valeur) {
                $expositions[] = "le site révèle publiquement une information technique sur la technologie utilisée ({$valeur}), ce qui facilite la tâche de quelqu'un cherchant une faille connue de cette technologie";
            }
        }

        $methodesOuvertes = $this->detecterMethodesDangereuses($urlBase);
        if (! empty($methodesOuvertes)) {
            $expositions[] = 'le serveur accepte des commandes techniques ('.implode(', ', $methodesOuvertes).') qui pourraient permettre de modifier ou supprimer du contenu à distance';
        }

        if (empty($expositions)) {
            return [
                'type' => 'vulnerabilites',
                'statut' => 'conforme',
                'description' => "Aucune information technique sensible ni fonctionnalité risquée n'a été détectée sur le site.",
                'recommandation' => null,
            ];
        }

        return [
            'type' => 'vulnerabilites',
            'statut' => 'non_conforme',
            'description' => 'Informations ou fonctionnalités exposées pouvant faciliter une attaque : '.implode(' ; ', $expositions).'.',
            'recommandation' => "Demander à l'hébergeur ou au développeur de masquer les informations techniques visibles publiquement et de désactiver les commandes serveur non nécessaires.",
        ];
    }

    /**
     * Envoie une requête OPTIONS (aucune donnée modifiée) pour lire les
     * méthodes HTTP acceptées par le serveur via l'en-tête Allow.
     *
     * @return array<int, string>
     */
    private function detecterMethodesDangereuses(string $urlBase): array
    {
        try {
            $reponse = Http::timeout(5)->send('OPTIONS', $urlBase);
        } catch (\Throwable) {
            return [];
        }

        $allow = $reponse->header('Allow');
        if (! $allow) {
            return [];
        }

        $methodesRisquees = ['PUT', 'DELETE', 'TRACE', 'CONNECT'];
        $trouvees = array_map('trim', explode(',', strtoupper($allow)));

        return array_values(array_intersect($methodesRisquees, $trouvees));
    }

    /**
     * Recherche passive de fichiers sensibles accessibles publiquement
     * (simple GET, comme le ferait n'importe quel visiteur ou moteur de
     * recherche) — jamais de tentative d'accès en écriture ou d'exploitation.
     */
    private function verifierFichiersExposes(string $urlBase): array
    {
        $cibles = [
            '.env' => fn (string $corps) => (bool) preg_match('/\bDB_(HOST|DATABASE|PASSWORD)\b|\bAPP_KEY\b/', $corps),
            '.git/HEAD' => fn (string $corps) => str_starts_with(trim($corps), 'ref:'),
            '.git/config' => fn (string $corps) => str_contains($corps, '[core]'),
            'wp-config.php.bak' => fn (string $corps) => str_contains($corps, 'DB_NAME') || str_contains($corps, 'define('),
        ];

        $exposes = [];
        foreach ($cibles as $chemin => $verifie) {
            try {
                $reponse = Http::timeout(5)->get(rtrim($urlBase, '/').'/'.$chemin);
            } catch (\Throwable) {
                continue;
            }

            if ($reponse->status() === 200 && $verifie($reponse->body())) {
                $exposes[] = $chemin;
            }
        }

        if (empty($exposes)) {
            return [
                'type' => 'fichiers_exposes',
                'statut' => 'conforme',
                'description' => "Aucun fichier sensible (mots de passe, configuration, sauvegardes...) n'est accessible publiquement sur le site.",
                'recommandation' => null,
            ];
        }

        return [
            'type' => 'fichiers_exposes',
            'statut' => 'non_conforme',
            'description' => 'Un ou plusieurs fichiers sensibles sont accessibles publiquement en tapant simplement leur adresse ('.implode(', ', $exposes).') — ils peuvent contenir des mots de passe ou des détails internes du site.',
            'recommandation' => "Demander à l'hébergeur ou au développeur de bloquer l'accès à ces fichiers ou de les supprimer du dossier public du site : ils peuvent contenir des mots de passe ou révéler comment le site est construit.",
        ];
    }

    /**
     * Vérifie les enregistrements DNS publics SPF et DMARC du domaine —
     * une simple résolution DNS, sans aucune interaction avec le site.
     */
    private function verifierSecuriteEmail(string $hote): array
    {
        $domaine = $this->domaineRacine($hote);

        $spf = false;
        foreach (@dns_get_record($domaine, DNS_TXT) ?: [] as $enregistrement) {
            if (str_starts_with($enregistrement['txt'] ?? '', 'v=spf1')) {
                $spf = true;
                break;
            }
        }

        $dmarc = false;
        foreach (@dns_get_record('_dmarc.'.$domaine, DNS_TXT) ?: [] as $enregistrement) {
            if (str_starts_with($enregistrement['txt'] ?? '', 'v=DMARC1')) {
                $dmarc = true;
                break;
            }
        }

        if ($spf && $dmarc) {
            return [
                'type' => 'email_securise',
                'statut' => 'conforme',
                'description' => "Le domaine est protégé contre l'usurpation d'identité par email : il est plus difficile pour un escroc d'envoyer un email en se faisant passer pour ce domaine.",
                'recommandation' => null,
            ];
        }

        $manquants = array_keys(array_filter(['SPF' => ! $spf, 'DMARC' => ! $dmarc]));

        return [
            'type' => 'email_securise',
            'statut' => 'non_conforme',
            'description' => "Le domaine n'est pas complètement protégé contre l'usurpation d'identité par email : un escroc pourrait plus facilement envoyer de faux emails semblant provenir de ce domaine (protection(s) manquante(s) : ".implode(', ', $manquants).').',
            'recommandation' => "Demander à l'hébergeur du domaine d'ajouter les protections SPF et DMARC pour empêcher que des escrocs envoient de faux emails qui semblent provenir de ce domaine (hameçonnage).",
        ];
    }

    private function domaineRacine(string $hote): string
    {
        $parties = explode('.', $hote);

        return count($parties) > 2 ? implode('.', array_slice($parties, -2)) : $hote;
    }

    /**
     * @param  array<int, array{type: string, statut: string}>  $resultats
     * @return array{0: int, 1: string}
     */
    /**
     * @return array<string, int>
     */
    private function poidsParType(ParametreScore $bareme): array
    {
        return [
            'https' => $bareme->poids_https,
            'certificat_ssl' => $bareme->poids_certificat_ssl,
            'en_tetes_securite' => $bareme->poids_headers,
            'cookies' => $bareme->poids_cookies,
            'vulnerabilites' => $bareme->poids_vulnerabilites,
            'fichiers_exposes' => $bareme->poids_fichiers_exposes,
            'email_securise' => $bareme->poids_email_securise,
        ];
    }

    private function calculerScore(array $resultats, ParametreScore $bareme): array
    {
        $poidsParType = $this->poidsParType($bareme);

        $score = 0;
        foreach ($resultats as $resultat) {
            if ($resultat['statut'] === 'conforme') {
                $score += $poidsParType[$resultat['type']] ?? 0;
            }
        }

        $score = (int) round($score);

        $niveauRisque = match (true) {
            $score >= $bareme->seuil_bon => 'bon',
            $score >= $bareme->seuil_moyen => 'moyen',
            default => 'faible',
        };

        return [$score, $niveauRisque];
    }
}