import React, { useEffect, useState } from 'react';
import {
  X,
  Cake,
  Sparkles,
  Mail,
  Send,
  CheckCircle2,
  Calendar,
  Gift,
  Heart,
  PartyPopper,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';

interface BirthdayCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  birthdayWish?: string;
  onUpdateBirthday?: (newBirthday: string) => Promise<void>;
}

export const BirthdayCelebrationModal: React.FC<BirthdayCelebrationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  birthdayWish,
  onUpdateBirthday,
}) => {
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailStatus, setMailStatus] = useState<{
    sent: boolean;
    message: string;
    isError?: boolean;
  } | null>(null);

  const [editingBirthday, setEditingBirthday] = useState(false);
  const [newBirthdayVal, setNewBirthdayVal] = useState(
    currentUser?.birthday || '2006-09-13'
  );
  const [isSavingBirthday, setIsSavingBirthday] = useState(false);

  // Trigger confetti burst on open
  useEffect(() => {
    if (!isOpen) return;

    // Multi-stage confetti fireworks
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerMoreConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6366F1', '#EC4899'],
    });
  };

  const handleSendTestMail = async () => {
    if (!currentUser?.email) return;
    setIsSendingMail(true);
    setMailStatus(null);

    try {
      const res = await fetch('/api/user/send-birthday-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: currentUser.name,
          force: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMailStatus({
          sent: true,
          message: `Birthday celebration email successfully dispatched to ${currentUser.email}! Please check your inbox.`,
        });
        triggerMoreConfetti();
      } else {
        setMailStatus({
          sent: false,
          isError: true,
          message: data.message || data.error || 'Failed to dispatch email. Check SMTP setup.',
        });
      }
    } catch (err: any) {
      setMailStatus({
        sent: false,
        isError: true,
        message: err.message || 'Network error while attempting to dispatch birthday email.',
      });
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleSaveBirthday = async () => {
    if (!newBirthdayVal.trim() || !currentUser?.email) return;
    setIsSavingBirthday(true);
    try {
      await onUpdateBirthday?.(newBirthdayVal.trim());
      setEditingBirthday(false);
      triggerMoreConfetti();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSavingBirthday(false);
    }
  };

  const displayName = currentUser?.name || 'Friend';
  const firstName = displayName.split(' ')[0] || displayName;

  return (
    <div
      id="birthday-celebration-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#0F1422] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-600/30 overflow-hidden">
        {/* Glow behind modal */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-birthday-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Cake Icon with flame glow */}
          <div className="relative cursor-pointer group" onClick={triggerMoreConfetti}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-pink-500/30 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex items-center justify-center">
                <Cake className="w-10 h-10 text-pink-400 group-hover:text-pink-300 transition-colors" />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 flex items-center justify-center w-7 h-7 bg-amber-400 rounded-full shadow-md animate-bounce">
              <Sparkles className="w-4 h-4 text-slate-900" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-950/70 border border-pink-500/30 text-pink-300 text-xs font-semibold uppercase tracking-wider">
            <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
            <span>Birthday Celebration Today</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Happy Birthday, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300">{firstName}</span>! 🎂
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {birthdayWish ||
                `Ro is celebrating your special day! Wishing you great health, happiness, and incredible accomplishments across every software project you build.`}
            </p>
          </div>

          {/* Features Card */}
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Gift className="w-3.5 h-3.5 text-indigo-400" />
                Ro's Birthday Perks
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Active Today
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Real-time celebratory email dispatched to <strong>{currentUser?.email || 'your email'}</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Full access to Autonomous Project Builder &amp; multimodal coding companion</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Custom birthday greeting in all chat responses today</span>
              </div>
            </div>
          </div>

          {/* Real-time Email Dispatch Section */}
          <div className="w-full space-y-2 pt-1">
            {mailStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 text-left ${
                  mailStatus.isError
                    ? 'bg-red-950/60 border border-red-800 text-red-300'
                    : 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                }`}
              >
                {mailStatus.isError ? (
                  <Mail className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span>{mailStatus.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                id="btn-trigger-birthday-mail"
                type="button"
                onClick={handleSendTestMail}
                disabled={isSendingMail}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 hover:from-pink-500 to-indigo-600 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSendingMail ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dispatching Birthday Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Birthday Wish to My Inbox</span>
                  </>
                )}
              </button>

              <button
                id="btn-pop-confetti"
                type="button"
                onClick={triggerMoreConfetti}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
                <span>Celebrate 🎉</span>
              </button>
            </div>
          </div>

          {/* Birthday Date Settings / Edit */}
          <div className="pt-2 border-t border-slate-800/80 w-full text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Registered Birthday:</span>
              <span className="font-mono text-slate-200">
                {currentUser?.birthday || '2006-09-13'}
              </span>
            </div>

            {!editingBirthday ? (
              <button
                onClick={() => setEditingBirthday(true)}
                className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
              >
                Change Date
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={newBirthdayVal}
                  onChange={(e) => setNewBirthdayVal(e.target.value)}
                  className="px-2 py-0.5 bg-slate-950 border border-indigo-500/60 rounded text-[11px] text-white outline-none"
                />
                <button
                  onClick={handleSaveBirthday}
                  disabled={isSavingBirthday}
                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingBirthday(false)}
                  className="text-slate-500 hover:text-slate-300 text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
