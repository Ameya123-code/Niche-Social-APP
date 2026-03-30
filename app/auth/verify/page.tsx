'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Camera, CheckCircle2, Mail, RefreshCcw, ShieldCheck, Sparkles, ScanFace } from 'lucide-react';
import Silk from '@/components/Silk';

declare global {
  interface Window {
    cv?: {
      imread: (canvas: HTMLCanvasElement) => any;
      cvtColor: (src: any, dst: any, code: number, dstCn?: number) => void;
      Laplacian: (src: any, dst: any, ddepth: number, ksize?: number, scale?: number, delta?: number, borderType?: number) => void;
      meanStdDev: (src: any, mean: any, stddev: any) => void;
      mean: (src: any) => number[];
      Mat: new () => any;
      CV_64F: number;
      COLOR_RGBA2GRAY: number;
    };
  }
}

type VerifyUser = {
  id: string;
  email: string;
  age: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isAgeVerified: boolean;
};

type AgeEstimatePayload = {
  verification?: { status?: string; isAgeVerified?: boolean };
  estimate?: {
    estimatedAge: number;
    confidence: number;
    isLikelyAdult: boolean;
    provider: string;
    disclaimer: string;
  };
};

type QualityStats = {
  brightness: number;
  sharpness: number;
  suggestion: string;
};

function analyzeCapture(canvas: HTMLCanvasElement): QualityStats | null {
  const cv = window.cv;
  if (!cv) return null;

  const src = cv.imread(canvas);
  const gray = new cv.Mat();
  const lap = new cv.Mat();
  const mean = new cv.Mat();
  const stddev = new cv.Mat();

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.Laplacian(gray, lap, cv.CV_64F);
    cv.meanStdDev(lap, mean, stddev);

    const brightness = Math.round(cv.mean(gray)[0] ?? 0);
    const stdValue = Number(stddev.doubleAt ? stddev.doubleAt(0, 0) : stddev.data64F?.[0] ?? 0);
    const sharpness = Math.round(stdValue * stdValue);

    let suggestion = 'Looking good. Hold steady and verify.';
    if (brightness < 70) suggestion = 'Lighting is low. Move to a brighter area.';
    else if (brightness > 210) suggestion = 'Lighting is too harsh. Reduce glare on your face.';
    else if (sharpness < 80) suggestion = 'Image looks blurry. Hold still and refocus the camera.';

    return { brightness, sharpness, suggestion };
  } finally {
    src.delete();
    gray.delete();
    lap.delete();
    mean.delete();
    stddev.delete();
  }
}

export default function VerifyPage() {
  const router = useRouter();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [cvReady, setCvReady] = useState(false);
  const [user, setUser] = useState<VerifyUser | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [ageVerifying, setAgeVerifying] = useState(false);
  const [ageMsg, setAgeMsg] = useState('');
  const [ageErr, setAgeErr] = useState('');
  const [quality, setQuality] = useState<QualityStats | null>(null);
  const [captureUrl, setCaptureUrl] = useState('');
  const [estimate, setEstimate] = useState<AgeEstimatePayload['estimate'] | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const allVerified = useMemo(() => Boolean(user?.isAgeVerified), [user]);

  useEffect(() => {
    if (!token) router.replace('/auth');
  }, [router, token]);

  useEffect(() => {
    if (!token) return;
    const loadMe = async () => {
      try {
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.user) {
          setUser(data.user as VerifyUser);
        }
      } catch {
        // ignore
      }
    };
    void loadMe();
  }, [token]);

  useEffect(() => {
    if (!allVerified) return;
    const timer = setTimeout(() => router.push('/cards'), 900);
    return () => clearTimeout(timer);
  }, [allVerified, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDarkTheme(root.classList.contains('dark'));

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (captureUrl.startsWith('blob:')) URL.revokeObjectURL(captureUrl);
    };
  }, [captureUrl]);

  const startCamera = async () => {
    setAgeErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setAgeErr('Camera access failed. Please allow camera permissions and retry.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setCapturing(true);
    setAgeErr('');
    setAgeMsg('');
    try {
      const size = Math.min(video.videoWidth || 720, video.videoHeight || 720) || 720;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      const sx = Math.max(0, (video.videoWidth - size) / 2);
      const sy = Math.max(0, (video.videoHeight - size) / 2);
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

      const stats = cvReady ? analyzeCapture(canvas) : null;
      setQuality(stats);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) throw new Error('Capture failed');

      if (captureUrl.startsWith('blob:')) URL.revokeObjectURL(captureUrl);
      setCaptureUrl(URL.createObjectURL(blob));
      setAgeMsg(stats?.suggestion || 'Capture ready. Run age verification when you are happy with the frame.');
    } catch {
      setAgeErr('Could not capture image. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const submitAgeVerification = async () => {
    const canvas = canvasRef.current;
    if (!token || !canvas) return;
    setAgeErr('');
    setAgeMsg('');
    setAgeVerifying(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) throw new Error('No capture available');

      const formData = new FormData();
      formData.append('file', new File([blob], 'verify.jpg', { type: 'image/jpeg' }));

      const res = await fetch('/api/auth/verification/age/estimate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = (await res.json().catch(() => ({}))) as AgeEstimatePayload & { error?: string };
      if (!res.ok) {
        setAgeErr(data?.error || 'Age verification failed');
        return;
      }

      setEstimate(data.estimate ?? null);
      const verified = Boolean(data.verification?.isAgeVerified);
      setUser((prev) => (prev ? { ...prev, isAgeVerified: verified } : prev));
      setAgeMsg(
        verified
          ? 'Age verified successfully. You can continue to discover now.'
          : 'We could not verify your age confidently from this capture. Try better lighting and a clearer front-facing image.'
      );
    } catch {
      setAgeErr('Age verification failed');
    } finally {
      setAgeVerifying(false);
    }
  };

  const send = async () => {
    if (!token || cooldown > 0) return;
    setErr('');
    setMsg('');
    setSending(true);
    try {
      const res = await fetch('/api/auth/verification/email/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || 'Failed to send code');
        return;
      }
      setMsg(data.message || 'Verification code sent to your email.');
      setCooldown(45);
    } catch {
      setErr('Failed to send code');
    } finally {
      setSending(false);
    }
  };

  const confirm = async () => {
    if (!token) return;
    setErr('');
    setMsg('');

    if (!/^\d{6}$/.test(code.trim())) {
      setErr('Please enter a valid 6-digit code.');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/auth/verification/email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || 'Failed to verify');
        return;
      }

      if (data?.token) {
        localStorage.setItem('auth_token', data.token);
        document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

      setUser((prev) => (prev ? { ...prev, isEmailVerified: true } : prev));
      setMsg('Email verified successfully.');
    } catch {
      setErr('Failed to verify');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent flex items-center justify-center p-4">
      <Script src="https://docs.opencv.org/4.x/opencv.js" strategy="afterInteractive" onLoad={() => setCvReady(true)} />
      <div className="fixed inset-0 z-0" aria-hidden style={{ pointerEvents: 'none' }}>
        <div className="absolute inset-0 opacity-68 dark:opacity-45" style={{ pointerEvents: 'none' }}>
          <Silk
            speed={3.4}
            scale={0.95}
            color={isDarkTheme ? '#7c3aed' : '#1e3a8a'}
            noiseIntensity={1.1}
            rotation={0.12}
          />
        </div>
        <div
          className="absolute inset-0 niche-animated-gradient bg-[linear-gradient(120deg,rgba(62,45,78,0.9),rgba(86,50,86,0.86),rgba(72,46,84,0.84),rgba(52,40,68,0.9))] dark:bg-[linear-gradient(120deg,rgba(8,8,12,0.95),rgba(34,8,28,0.85),rgba(16,8,26,0.86),rgba(6,6,10,0.95))]"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white">Verify your identity</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Complete age verification to continue</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: 'Email', ok: user?.isEmailVerified, hint: user?.email || 'Pending email verification' },
            { label: 'Age', ok: user?.isAgeVerified, hint: user?.isAgeVerified ? 'Verified' : 'Camera check required' },
            { label: 'Status', ok: allVerified, hint: allVerified ? 'Ready for discover' : 'Complete age verification' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/65 dark:bg-white/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-gray-500">{item.label}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                  {item.ok ? 'Done' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-black dark:text-white mt-1 break-all">{item.hint}</p>
            </div>
          ))}
        </div>

        {allVerified ? (
          <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-900/15 p-4">
            <p className="text-sm text-emerald-700 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Verification complete. Redirecting you to discover…
            </p>
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/65 dark:bg-white/5 p-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-rose-500 font-semibold">Step 1</p>
              <h2 className="text-lg font-bold text-black dark:text-white mt-1">Email verification</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We&apos;ll send a 6-digit code to your registered email.</p>
            </div>

            <div className="rounded-2xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-900/15 p-3">
              <p className="text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-0.5" />
                Use this step to confirm account ownership before profile access is fully unlocked.
              </p>
            </div>

            <button
              onClick={send}
              disabled={sending || cooldown > 0 || user?.isEmailVerified}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-black to-zinc-800 dark:from-white dark:to-zinc-200 dark:text-black disabled:opacity-60"
            >
              {user?.isEmailVerified ? 'Email already verified' : sending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send verification code'}
            </button>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">6-digit code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white tracking-[0.2em] text-center"
              />
            </div>

            <button
              onClick={confirm}
              disabled={verifying || user?.isEmailVerified}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white font-semibold hover:brightness-110 transition disabled:opacity-60"
            >
              {user?.isEmailVerified ? 'Verified' : verifying ? 'Verifying…' : 'Verify email'}
            </button>

            {err && <p className="text-sm text-red-500">{err}</p>}
            {msg && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {msg}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/65 dark:bg-white/5 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-cyan-500 font-semibold">Step 2</p>
                <h2 className="text-lg font-bold text-black dark:text-white mt-1">Age verification with OpenCV assist</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Capture a clean selfie. OpenCV checks image quality before the age-estimate API runs.</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full ${cvReady ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                {cvReady ? 'OpenCV ready' : 'Loading OpenCV…'}
              </span>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-black min-h-[320px] flex items-center justify-center">
              {captureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={captureUrl} alt="verification capture" className="w-full h-[360px] object-cover" />
              ) : (
                <video ref={videoRef} playsInline muted className={`w-full h-[360px] object-cover ${cameraOn ? 'opacity-100' : 'opacity-0'}`} />
              )}

              {!cameraOn && !captureUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 gap-2">
                  <ScanFace className="w-10 h-10" />
                  <p className="text-sm font-medium">Start camera to scan your face</p>
                </div>
              ) : null}

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[72%] h-[78%] rounded-[40%] border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.28)]" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-black/45 backdrop-blur px-3 py-2 text-[11px] text-white/90">
                Center your face, remove harsh backlight, and hold steady.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void startCamera()}
                disabled={cameraOn}
                className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" /> Start camera
              </button>
              <button
                type="button"
                onClick={() => void captureFrame()}
                disabled={!cameraOn || capturing}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
              >
                {capturing ? 'Capturing…' : 'Capture frame'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCaptureUrl('');
                  setEstimate(null);
                  setQuality(null);
                  setAgeMsg('');
                  void startCamera();
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold inline-flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" /> Retake
              </button>
            </div>

            {quality ? (
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 bg-white/70 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Brightness</p>
                  <p className="text-sm font-semibold text-black dark:text-white">{quality.brightness}</p>
                </div>
                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 bg-white/70 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Sharpness</p>
                  <p className="text-sm font-semibold text-black dark:text-white">{quality.sharpness}</p>
                </div>
                <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 bg-white/70 dark:bg-white/5">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">OpenCV Assist</p>
                  <p className="text-sm font-semibold text-black dark:text-white">Ready</p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void submitAgeVerification()}
              disabled={!captureUrl || ageVerifying || user?.isAgeVerified}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:brightness-110 transition disabled:opacity-60"
            >
              {user?.isAgeVerified ? 'Age verified' : ageVerifying ? 'Analyzing…' : 'Run age verification'}
            </button>

            {estimate ? (
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 space-y-1.5">
                <p className="text-xs text-gray-500">Estimated age result</p>
                <p className="text-lg font-bold text-black dark:text-white">~{estimate.estimatedAge} years</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Confidence: {Math.round(estimate.confidence * 100)}% · Provider: {estimate.provider}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{estimate.disclaimer}</p>
              </div>
            ) : null}

            {ageErr && <p className="text-sm text-red-500">{ageErr}</p>}
            {ageMsg && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {ageMsg}
              </p>
            )}
          </section>
        </div>

        <canvas ref={canvasRef} className="hidden" />

      </div>
    </div>
  );
}
