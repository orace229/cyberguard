<?php

namespace Tests\Unit;

use App\Models\ParametreScore;
use App\Services\AnalyseSecuriteService;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionMethod;
use Tests\TestCase;

/**
 * Tests de la logique pure du moteur d'analyse (protection SSRF, calcul du
 * score) — sans appel réseau, donc rapides et déterministes. Les
 * vérifications qui font de vraies requêtes (HTTP, certificat, DNS) sont
 * volontairement hors du périmètre de ces tests automatisés et vérifiées
 * manuellement contre des sites réels.
 */
class AnalyseSecuriteServiceTest extends TestCase
{
    private AnalyseSecuriteService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AnalyseSecuriteService();
    }

    #[DataProvider('adressesPriveesOuReservees')]
    public function test_bloque_les_adresses_privees_et_reservees(string $ip): void
    {
        $this->assertFalse($this->service->hoteEstAutorise($ip));
    }

    public static function adressesPriveesOuReservees(): array
    {
        return [
            'loopback IPv4' => ['127.0.0.1'],
            'loopback IPv6' => ['::1'],
            'reseau prive classe A' => ['10.0.0.5'],
            'reseau prive classe B' => ['172.16.5.5'],
            'reseau prive classe C' => ['192.168.1.1'],
            'lien local / metadonnees cloud' => ['169.254.169.254'],
            'reseau prive IPv6' => ['fc00::1'],
        ];
    }

    #[DataProvider('adressesPubliques')]
    public function test_autorise_les_adresses_ip_publiques(string $ip): void
    {
        $this->assertTrue($this->service->hoteEstAutorise($ip));
    }

    public static function adressesPubliques(): array
    {
        return [
            'dns google' => ['8.8.8.8'],
            'dns cloudflare' => ['1.1.1.1'],
        ];
    }

    public function test_calcule_un_score_nul_si_tout_est_non_conforme(): void
    {
        [$score, $niveau] = $this->invoquerCalculerScore(
            $this->tousLesTypes('non_conforme'),
            $this->bareme()
        );

        $this->assertSame(0, $score);
        $this->assertSame('faible', $niveau);
    }

    public function test_calcule_le_score_complet_si_tout_est_conforme(): void
    {
        [$score, $niveau] = $this->invoquerCalculerScore(
            $this->tousLesTypes('conforme'),
            $this->bareme()
        );

        $this->assertSame(100, $score);
        $this->assertSame('bon', $niveau);
    }

    public function test_le_niveau_de_risque_respecte_les_seuils_configures(): void
    {
        $bareme = $this->bareme(['poids_https' => 40, 'poids_certificat_ssl' => 0, 'poids_headers' => 0, 'poids_cookies' => 0, 'poids_vulnerabilites' => 0, 'poids_fichiers_exposes' => 0, 'poids_email_securise' => 0]);

        [$score, $niveau] = $this->invoquerCalculerScore(
            [['type' => 'https', 'statut' => 'conforme']],
            $bareme
        );

        $this->assertSame(40, $score);
        $this->assertSame('moyen', $niveau);
    }

    public function test_un_type_de_controle_inconnu_ne_contribue_pas_au_score(): void
    {
        [$score] = $this->invoquerCalculerScore(
            [['type' => 'controle_qui_nexiste_pas', 'statut' => 'conforme']],
            $this->bareme()
        );

        $this->assertSame(0, $score);
    }

    private function tousLesTypes(string $statut): array
    {
        return collect(['https', 'certificat_ssl', 'en_tetes_securite', 'cookies', 'vulnerabilites', 'fichiers_exposes', 'email_securise'])
            ->map(fn (string $type) => ['type' => $type, 'statut' => $statut])
            ->all();
    }

    private function bareme(array $surcharge = []): ParametreScore
    {
        return new ParametreScore(array_merge([
            'poids_https' => 20,
            'poids_certificat_ssl' => 15,
            'poids_headers' => 25,
            'poids_cookies' => 10,
            'poids_vulnerabilites' => 15,
            'poids_fichiers_exposes' => 10,
            'poids_email_securise' => 5,
            'seuil_bon' => 75,
            'seuil_moyen' => 40,
        ], $surcharge));
    }

    private function invoquerCalculerScore(array $resultats, ParametreScore $bareme): array
    {
        $methode = new ReflectionMethod($this->service, 'calculerScore');
        $methode->setAccessible(true);

        return $methode->invoke($this->service, $resultats, $bareme);
    }
}
