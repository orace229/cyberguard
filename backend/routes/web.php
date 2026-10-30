<?php

use Illuminate\Support\Facades\Route;

// Sert l'application frontend React (SPA) pour toute route web
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api|sanctum).*$');
