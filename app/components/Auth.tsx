'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Phone, User, Upload, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AuthFormState = {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  birthDate: string;
  profileImageUrl: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export default function Auth() {
  const router = useRouter();
  const [typedBrand, setTypedBrand] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<AuthFormState>({
    name: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    birthDate: '',
    profileImageUrl: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const updateForm = (key: keyof AuthFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fullText = 'Niche';
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedBrand(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(timer);
    }, 120);

    return () => clearInterval(timer);
  }, []);

  const buildPhoneWithCountryCode = () => {
    const ccRaw = form.countryCode.trim();
    const numRaw = form.phoneNumber.trim();
    const ccDigits = ccRaw.replace(/\D/g, '');
    const numDigits = numRaw.replace(/\D/g, '');
    if (!ccDigits || !numDigits) return '';
    return `+${ccDigits}${numDigits}`;
  };

  const getAge = (birthDate: string) => {
    const dob = new Date(birthDate);
    if (Number.isNaN(dob.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/uploads/image', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Image upload failed');
    updateForm('profileImageUrl', data.url);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isLogin && step < 3) {
      if (step === 1 && (!form.name || !form.email || !form.countryCode || !form.phoneNumber)) {
        setError('Please fill all required fields.');
        return;
      }
      if (step === 2 && (!form.birthDate || getAge(form.birthDate) < 18)) {
        setError('You must be at least 18 years old.');
        return;
      }
      setStep((prev) => prev + 1);
      return;
    }

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!form.termsAccepted) {
        setError('Please accept the terms to continue.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const fullPhone = buildPhoneWithCountryCode();
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
        phone: fullPhone,
            birthDate: new Date(form.birthDate).toISOString(),
            profileImageUrl: form.profileImageUrl || undefined,
            password: form.password,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || 'Authentication failed.');
        return;
      }

      if (data?.token) {
        localStorage.setItem('auth_token', data.token);
          // Set cookie so Next.js middleware can read it
          document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

        if (isLogin) {
          setSuccess('Signed in successfully.');
          setTimeout(() => router.push('/cards'), 500);
        } else {
          setSuccess(data?.message || 'Account created successfully. Please verify your email.');
          setTimeout(() => router.push('/auth/verify'), 700);
        }
    } catch (submitError) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-2">
            {typedBrand}
            <span className="animate-pulse">|</span>
          </h1>
          <h2 className="text-2xl font-bold text-black dark:text-white">
            {isLogin ? 'Welcome Back' : 'Let\'s Get Started'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            {isLogin ? 'Sign in to your account' : `Step ${step} of ${isLogin ? 1 : 3}`}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {isLogin ? (
            <>
              {/* Login Form */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-red-500 hover:text-red-600"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/auth/verify')}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Verify email/phone
                </button>
              </motion.div>
            </>
          ) : step === 1 ? (
            <>
              {/* Sign Up Step 1 */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="+1"
                    value={form.countryCode}
                    onChange={(e) => updateForm('countryCode', e.target.value)}
                    className="w-24 px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="5550000000"
                      value={form.phoneNumber}
                      onChange={(e) => updateForm('phoneNumber', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Use country code + local number (stored as international format).</p>
              </motion.div>
            </>
          ) : step === 2 ? (
            <>
              {/* Sign Up Step 2 */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Birthday</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => updateForm('birthDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">You must be at least 18 years old</p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Upload Profile Image</label>
                <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-red-500 transition">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-black dark:text-white">Upload Photo</p>
                    <p className="text-xs text-gray-500">JPG, PNG, WEBP, or GIF (max 5MB)</p>
                    {form.profileImageUrl && <p className="text-xs text-green-600 mt-1">Uploaded ✓</p>}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      try {
                        await uploadImage(e.target.files?.[0]);
                      } catch (uploadError) {
                        setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
                      }
                    }}
                  />
                </label>
              </motion.div>
            </>
          ) : (
            <>
              {/* Sign Up Step 3 */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={form.termsAccepted}
                  onChange={(e) => updateForm('termsAccepted', e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </motion.div>
            </>
          )}

          {error && (
            <motion.p variants={itemVariants} className="text-sm text-red-500">
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p variants={itemVariants} className="text-sm text-green-600 dark:text-green-400">
              {success}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 mt-6"
          >
            {isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : step === 3 ? 'Create Account' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.form>

        {/* Sign Up Progress */}
        {!isLogin && (
          <motion.div
            variants={itemVariants}
            className="flex gap-2 mt-6"
          >
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${
                  s <= step ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </motion.div>
        )}

        {/* Toggle */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setStep(1);
              setError(null);
              setSuccess(null);
            }}
            className="text-red-500 hover:text-red-600 font-medium text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
