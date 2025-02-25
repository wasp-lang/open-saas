import { type AuthUser } from 'wasp/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRedirectHomeUnlessUserIsAdmin({ user }: { user: AuthUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.isAdmin) {
      navigate('/');
    }
  }, [user, history]);
}
