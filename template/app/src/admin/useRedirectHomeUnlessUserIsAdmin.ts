import { type AuthUser } from 'wasp/auth';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export function useRedirectHomeUnlessUserIsAdmin({ user }: { user: AuthUser }) {
  const history = useHistory();

  useEffect(() => {
    if (!user.isAdmin) {
      history.push('/');
    }
  }, [user, history]);
}
