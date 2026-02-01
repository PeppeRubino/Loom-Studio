import { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Loader2, LogIn } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/useAuth';
import { useLanguage } from '@/features/i18n/useLanguage';
import logo from '@/assets/icon.png';

export const LoginPage = () => {
  const { user, signInWithGoogle, signInAsGuest, signInWithEmail, registerWithEmail, loading, error } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/app';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [from, navigate, user]);

  const handleEmailSubmit = async () => {
    if (mode === 'login') {
      await signInWithEmail(email, password);
    } else {
      await registerWithEmail(email, password);
    }
  };

  return (
    <div className="user-select-none flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md bg-white/80 p-6 ">
        <div className="mb-5 space-y-1 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <img src={logo} alt="Loom" className="h-10 w-10 object-contain" />
          </div>
          <p className="text-lg font-semibold text-[#0f172a]">{t('login.title')}</p>
          <p className="text-sm text-[#475569]">{t('login.subtitle')}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Input
              placeholder={t('login.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder={t('login.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              onClick={handleEmailSubmit}
              disabled={loading}
              variant="primary"
              className="w-full rounded-full"
            >
              {mode === 'login' ? t('login.signin') : t('login.signup')}
            </Button>
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
              className="w-full text-center text-xs font-semibold text-[#475569] hover:text-[#0f172a]"
            >
              {mode === 'login' ? t('login.switchToSignup') : t('login.switchToLogin')}
            </button>
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.3em] text-[#cbd5e1]">
              <span className="h-px flex-1 bg-[#e2e8f0]" />
              <span>{t('common.or', 'oppure')}</span>
              <span className="h-px flex-1 bg-[#e2e8f0]" />
            </div>
          </div>

          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            variant="secondary"
            className="flex w-full items-center justify-center gap-3 rounded-full bg-white/90 text-[#0f172a]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FcGoogle size={18} />}
            <span>{t('login.google')}</span>
          </Button>

          <Button
            type="button"
            onClick={signInAsGuest}
            variant="ghost"
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-[#0f172a]"
          >
            <LogIn size={16} /> {t('login.guest')}
          </Button>
        </div>

        {error && <p className="mt-3 text-center text-sm text-[#b11226]">{error}</p>}
      </Card>
    </div>
  );
};

