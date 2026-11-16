import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Sun,
  Moon,
  Globe2,
  Briefcase,
  KeyRound,
  RotateCw,
  ArrowLeft,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AuthUser } from '../types';
import {
  loginWithPasswordAndSendOtp,
  verifyLoginOtp,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  signupUser,
  demoLogin
} from '../utils/authStorage';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

type AuthView =
  | 'login'                 // Default: Email + Password entry with "Forgot password?"
  | 'verify_login_otp'      // 2FA: Real-time 6-digit verification code after password
  | 'forgot_request'        // Reset step 1: Enter email for reset code
  | 'forgot_verify'         // Reset step 2: 6-digit code + New Password + Confirm Password
  | 'signup';               // Create new account

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  theme = 'dark',
  onToggleTheme
}) => {
  const [view, setView] = useState<AuthView>('login');

  // Input Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // New Password & Confirm (for Reset Password)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Signup Fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  // 6-Digit Code State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Real-time Feedback & Delivery Info
  const [devCode, setDevCode] = useState<string | null>(null);
  const [sentViaSmtp, setSentViaSmtp] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [rememberMe, setRememberMe] = useState(true);

  // Status Banners
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Countdown Timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Autofocus first OTP digit box when entering verification views
  useEffect(() => {
    if (view === 'verify_login_otp' || view === 'forgot_verify') {
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [view]);

  // Clear messages when view changes
  const switchView = (nextView: AuthView) => {
    setView(nextView);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpDigits(['', '', '', '', '', '']);
  };

  // ---------------------------------------------------------------------------
  // 1. MAIN LOGIN FLOW: Email + Password -> Validates & Dispatches Real OTP
  // ---------------------------------------------------------------------------
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your business email.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      return;
    }
    if (cleanPass.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithPasswordAndSendOtp(cleanEmail, cleanPass);
      if (res.success && res.requiresOtp) {
        setView('verify_login_otp');
        setDevCode(res.devCode || null);
        setSentViaSmtp(!!res.sentViaSmtp);
        setResendCountdown(45);
        setSuccessMessage(res.message || 'Password verified! We sent a 6-digit code to your email.');
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrorMessage(res.message || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. VERIFY LOGIN 6-DIGIT OTP
  // ---------------------------------------------------------------------------
  const handleVerifyLoginOtp = async (codeToVerify?: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = (codeToVerify || otpDigits.join('')).trim();
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyLoginOtp(email, fullCode, rememberMe);
      if (res.success && res.user) {
        setSuccessMessage('Identity verified! Launching LeadPilot AI...');
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 300);
      } else {
        setErrorMessage(res.message || 'Incorrect verification code. Please check your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. RESET PASSWORD STEP 1: Request 6-Digit Reset Code to Email
  // ---------------------------------------------------------------------------
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordResetOtp(cleanEmail);
      if (res.success) {
        setView('forgot_verify');
        setDevCode(res.devCode || null);
        setSentViaSmtp(!!res.sentViaSmtp);
        setResendCountdown(45);
        setSuccessMessage(res.message || 'Password reset code sent to your email.');
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrorMessage(res.message || 'Failed to send password reset code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error requesting reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. RESET PASSWORD STEP 2: Verify Code & Update New Password
  // ---------------------------------------------------------------------------
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = otpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit reset code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithOtp(email, fullCode, newPassword);
      if (res.success) {
        setPassword(newPassword);
        setView('login');
        setSuccessMessage('Password reset successfully! Please sign in with your new password.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(res.message || 'Password reset failed. Invalid or expired code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating password.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. SIGNUP FLOW
  // ---------------------------------------------------------------------------
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your business email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signupUser(name, company, email, password, rememberMe);
      if (res.success && res.user) {
        setSuccessMessage('Account created successfully! Launching LeadPilot AI...');
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 300);
      } else {
        setErrorMessage(res.message || 'Account registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating account.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. 6-Digit OTP Box Handlers (Auto-advance, Backspace, Paste)
  // ---------------------------------------------------------------------------
  const handleDigitChange = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 1) {
      handlePastedCode(digitsOnly);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = digitsOnly;
    setOtpDigits(nextDigits);

    if (digitsOnly && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }

    const completed = nextDigits.join('');
    if (completed.length === 6 && !nextDigits.includes('')) {
      if (view === 'verify_login_otp') {
        handleVerifyLoginOtp(completed);
      }
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePastedCode = (pasted: string) => {
    const clean = pasted.replace(/\D/g, '').slice(0, 6);
    if (!clean) return;

    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < clean.length; i++) {
      nextDigits[i] = clean[i];
    }
    setOtpDigits(nextDigits);

    if (clean.length === 6) {
      digitInputRefs.current[5]?.focus();
      if (view === 'verify_login_otp') {
        handleVerifyLoginOtp(clean);
      }
    } else {
      digitInputRefs.current[clean.length]?.focus();
    }
  };

  const handleAutoFillCode = (code: string) => {
    handlePastedCode(code);
  };

  // Demo Login Bypass
  const handleDemoAccess = () => {
    setErrorMessage(null);
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
              {view === 'verify_login_otp' ? (
                <ShieldCheck className="w-7 h-7 text-[#10a37f]" />
              ) : view === 'forgot_request' || view === 'forgot_verify' ? (
                <KeyRound className="w-7 h-7 text-amber-500" />
              ) : (
                <Bot className="w-7 h-7 text-[#10a37f]" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {view === 'login' && 'Sign in to LeadPilot AI'}
              {view === 'verify_login_otp' && 'Enter verification code'}
              {view === 'forgot_request' && 'Reset your password'}
              {view === 'forgot_verify' && 'Set new password'}
              {view === 'signup' && 'Create founder account'}
            </h1>

            <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-1 max-w-sm mx-auto leading-relaxed">
              {view === 'login' && 'Enter your business email and password to access the autonomous agent.'}
              {view === 'verify_login_otp' && `Password verified! Enter the 6-digit security code sent to ${email}.`}
              {view === 'forgot_request' && 'Enter your account email to receive a real-time 6-digit password reset code.'}
              {view === 'forgot_verify' && `Enter the 6-digit code sent to ${email} and choose your new password.`}
              {view === 'signup' && 'Register your company profile to launch autonomous lead generation.'}
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

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#10a37f] text-xs flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 1: MAIN LOGIN (Email + Password with "Forgot password?")      */}
          {/* ================================================================= */}
          {view === 'login' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              {/* Business Email */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1.5">
                  Business Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@datagalactic.com"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] transition-all"
                  />
                </div>
              </div>

              {/* Password with Show/Hide and Forgot Password link */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView('forgot_request')}
                    className="text-xs font-medium text-[#10a37f] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Default Password Helper Pill */}
                <div className="mt-2 p-2 rounded-xl bg-neutral-100 dark:bg-[#262626] border border-neutral-200 dark:border-white/10 text-xs flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-[#d4d4d4] text-[11px]">
                    🔑 Default Password: <strong className="font-mono text-[#10a37f] font-bold">admin</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassword('admin')}
                    className="px-2 py-0.5 rounded-md bg-[#10a37f]/10 text-[#10a37f] hover:bg-[#10a37f]/20 font-semibold text-[11px] transition-colors"
                  >
                    Auto-fill 'admin'
                  </button>
                </div>
              </div>

              {/* Quick autofill buttons for testing */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-neutral-400 dark:text-[#8e8e8e]">Quick access:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('kan93095@gmail.com');
                    setPassword('admin');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:text-[#10a37f] hover:bg-[#10a37f]/10 border border-neutral-200 dark:border-white/5 transition-colors"
                >
                  kan93095@gmail.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('founder@datagalactic.com');
                    setPassword('admin');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:text-[#10a37f] hover:bg-[#10a37f]/10 border border-neutral-200 dark:border-white/5 transition-colors"
                >
                  founder@datagalactic.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('contact@datagalactic.com');
                    setPassword('admin');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:text-[#10a37f] hover:bg-[#10a37f]/10 border border-neutral-200 dark:border-white/5 transition-colors"
                >
                  contact@datagalactic.com
                </button>
              </div>

              {/* Keep me signed in */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-600 dark:text-[#a3a3a3]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-300 dark:border-white/20 text-[#10a37f] focus:ring-[#10a37f]"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#10a37f] hover:bg-[#0e8e6e] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying credentials & sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In & Verify</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================================================================= */}
          {/* VIEW 2: LOGIN 2FA VERIFICATION CODE SCREEN                        */}
          {/* ================================================================= */}
          {view === 'verify_login_otp' && (
            <div className="space-y-4">
              {/* Account summary banner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200 dark:border-white/5 text-xs">
                <div className="truncate mr-2">
                  <span className="text-neutral-500 dark:text-[#8e8e8e]">Account: </span>
                  <strong className="text-neutral-900 dark:text-white font-medium">{email}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-[#10a37f] hover:underline font-semibold shrink-0 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* Real-time Code Live Badge */}
              {devCode && (
                <div className="p-3 rounded-xl bg-[#10a37f]/10 border border-[#10a37f]/30 flex items-center justify-between text-xs animate-fadeIn">
                  <div>
                    <span className="text-neutral-600 dark:text-[#d4d4d4] block text-[11px]">
                      ⚡ Real-time Verification Code:
                    </span>
                    <span className="font-mono text-base font-bold text-[#10a37f] tracking-widest">
                      {devCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutoFillCode(devCode)}
                    className="px-2.5 py-1 rounded-lg bg-[#10a37f] text-white text-[11px] font-semibold hover:bg-[#0e8e6e] transition-colors"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {/* 6 Individual Digit Inputs */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-2 text-center">
                  Enter 6-digit code sent to your email
                </label>
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (digitInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        handlePastedCode(e.clipboardData.getData('text'));
                      }}
                      className="w-full aspect-square text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white focus:outline-none focus:border-[#10a37f] focus:ring-2 focus:ring-[#10a37f]/20 transition-all select-all"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Action Button */}
              <button
                type="button"
                onClick={() => handleVerifyLoginOtp()}
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-[#10a37f] hover:bg-[#0e8e6e] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying & Opening Agent...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Open Agent</span>
                  </>
                )}
              </button>

              {/* Resend Code */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-neutral-500 dark:text-[#8e8e8e]">
                  Didn't receive email code?
                </span>
                {resendCountdown > 0 ? (
                  <span className="text-neutral-400 dark:text-[#6e6e6e] font-mono">
                    Resend in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handlePasswordLogin(e)}
                    disabled={isLoading}
                    className="text-[#10a37f] hover:underline font-semibold flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Resend code</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 3: FORGOT PASSWORD - REQUEST RESET CODE                      */}
          {/* ================================================================= */}
          {view === 'forgot_request' && (
            <form onSubmit={handleRequestResetCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@datagalactic.com"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-[#8e8e8e] mt-1.5">
                  We will send a real-time 6-digit password reset code to this email.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Sending reset code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-neutral-500 dark:text-[#8e8e8e] hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* VIEW 4: FORGOT PASSWORD - VERIFY CODE & SET NEW PASSWORD          */}
          {/* ================================================================= */}
          {view === 'forgot_verify' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              {/* Account summary banner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200 dark:border-white/5 text-xs">
                <div className="truncate mr-2">
                  <span className="text-neutral-500 dark:text-[#8e8e8e]">Resetting for: </span>
                  <strong className="text-neutral-900 dark:text-white">{email}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => switchView('forgot_request')}
                  className="text-amber-500 hover:underline font-medium shrink-0 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* Real-time Code Live Badge */}
              {devCode && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs animate-fadeIn">
                  <div>
                    <span className="text-neutral-600 dark:text-[#d4d4d4] block text-[11px]">
                      🔑 Real-time Reset Code:
                    </span>
                    <span className="font-mono text-base font-bold text-amber-500 tracking-widest">
                      {devCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutoFillCode(devCode)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[11px] font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {/* 6 Individual Digit Inputs */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-2 text-center">
                  Enter 6-digit Reset Code
                </label>
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (digitInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        handlePastedCode(e.clipboardData.getData('text'));
                      }}
                      className="w-full aspect-square text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all select-all"
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit Reset Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Reset Password & Sign In</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-neutral-500 dark:text-[#8e8e8e] hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Cancel & Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* VIEW 5: CREATE ACCOUNT (SIGNUP)                                  */}
          {/* ================================================================= */}
          {view === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Risona"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-xs focus:outline-none focus:border-[#10a37f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="DataGalactic"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-xs focus:outline-none focus:border-[#10a37f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@datagalactic.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-xs focus:outline-none focus:border-[#10a37f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white placeholder-neutral-400 text-xs focus:outline-none focus:border-[#10a37f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#10a37f] hover:bg-[#0e8e6e] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account & Continue</span>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-neutral-500 dark:text-[#8e8e8e] hover:text-[#10a37f]"
                >
                  Already have an account? <strong className="underline">Sign In</strong>
                </button>
              </div>
            </form>
          )}

          {/* Footer Options & Quick Switchers */}
          <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-white/5 space-y-2.5 text-center">
            {view === 'login' && (
              <div className="flex items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => switchView('signup')}
                  className="text-neutral-500 dark:text-[#8e8e8e] hover:text-[#10a37f] transition-colors"
                >
                  Don't have an account? <strong className="underline">Sign up</strong>
                </button>
              </div>
            )}

            {/* Founder Quick Access Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDemoAccess}
                title="Instant Founder Access"
                className="w-full py-2 px-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#212121] hover:bg-neutral-100 dark:hover:bg-[#2a2a2a] text-neutral-600 dark:text-[#a3a3a3] hover:text-neutral-900 dark:hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#10a37f]" />
                <span>One-Click Demo Access (Founder: {DATAGALACTIC_COMPANY.founder || 'Risona'})</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center border-t border-neutral-200/70 dark:border-white/5 text-[11px] text-neutral-500 dark:text-[#8e8e8e] bg-white/50 dark:bg-[#171717]/50 backdrop-blur-sm">
        <p>
          DataGalactic LeadPilot AI • Autonomous B2B & Export Trade Agent Engine
        </p>
      </footer>
    </div>
  );
};
