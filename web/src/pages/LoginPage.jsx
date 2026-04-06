import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="icon pulse" style={{ fontSize: '3rem', color: 'var(--gold)', position: 'relative' }}>
          🌙
        </div>
        <h1>Pray4Me</h1>
        <p>Request duas from Muslims<br/>at the holiest sites</p>
      </div>

      <div className="login-buttons">
        <p className="subheading" style={{ color: 'var(--charcoal)', marginBottom: 8 }}>
          Sign in to continue
        </p>

        <button className="btn btn-outline" onClick={signIn}>
          <span>🔵</span> Continue with Google
        </button>

        <button className="btn" style={{ background: '#000', color: '#fff' }} onClick={signIn}>
          <span></span> Continue with Apple
        </button>

        <button className="btn" style={{ background: 'var(--blue-fb)', color: '#fff' }} onClick={signIn}>
          <span>f</span> Continue with Facebook
        </button>

        <p className="caption" style={{ marginTop: 16 }}>
          In demo mode — click any button to sign in as a test user
        </p>
      </div>
    </div>
  );
}
