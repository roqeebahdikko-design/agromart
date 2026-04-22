import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyOAuthToken, fetchProfile } from '../features/auth/authSlice';

function OAuthSuccessPage() {
  const [params] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = params.get('token');

    if (token) {
      dispatch(applyOAuthToken(token));

      dispatch(fetchProfile())
        .then(() => {
          navigate('/dashboard');
        })
        .catch(() => {
          navigate('/login');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      navigate('/login');
      setLoading(false);
    }
  }, [dispatch, navigate, params]);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      {loading && <h2>Processing login...</h2>}
    </div>
  );
}



export default OAuthSuccessPage;
