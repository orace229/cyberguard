<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport d'analyse - {{ $analyse->url }}</title>
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; margin: 0; padding: 0; }
  .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px; }
  .header h1 { font-size: 18px; margin: 0 0 4px; }
  .header .url { font-size: 13px; color: #333; word-break: break-all; }
  .meta { font-size: 10.5px; color: #555; margin-top: 6px; }

  .score-box { display: table; width: 100%; margin-bottom: 22px; }
  .score-circle {
    display: table-cell; width: 90px; height: 90px; border: 3px solid #111; border-radius: 50%;
    text-align: center; vertical-align: middle; font-size: 26px; font-weight: bold;
  }
  .score-info { display: table-cell; vertical-align: middle; padding-left: 18px; }
  .risque-pill {
    display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: bold;
    border: 1px solid #111;
  }
  .risque-bon { background: #e6f4ea; }
  .risque-moyen { background: #fff4e0; }
  .risque-faible { background: #fbe4e4; }

  h2.section { font-size: 13px; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid #111; padding-bottom: 4px; margin: 22px 0 10px; }

  table.controles { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  table.controles th, table.controles td { border: 1px solid #999; padding: 6px 8px; text-align: left; vertical-align: top; font-size: 10.5px; }
  table.controles th { background: #eee; }
  .statut-conforme { color: #1a7a3c; font-weight: bold; }
  .statut-non_conforme { color: #b3261e; font-weight: bold; }

  .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #999; font-size: 9.5px; color: #777; text-align: center; }

  .plan-action { margin: 0 0 6px; }
  .plan-action-item { border: 1px solid #111; border-left: 5px solid #111; padding: 8px 10px; margin-bottom: 8px; }
  .plan-action-entete { font-size: 11.5px; font-weight: bold; margin-bottom: 3px; }
  .plan-action-rang { display: inline-block; width: 16px; height: 16px; border-radius: 50%; background: #111; color: #fff; text-align: center; font-size: 10px; line-height: 16px; margin-right: 6px; }
  .plan-action-impact { float: right; font-size: 10px; font-weight: normal; color: #333; }
  .plan-action-desc { font-size: 10.5px; color: #333; margin: 2px 0 0; }
  .plan-action-vide { font-size: 11px; color: #1a7a3c; font-weight: bold; }
</style>
</head>
<body>
@php
  $libellesType = [
    'https' => 'HTTPS',
    'certificat_ssl' => 'Certificat SSL',
    'en_tetes_securite' => 'En-têtes de sécurité',
    'cookies' => 'Cookies',
    'vulnerabilites' => 'Vulnérabilités',
    'fichiers_exposes' => 'Fichiers exposés',
    'email_securise' => 'Sécurité email (SPF/DMARC)',
  ];
  $prioritaires = $analyse->resultatsVerification
    ->where('statut', 'non_conforme')
    ->sortByDesc('poids')
    ->take(3);
@endphp

  <div class="header">
    <h1>CyberGuard Bénin — Rapport d'analyse de sécurité</h1>
    <div class="url">{{ $analyse->url }}</div>
    <div class="meta">
      Analyse réalisée le {{ $analyse->date_analyse->format('d/m/Y à H:i') }}
      pour {{ $analyse->utilisateur->nom }}
    </div>
  </div>

  <div class="score-box">
    <div class="score-circle">{{ $analyse->score }}</div>
    <div class="score-info">
      <div class="risque-pill risque-{{ $analyse->niveau_risque }}">
        Niveau de risque : {{ ucfirst($analyse->niveau_risque) }}
      </div>
      <p style="margin: 8px 0 0;">
        Score global sur 100, calculé à partir des contrôles ci-dessous et du
        barème de pondération en vigueur.
      </p>
    </div>
  </div>

  <h2 class="section">Plan d'action prioritaire</h2>
  <div class="plan-action">
    @if ($prioritaires->isEmpty())
      <p class="plan-action-vide">Tous les contrôles sont conformes — aucune action corrective nécessaire.</p>
    @else
      <p style="font-size: 10.5px; color: #333; margin: 0 0 8px;">
        Les {{ $prioritaires->count() }} points ci-dessous ont le plus d'impact potentiel sur le score, par ordre de priorité.
      </p>
      @foreach ($prioritaires as $controle)
        <div class="plan-action-item">
          <div class="plan-action-entete">
            <span class="plan-action-rang">{{ $loop->iteration }}</span>
            {{ $libellesType[$controle->type] ?? $controle->type }}
            <span class="plan-action-impact">Impact potentiel : +{{ $controle->poids }} point(s)</span>
          </div>
          <p class="plan-action-desc">{{ $controle->recommandation ?? $controle->description }}</p>
        </div>
      @endforeach
    @endif
  </div>

  <h2 class="section">Détail des contrôles</h2>
  <table class="controles">
    <thead>
      <tr>
        <th style="width: 18%;">Contrôle</th>
        <th style="width: 12%;">Statut</th>
        <th style="width: 38%;">Constat</th>
        <th style="width: 32%;">Recommandation</th>
      </tr>
    </thead>
    <tbody>
      @foreach ($analyse->resultatsVerification as $controle)
        <tr>
          <td>{{ $libellesType[$controle->type] ?? $controle->type }}</td>
          <td class="statut-{{ $controle->statut }}">
            {{ $controle->statut === 'conforme' ? 'Conforme' : 'Non conforme' }}
          </td>
          <td>{{ $controle->description }}</td>
          <td>{{ $controle->recommandation ?? '—' }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <div class="footer">
    CyberGuard Bénin — Rapport généré automatiquement le {{ now()->format('d/m/Y à H:i') }}.
    Les vérifications effectuées sont non intrusives et ne constituent pas un audit de sécurité complet.
  </div>

</body>
</html>
