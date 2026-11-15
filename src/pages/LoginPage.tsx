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
  Sparkles
} from 'lucide-react';
import { AuthUser } from '../types';
import {
  loginUser,
  signupUser,
  demoLogin,
  requestOtp,
  verifyOtp
} from '../utils/authStorage';
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
  // Main Authentication mode: 'otp' (Real-time Email Verification) | 'password' | 'signup'
  const [authMode, setAuthMode] = useState<'otp' | 'password' | 'signup'>('otp');

  // OTP Flow Steps: 'request' (enter email) -> 'verify' (enter 6-digit code)
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [sentViaSmtp, setSentViaSmtp] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Digit Input Refs
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Focus first OTP box when entering verify step
  useEffect(() => {
    if (otpStep === 'verify') {
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpStep]);

  // STEP 1: Request Real-time OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your business email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestOtp(cleanEmail);
      if (res.success) {
        setOtpStep('verify');
        setDevCode(res.devCode || null);
        setSentViaSmtp(!!res.sentViaSmtp);
        setResendCountdown(45);
        setSuccessMessage(res.message);
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrorMessage(res.message || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while requesting verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify Real-time OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = (codeToVerify || otpDigits.join('')).trim();
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtp(email, fullCode, rememberMe);
      if (res.success && res.user) {
        setSuccessMessage('Code verified! Opening LeadPilot AI...');
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 300);
      } else {
        setErrorMessage(res.message || 'Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify code.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Digit Box Handlers
  const handleDigitChange = (index: number, value: string) => {
    // If user pasted or typed multiple digits
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 1) {
      handlePastedCode(digitsOnly);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = digitsOnly;
    setOtpDigits(nextDigits);

    // Auto-advance to next input
    if (digitsOnly && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits are now filled
    const completedCode = nextDigits.join('');
    if (completedCode.length === 6 && !nextDigits.includes('')) {
      handleVerifyOtp(completedCode);
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
      handleVerifyOtp(clean);
    } else {
      digitInputRefs.current[clean.length]?.focus();
    }
  };

  const handleAutoFillCode = (code: string) => {
    handlePastedCode(code);
  };

  // Password / Signup Fallback Handlers
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'password') {
        const res = await loginUser(email, password, rememberMe);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMessage(res.message || 'Login failed. Please check credentials.');
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
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
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
              {authMode === 'otp' && otpStep === 'verify' ? (
                <ShieldCheck className="w-7 h-7 text-[#10a37f]" />
              ) : (
                <Bot className="w-7 h-7 text-[#10a37f]" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {authMode === 'otp'
                ? otpStep === 'request'
                  ? 'Sign in to LeadPilot AI'
                  : 'Enter verification code'
                : authMode === 'password'
                ? 'Sign in with Password'
                : 'Create an account'}
            </h1>

            <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-1 max-w-sm mx-auto leading-relaxed">
              {authMode === 'otp'
                ? otpStep === 'request'
                  ? 'Enter your business email. We will send you a real-time 6-digit code to access the agent.'
                  : `We sent a 6-digit verification code to ${email || 'your email'}. Enter it below to launch the agent.`
                : authMode === 'password'
                ? 'Enter your registered email and password to access the workspace.'
                : 'Create your founder account to launch autonomous B2B lead generation campaigns.'}
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

          {/* ============================================================== */}
          {/* PRIMARY FLOW: REAL-TIME EMAIL OTP VERIFICATION                 */}
          {/* ============================================================== */}
          {authMode === 'otp' && (
            <div>
              {otpStep === 'request' ? (
                /* Step 1: Request Code */
                <form onSubmit={handleRequestOtp} className="space-y-4">
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

                  {/* Quick Email Suggestion Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-neutral-400 dark:text-[#8e8e8e]">Quick access:</span>
                    <button
                      type="button"
                      onClick={() => setEmail('contact@datagalactic.com')}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:text-[#10a37f] hover:bg-[#10a37f]/10 border border-neutral-200 dark:border-white/5 transition-colors"
                    >
                      contact@datagalactic.com
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmail('founder@datagalactic.com')}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:text-[#10a37f] hover:bg-[#10a37f]/10 border border-neutral-200 dark:border-white/5 transition-colors"
                    >
                      founder@datagalactic.com
                    </button>
                  </div>

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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#10a37f] hover:bg-[#0e8e6e] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Sending verification code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit Code */
                <div className="space-y-4">
                  {/* Change Email Header */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200 dark:border-white/5 text-xs">
                    <div className="truncate mr-2">
                      <span className="text-neutral-500 dark:text-[#8e8e8e]">Sending to: </span>
                      <strong className="text-neutral-900 dark:text-white">{email}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('request');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[#10a37f] hover:underline font-medium shrink-0 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                  </div>

                  {/* Real-time Code Live Badge (shows generated code for quick demo/local access) */}
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
                      Enter 6-digit code
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
                    onClick={() => handleVerifyOtp()}
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

                  {/* Resend Code Section */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-neutral-500 dark:text-[#8e8e8e]">
                      Didn't get the code?
                    </span>
                    {resendCountdown > 0 ? (
                      <span className="text-neutral-400 dark:text-[#6e6e6e] font-mono">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestOtp()}
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
            </div>
          )}

          {/* ============================================================== */}
          {/* OPTIONAL PASSWORD / SIGNUP FALLBACK TAB                        */}
          {/* ============================================================== */}
          {(authMode === 'password' || authMode === 'signup') && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <>
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
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] mb-1">
                  Email
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
                    placeholder="••••••••"
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{authMode === 'password' ? 'Sign In with Password' : 'Create Account'}</span>
                )}
              </button>
            </form>
          )}

          {/* Switchers & Alternative Options */}
          <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-white/5 space-y-2.5 text-center">
            {authMode === 'otp' ? (
              <div className="flex items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-neutral-500 dark:text-[#8e8e8e] hover:text-[#10a37f] transition-colors"
                >
                  Use password instead
                </button>
                <span className="text-neutral-300 dark:text-white/10">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-neutral-500 dark:text-[#8e8e8e] hover:text-[#10a37f] transition-colors"
                >
                  Register new account
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setOtpStep('request');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs text-[#10a37f] hover:underline font-medium inline-flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Return to Real-Time Email OTP Verification</span>
              </button>
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
