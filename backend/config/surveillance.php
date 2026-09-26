<?php

return [

    /*
    |--------------------------------------------------------------------
    | Surveillance continue — re-scan périodique (opt-in)
    |--------------------------------------------------------------------
    |
    | Le re-scan automatique déclenche les mêmes requêtes réseau sortantes
    | qu'une analyse manuelle : "lot_max" plafonne le nombre d'analyses
    | relancées à chaque exécution planifiée, pour éviter de bombarder des
    | cibles tierces ou de saturer la file d'attente (même logique que le
    | throttle sur POST /analyses).
    |
    */

    'lot_max' => (int) env('SURVEILLANCE_LOT_MAX', 20),

    'intervalle_jours' => (int) env('SURVEILLANCE_INTERVALLE_JOURS', 7),

];
