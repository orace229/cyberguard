import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { LanguageProvider } from './context/LanguageContext';
import NotificationsToasts from './components/NotificationsToasts';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Accueil from './pages/Accueil';
import AccueilConnecte from './pages/AccueilConnecte';
import MotDePasseOublie from './pages/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';
import EmailVerifie from './pages/EmailVerifie';
import AnalysePublique from './pages/AnalysePublique';
import TableauDeBord from './pages/TableauDeBord';
import NouvelleAnalyse from './pages/NouvelleAnalyse';
import ResultatAnalyse from './pages/ResultatAnalyse';
import Historique from './pages/Historique';
import MonProfil from './pages/MonProfil';
import Tarifs from './pages/Tarifs';
import AdminUtilisateurs from './pages/admin/AdminUtilisateurs';
import AdminAnalyses from './pages/admin/AdminAnalyses';
import AdminStatsParametres from './pages/admin/AdminStatsParametres';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationsProvider>
          <NotificationsToasts />
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMotDePasse />} />
          <Route path="/email-verifie" element={<EmailVerifie />} />
          <Route path="/partage/:token" element={<AnalysePublique />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/accueil" element={<AccueilConnecte />} />
            <Route path="/tableau-de-bord" element={<TableauDeBord />} />
            <Route path="/analyses/nouvelle" element={<NouvelleAnalyse />} />
            <Route path="/analyses/:id" element={<ResultatAnalyse />} />
            <Route path="/historique" element={<Historique />} />
            <Route path="/tarifs" element={<Tarifs />} />
            <Route path="/profil" element={<MonProfil />} />
            <Route
              path="/admin/utilisateurs"
              element={
                <ProtectedRoute adminSeulement>
                  <AdminUtilisateurs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analyses"
              element={
                <ProtectedRoute adminSeulement>
                  <AdminAnalyses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/parametres"
              element={
                <ProtectedRoute adminSeulement>
                  <AdminStatsParametres />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </NotificationsProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
