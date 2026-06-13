import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLogin } from '../hooks/useAuth';
import { useUserStore } from '../stores/useUserStore';

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();
  const user = useUserStore((s) => s.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = error
    ? (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Invalid email or password.'
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { email, password },
      {
        onSuccess: () => {
          // If user has genome, go to /home; otherwise /onboarding
          navigate('/home', { replace: true });
        },
      }
    );
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-medium)',
    borderRadius: 'var(--radius-md)',
    padding: '0 var(--space-4)',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'border-color var(--duration-fast) var(--ease-out-expo)',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-2)',
    letterSpacing: '0.03em',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 300,
              color: 'var(--color-accent-primary)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            paliato
          </span>
        </div>

        <Card variant="elevated">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 300,
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--space-6)',
              letterSpacing: '0.01em',
            }}
          >
            Welcome back.
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-medium)'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-primary)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-medium)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'rgba(252, 165, 165, 1)',
                  margin: 0,
                }}
              >
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isPending}
              style={{ width: '100%', height: '48px' }}
            >
              Sign in
            </Button>
          </form>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              marginTop: 'var(--space-6)',
              marginBottom: 0,
            }}
          >
            New to Paliato?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--color-accent-primary)',
                textDecoration: 'none',
              }}
            >
              Create your profile →
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
