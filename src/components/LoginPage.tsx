import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  CheckCircle2,
  Lock,
  KeyRound,
  RefreshCw,
  Edit3,
  AlertTriangle,
  Fingerprint,
  Cake,
  LogIn,
  UserPlus,
  Zap,
  Sparkles,
} from 'lucide-react';
import { UserAccount } from '../types';
import { RoLogo } from './RoLogo';

interface LoginPageProps {
  onLogin: (account: UserAccount) => void;
  defaultEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  defaultEmail = '',
}) => {
  // Mode: 'login' (Sign In) vs 'register' (Sign Up / Register Data)
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Step: 'form' | 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');
  
  // Form fields
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  
  // OTP digits state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Status and feedback
  const [error, setError] = useState<string | null>(null);
  const [registeredNotice, setRegisteredNotice] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  // Timers
  const [cooldown, setCooldown] = useState(0);
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 minutes
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [previewHint, setPreviewHint] = useState<string | null>(null);

  // Cooldown timer interval
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry timer interval when in OTP step
  useEffect(() => {
    if (step !== 'otp' || expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, expirySeconds]);

  // Auto-focus first input when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Safe JSON response parser that prevents raw "Unexpected token <" HTML errors
  const safeParseJsonResponse = async (res: Response): Promise<{ ok: boolean; status: number; data: any }> => {
    const status = res.status;
    const text = await res.text().catch(() => '');
    let data: any = {};
    try {
      if (text && text.trim().startsWith('{') || text.trim().startsWith('[')) {
        data = JSON.parse(text);
      } else {
        data = { error: res.ok ? null : `Server returned status ${status}. Please try again.` };
      }
    } catch {
      data = { error: 'Authentication service responded unexpectedly. Please retry.' };
    }
    return { ok: res.ok, status, data };
  };

  // STEP 1: Request OTP for Login or Registration
  const handleSubmitForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address to continue.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your name to complete registration.');
        return;
      }
      if (!birthday.trim()) {
        setError('Please select your date of birth for birthday celebrations & companion greetings.');
        return;
      }
    }

    setError(null);
    setRegisteredNotice(null);
    setIsLoading(true);

    try {
      // Optional check if email exists when registering
      if (mode === 'register') {
        try {
          const checkRes = await fetch('/api/auth/check-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: trimmedEmail }),
          });
          const { ok: checkOk, data: checkData } = await safeParseJsonResponse(checkRes);
          if (checkOk && checkData.isRegistered) {
            setRegisteredNotice(`The email ${trimmedEmail} is already registered. You can directly log in!`);
            setMode('login');
            setIsLoading(false);
            return;
          }
        } catch {
          // Non-blocking check
        }
      }

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const { ok, data } = await safeParseJsonResponse(res);

      if (!ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setCooldown(data.cooldownSeconds || 35);
      setExpirySeconds((data.expiresInMinutes || 5) * 60);
      setAttemptsRemaining(5);
      setSuccessMessage(data.message || `Verification code sent to ${trimmedEmail}`);
      if (data.previewCodeHint) {
        setPreviewHint(data.previewCodeHint);
      } else {
        setPreviewHint(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const { ok, data } = await safeParseJsonResponse(res);

      if (!ok) {
        throw new Error(data.error || 'Failed to resend code.');
      }

      setCooldown(data.cooldownSeconds || 35);
      setExpirySeconds((data.expiresInMinutes || 5) * 60);
      setAttemptsRemaining(5);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage('A fresh verification code has been dispatched!');
      if (data.previewCodeHint) {
        setPreviewHint(data.previewCodeHint);
      }
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpDigitChange = (index: number, value: string) => {
    if (error) setError(null);

    // Handle full paste into single input
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = digits[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(digits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();

      // Auto-submit if all 6 digits pasted
      if (digits.length === 6) {
        submitVerification(digits.join(''));
      }
      return;
    }

    // Single digit input
    const cleanDigit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);

    // Move to next input
    if (cleanDigit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit if 6 digits completed
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      submitVerification(fullCode);
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // STEP 2: Verify OTP
  const submitVerification = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    if (expirySeconds <= 0) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: fullCode,
          name: mode === 'register' ? name.trim() : undefined,
          birthday: mode === 'register' ? birthday.trim() : undefined,
        }),
      });

      const { ok, data } = await safeParseJsonResponse(res);

      if (!ok) {
        if (data.attemptsLeft !== undefined) {
          setAttemptsRemaining(data.attemptsLeft);
        }
        throw new Error(data.error || 'Invalid verification code.');
      }

      // Success
      const welcomeText = mode === 'register' 
        ? 'Account registered successfully! Launching Ro...' 
        : 'Welcome back! Launching Ro...';
      setSuccessMessage(welcomeText);

      const userObj: UserAccount = {
        email: data.user.email,
        name: data.user.name,
        birthday: data.user.birthday,
        loggedInAt: data.user.loggedInAt,
        sessionToken: data.sessionToken,
      };

      setTimeout(() => {
        onLogin(userObj);
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const formatExpiryTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md mx-auto relative z-10 space-y-6">
        {/* Ro Brand Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <RoLogo size="xl" showText={false} className="mb-1" />

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full-Spectrum Protected Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight flex items-center justify-center gap-2">
              <span>Ro AI</span>
              <span className="text-indigo-400 font-light">•</span>
              <span>
                {step === 'otp'
                  ? 'Verify Code'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              {step === 'otp'
                ? `Enter the 6-digit verification code sent to ${email}`
                : mode === 'login'
                ? 'Sign in with your registered email to access your conversations and companion settings.'
                : 'Register your profile details to create your secure Ro AI account.'}
            </p>
          </div>
        </div>

        {/* Login / Register Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Mode Switcher Tabs (when in form step) */}
          {step === 'form' && (
            <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                type="button"
                id="tab-mode-login"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setRegisteredNotice(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                id="tab-mode-register"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setRegisteredNotice(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/70 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-0.5">
                <p className="font-semibold text-red-200">Authentication Alert</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Registered Notice Alert (when email already exists) */}
          {registeredNotice && !error && (
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/70 text-indigo-200 text-xs flex items-start justify-between gap-2.5 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-indigo-100">Already Registered</p>
                  <p className="leading-relaxed">{registeredNotice}</p>
                </div>
              </div>
              <button
                type="button"
                id="btn-switch-to-login"
                onClick={() => {
                  setMode('login');
                  setRegisteredNotice(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                Log In Now
              </button>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && !error && !registeredNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Developer Sandbox Hint (if email dispatch was simulated in sandbox) */}
          {previewHint && step === 'otp' && (
            <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-700/50 text-indigo-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sandbox OTP Hint: <strong className="font-mono text-indigo-100">{previewHint}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const digits = previewHint.split('');
                  setOtpDigits(digits);
                  submitVerification(previewHint);
                }}
                className="text-[11px] font-semibold text-indigo-300 underline hover:text-white cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* STEP 1: FORM (LOGIN OR REGISTER) */}
          {step === 'form' ? (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-email-input"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Email Address <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="user-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                      if (registeredNotice) setRegisteredNotice(null);
                    }}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder:text-slate-500 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              {/* Registration Extra Fields */}
              {mode === 'register' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="user-name-input"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      Full Name <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="user-name-input"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="Your full name"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder:text-slate-500 text-sm transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="user-dob-input"
                        className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                      >
                        Date of Birth <span className="text-indigo-400">*</span>
                      </label>
                      <span className="text-[11px] text-pink-400/90 font-medium">Birthday Celebrations</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Cake className="w-4 h-4 text-pink-400" />
                      </div>
                      <input
                        id="user-dob-input"
                        type="date"
                        value={birthday}
                        onChange={(e) => {
                          setBirthday(e.target.value);
                          if (error) setError(null);
                        }}
                        required
                        max="2026-12-31"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder:text-slate-500 text-sm transition-all outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Ro sends companion greetings and festive wishes on your special day.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-auth-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 hover:from-indigo-500 to-violet-600 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{mode === 'register' ? 'Registering...' : 'Sending Code...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'register'
                        ? 'Register & Send Code'
                        : 'Send Login Code'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Toggle Mode Footer */}
              <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/60">
                {mode === 'register' ? (
                  <p>
                    Already registered?{' '}
                    <button
                      type="button"
                      id="btn-toggle-to-login"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                        setRegisteredNotice(null);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 cursor-pointer ml-1"
                    >
                      Log In to your Account
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      id="btn-toggle-to-register"
                      onClick={() => {
                        setMode('register');
                        setError(null);
                        setRegisteredNotice(null);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 cursor-pointer ml-1"
                    >
                      Register your Account
                    </button>
                  </p>
                )}
              </div>
            </form>
          ) : (
            /* STEP 2: 6-DIGIT OTP VERIFICATION */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-150">
              {/* Target email and change button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-200 truncate">{email}</span>
                    <span className="text-[10px] text-slate-500">
                      {mode === 'register' ? 'Registering new account' : 'Logging in'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-edit-email"
                  onClick={() => {
                    setStep('form');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium shrink-0 ml-2 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* 6 Digit Inputs */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider text-center">
                  6-Digit OTP Code
                </label>
                <div className="flex items-center justify-between gap-1 xs:gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      id={`otp-digit-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-9 h-11 xs:w-11 xs:h-13 sm:w-13 sm:h-14 text-center text-lg sm:text-2xl font-bold font-mono rounded-xl bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white transition-all outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* Countdown & Expiry Status */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Expires in:</span>
                  <span
                    className={`font-mono font-semibold ${
                      expirySeconds < 60 ? 'text-red-400 animate-pulse' : 'text-slate-200'
                    }`}
                  >
                    {formatExpiryTime(expirySeconds)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Attempts: </span>
                  <span
                    className={`font-semibold ${
                      attemptsRemaining <= 2 ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {attemptsRemaining}/5
                  </span>
                </div>
              </div>

              {/* Verify Button */}
              <button
                id="btn-verify-otp"
                type="button"
                onClick={() => submitVerification()}
                disabled={isLoading || otpDigits.join('').length !== 6 || expirySeconds <= 0}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 hover:from-indigo-500 to-violet-600 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {mode === 'register'
                        ? 'Verify & Complete Registration'
                        : 'Verify Code & Launch Ro'}
                    </span>
                  </>
                )}
              </button>

              {/* Resend Action */}
              <div className="text-center pt-1">
                {cooldown > 0 ? (
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-slate-600" />
                    <span>Resend code in {cooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    id="btn-resend-otp"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Didn't get the code? Resend OTP</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Security Badges */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400 pt-2">
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center gap-1">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] font-semibold text-slate-200">5-Min OTP TTL</span>
            <span className="text-[9px] text-slate-500">Auto Expiring</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center gap-1">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-semibold text-slate-200">Anti-Brute Force</span>
            <span className="text-[9px] text-slate-500">5-Attempt Lockout</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-pink-400" />
            <span className="text-[11px] font-semibold text-slate-200">Rate Limiting</span>
            <span className="text-[9px] text-slate-500">35s Cooldown</span>
          </div>
        </div>
      </div>
    </div>
  );
};
