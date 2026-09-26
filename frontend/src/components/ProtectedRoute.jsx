import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children, adminSeulement = false }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return <Spinner />;
  }

  if (!utilisateur) {
    return <Navigate to="/" replace />;
  }

  if (adminSeulement && utilisateur.role !== 'administrateur') {
    return <Navigate to="/accueil" replace />;
  }

  return children;
}
