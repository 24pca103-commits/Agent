import React, { useState } from 'react';
import {
  Bot,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Sun,
  Moon,
  Globe2,
  Briefcase
} from 'lucide-react';
import { AuthUser } from '../types';
import { loginUser, signupUser, demoLogin } from '../utils/authStorage';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  theme = 'dark',
  onToggleTheme
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotMsg(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const res = await loginUser(email, password, rememberMe);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMessage(res.message || 'Login failed. Please verify credentials.');
        }
      } else {
        const res = await signupUser(name, company, email, password, rememberMe);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMessage(res.message || 'Account registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setErrorMessage(null);
    setForgotMsg(null);
    const user = demoLogin();
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col justify-between bg-[#f7f7f8] dark:bg-[#212121] text-neutral-900 dark:text-[#ececec] font-sans transition-colors relative selection:bg-[#10a37f]/25 overflow-x-hidden">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-neutral-200/70 dark:border-white/5 bg-white/80 dark:bg-[#212121]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm shadow-sm">
            <Bot className="w-5 h-5 text-[#10a37f]" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white block">
              LeadPilot AI
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-[#9e9e9e] font-medium block">
              DataGalactic Autonomous Agent
            </span>
          </div>
        </div>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-700 dark:text-[#d4d4d4] hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            )}
          </button>
        )}
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[440px] bg-white dark:bg-[#171717] border border-neutral-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-all">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#262626] border border-neutral-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Bot className="w-7 h-7 text-[#10a37f]" />
            </div>

            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {authMode === 'login' ? 'Sign in to LeadPilot AI' : 'Create an account'}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-1 max-w-sm mx-auto leading-relaxed">
              {authMode === 'login'
                ? 'Enter your credentials to manage B2B clients, export buyers, and automated campaigns.'
                : 'Join DataGalactic to deploy high-precision AI lead sourcing and cold email automation.'}
            </p>

            {/* Mode Preview Badges */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-[#d4d4d4] text-[10px] font-medium border border-neutral-200 dark:border-white/10">
                <Briefcase className="w-3 h-3 text-[#10a37f]" />
                <span>Mode A: 10 B2B Services</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-[#d4d4d4] text-[10px] font-medium border border-neutral-200 dark:border-white/10">
                <Globe2 className="w-3 h-3 text-[#10a37f]" />
                <span>Mode B: Export Trade</span>
              </span>
            </div>
          </div>

          {/* Tab Selector: Sign in vs Create Account */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200/80 dark:border-white/5 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
                setForgotMsg(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white dark:bg-[#2f2f2f] text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
                setForgotMsg(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-[#2f2f2f] text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Forgot Message Info */}
          {forgotMsg && (
            <div className="p-3 mb-4 rounded-xl bg-[#10a37f]/10 border border-[#10a37f]/30 text-[#0e906f] dark:text-[#34d399] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{forgotMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Risona"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#10a37f] dark:focus:border-[#10a37f] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. DataGalactic"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#10a37f] dark:focus:border-[#10a37f] transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1">
                Business Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@datagalactic.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#10a37f] dark:focus:border-[#10a37f] transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-[#d4d4d4]">
                  Password
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMsg('Demo accounts: enter password "admin" or use One-Click Demo Access below.');
                    }}
                    className="text-[11px] text-[#10a37f] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#10a37f] dark:focus:border-[#10a37f] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-600 dark:text-[#b4b4b4]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#10a37f] focus:ring-[#10a37f] bg-white dark:bg-[#212121] border-neutral-300 dark:border-white/20"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm mt-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Sign In to Agent' : 'Create Account & Launch'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-white/10" />
            </div>
            <span className="relative px-3 bg-white dark:bg-[#171717] text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-[#8e8e8e]">
              Or Instant Demo Access
            </span>
          </div>

          {/* One-Click Demo Access Button */}
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-[#262626] hover:bg-neutral-200 dark:hover:bg-[#333333] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#10a37f]" />
            <span>One-Click Login (Founder: {DATAGALACTIC_COMPANY.founder || 'Risona'})</span>
          </button>

          {/* Demo credential info */}
          <div className="mt-4 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200/80 dark:border-white/5 text-[11px] text-neutral-500 dark:text-[#9e9e9e] flex items-center justify-between">
            <span>Demo Email: <code className="font-mono text-neutral-800 dark:text-[#ececec]">contact@datagalactic.com</code></span>
            <span>Password: <code className="font-mono text-neutral-800 dark:text-[#ececec]">admin</code></span>
          </div>

          {/* Security & Compliance Footer */}
          <div className="mt-5 pt-4 border-t border-neutral-200/70 dark:border-white/5 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 dark:text-[#8e8e8e] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10a37f]" />
              <span>Protected Session • Human-in-the-Loop Safe</span>
            </div>
            <p className="text-[10px] text-neutral-400 dark:text-[#737373]">
              Supports Supabase PostgreSQL & local encrypted session caching
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-neutral-500 dark:text-[#8e8e8e] border-t border-neutral-200/70 dark:border-white/5">
        <span>© {new Date().getFullYear()} {DATAGALACTIC_COMPANY.name} • Precision Beyond Limits</span>
      </footer>
    </div>
  );
};
