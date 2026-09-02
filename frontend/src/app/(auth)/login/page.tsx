'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type HttpError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const loginSchema = z.object({
  login_id: z.string().min(1, { message: 'IDを入力してください' }),
  password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post('/auth/login', data);
      
      if (response.data && response.data.data && response.data.data.access_token) {
        login(response.data.data.access_token);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: unknown) {
      const httpError = error as HttpError;
      setServerError(httpError.response?.data?.message || 'ログインに失敗しました。IDまたはパスワードをご確認ください。');
    }
  };

  return (
    <div
      data-layer="PC_Login"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FFEEE3] px-4 py-8"
      style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      {/* ================= BACKGROUND DECORATIONS (FIGMA ASSETS) ================= */}

      {/* Asset 3 1: Top Left Vector Group */}
      <div
        data-layer="Asset 3 1"
        className="pointer-events-none absolute -left-[73px] -top-[66px] w-[254px] h-[442px] overflow-hidden opacity-90 hidden md:block"
      >
        <div className="absolute left-[82.97px] top-[171.78px]">
          <svg width="125" height="138" viewBox="0 0 125 138" fill="none">
            <path d="M56.1982 135.778L1.51465 61.8975L122.419 2.20605L56.1982 135.778Z" fill="white" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[139.34px] top-[171.78px]">
          <svg width="96" height="138" viewBox="0 0 96 138" fill="none">
            <path d="M93.9893 134.539L1.62988 136.65L67.8525 3.0752L93.9893 134.539Z" fill="#F06800" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[56.32px] top-[0.88px]">
          <svg width="104" height="83" viewBox="0 0 104 83" fill="none">
            <path d="M102.398 81.6631L-16.7934 -65.6501L-10.8427 3.06681L102.398 81.6631Z" stroke="#F06800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[0.88px] top-[69.59px]">
          <svg width="104" height="156" viewBox="0 0 104 156" fill="none">
            <path d="M-72.2333 154.85L102.398 79.5963L-10.8426 1L-72.2333 154.85Z" stroke="#F06800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[0.88px] top-[0.88px] w-[61.39px] h-[222.57px] outline outline-2 outline-[#F06800] -outline-offset-1" />
      </div>

      {/* Decorative Circle: Left */}
      <div className="pointer-events-none absolute left-[195.41px] top-[223.94px] hidden lg:block">
        <svg width="62" height="62" viewBox="0 0 62 62" fill="none">
          <path d="M30.9747 60.4868C47.5293 60.4868 60.9494 47.1703 60.9494 30.7434C60.9494 14.3166 47.5293 1 30.9747 1C14.4201 1 1 14.3166 1 30.7434C1 47.1703 14.4201 60.4868 30.9747 60.4868Z" stroke="#F06800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Asset 1 1: Top Right Vector Group */}
      <div
        data-layer="Asset 1 1"
        className="pointer-events-none absolute -top-[12px] right-0 w-[407px] h-[492px] overflow-hidden opacity-90 hidden md:block"
      >
        <div className="absolute left-[101.30px] top-[110.62px]">
          <svg width="177" height="227" viewBox="0 0 177 227" fill="none">
            <path d="M87.8255 1L1.00012 22.2016L18.5861 129.429L117.544 225.561L214.325 221.719L203.112 104.263L87.8255 1Z" fill="#FFCFA7" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[303.41px] top-[103.26px] w-[103.59px] h-[228.08px] bg-white outline outline-2 outline-[#F06800] -outline-offset-1" />
        <div className="absolute left-[188.12px] top-0">
          <svg width="90" height="203" viewBox="0 0 90 203" fill="none">
            <path d="M1 98.6241L93.378 -12L208.665 91.2629L116.287 201.887L1 98.6241Z" fill="#F06800" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[101.30px] top-0">
          <svg width="177" height="121" viewBox="0 0 177 121" fill="none">
            <path d="M1 119.826L93.3703 9.20161L180.203 -12L87.8253 98.6241L1 119.826Z" fill="white" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[100.98px] top-[409.50px]">
          <svg width="102" height="84" viewBox="0 0 102 84" fill="none">
            <path d="M100.073 83.4984L93.5774 21.4578L1 1L18.3328 65.4406L100.073 83.4984Z" fill="#FFCFA7" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[100.98px] top-[358.36px]">
          <svg width="127" height="74" viewBox="0 0 127 74" fill="none">
            <path d="M125.62 19.0655L93.5774 72.5947L1 52.1369L43.8797 1L125.62 19.0655Z" fill="#F06800" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[193.55px] top-[376.43px]">
          <svg width="37" height="117" viewBox="0 0 37 117" fill="none">
            <path d="M35.1979 62.0822L7.49599 116.57L1 54.5294L33.0428 1.00012L35.1979 62.0822Z" fill="white" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[9.82px] top-[80.01px]">
          <svg width="175" height="160" viewBox="0 0 175 160" fill="none">
            <path d="M49.678 97.8011C35.6506 71.232 13.8542 55.1909 1.00024 61.9769L113.564 2.55873C126.418 -4.22732 148.214 11.8138 162.242 38.3829C176.269 64.952 177.228 91.9889 164.374 98.7749L51.8101 158.193C64.664 151.407 63.713 124.37 49.678 97.8011Z" stroke="#F06800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute -left-[13.46px] top-[128.71px]">
          <svg width="71" height="102" viewBox="0 0 71 102" fill="none">
            <path d="M60.6202 98.7802C73.4757 91.995 72.5237 64.9546 58.4938 38.3836C44.4639 11.8127 22.669 -4.22683 9.81348 2.55835C-3.04204 9.34352 -2.09003 36.384 11.9399 62.9549C25.9698 89.5258 47.7647 105.565 60.6202 98.7802Z" stroke="#F06800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Asset 1 2: Bottom Left Vector Group */}
      <div
        data-layer="Asset 1 2"
        className="pointer-events-none absolute left-[-60px] bottom-[-100px] w-[499px] h-[500px] opacity-75 hidden lg:block"
        style={{ transform: 'rotate(177deg)', transformOrigin: 'top left' }}
      >
        <div className="absolute left-[392.32px] top-[118.13px]">
          <svg width="113" height="85" viewBox="0 0 113 85" fill="none">
            <path d="M0.999998 1.00001L11.8342 66.9793L111.892 83.0624L89.3448 15.1947L0.999998 1.00001Z" fill="#FFCFA7" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[368.97px] top-[184.52px]">
          <svg width="133" height="76" viewBox="0 0 133 76" fill="none">
            <path d="M0.999986 60.2895L31.8181 1.00002L131.876 17.0831L89.3453 74.4925L0.999986 60.2895Z" fill="#F06800" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[362.76px] top-[123.94px]">
          <svg width="39" height="128" viewBox="0 0 39 128" fill="none">
            <path d="M0.999998 61.0428L27.1266 1.00001L37.9608 66.9793L7.14266 126.269L0.999998 61.0428Z" fill="white" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Asset 2 1: Bottom Right Vector Group */}
      <div
        data-layer="Asset 2 1"
        className="pointer-events-none absolute right-[-40px] bottom-[-20px] w-[703px] h-[247px] opacity-85 hidden md:block"
      >
        <div className="absolute left-[195.82px] top-[160.75px] w-[507.18px] h-[86.25px] bg-[#FFB090] outline outline-2 outline-[#F06800] -outline-offset-1" />
        <div className="absolute left-[505.46px] top-0">
          <svg width="200" height="112" viewBox="0 0 200 112" fill="none">
            <path d="M1.00012 161.748L38.8168 1L198.542 248L1.00012 161.748Z" fill="#F06800" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute left-[195.82px] top-0">
          <svg width="350" height="112" viewBox="0 0 350 112" fill="none">
            <path d="M348.459 1L1.00012 178.248L310.642 161.748L348.459 1Z" fill="white" stroke="#F06800" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ================= LOGIN FORM CARD (FRAME 6) ================= */}
      <div
        data-layer="Frame 6"
        className="relative z-10 w-full max-w-[460px] rounded-[10px] bg-white p-[24px] sm:p-[32px] shadow-[0px_0px_20px_rgba(0,0,0,0.10)] flex flex-col items-center gap-[20px]"
      >
        {/* Logo */}
        <Image
          data-layer="hd_logo 1"
          src="/logo.png"
          alt="Rakusai Logo"
          width={70}
          height={70}
          className="object-contain"
          priority
        />

        {/* Content & Form */}
        <div className="w-full flex flex-col items-center gap-[24px]">
          {/* Title and Subtitle */}
          <div className="w-full flex flex-col items-center gap-[8px]">
            <h1
              data-layer="ログイン"
              className="text-center text-[20px] font-bold text-black"
            >
              ログイン
            </h1>
            <p
              data-layer="発行されたIDとパスワードを入力してください。"
              className="text-center text-[14px] font-medium text-[#888888]"
            >
              発行されたIDとパスワードを入力してください。
            </p>
          </div>

          {/* Form */}
          <form className="w-full space-y-[20px]" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="rounded-[6px] bg-red-50 p-3 text-[13px] text-red-600 border border-red-200">
                {serverError}
              </div>
            )}

            {/* ID Input */}
            <div data-layer="Frame 1" className="flex flex-col gap-[8px]">
              <label
                htmlFor="login_id"
                data-layer="ID"
                className="text-[14px] font-medium text-black"
              >
                ID
              </label>
              <div className="relative">
                <input
                  id="login_id"
                  type="text"
                  autoComplete="username"
                  className={`w-full h-[48px] px-[16px] bg-white rounded-[6px] outline-none text-[14px] text-black placeholder:text-[#AEAEB2] transition-all ${
                    errors.login_id
                      ? 'border border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border border-[#AEAEB2] focus:border-[#F06800] focus:ring-1 focus:ring-[#F06800]'
                  }`}
                  placeholder="xxx"
                  {...register('login_id')}
                />
              </div>
              {errors.login_id && (
                <p className="text-[12px] text-red-600">{errors.login_id.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div data-layer="Frame 2" className="flex flex-col gap-[8px]">
              <label
                htmlFor="password"
                data-layer="パスワード"
                className="text-[14px] font-medium text-black"
              >
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`w-full h-[48px] px-[16px] bg-white rounded-[6px] outline-none text-[14px] text-black placeholder:text-[#AEAEB2] transition-all ${
                    errors.password
                      ? 'border border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border border-[#AEAEB2] focus:border-[#F06800] focus:ring-1 focus:ring-[#F06800]'
                  }`}
                  placeholder="xxx"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-[12px] text-red-600">{errors.password.message}</p>
              )}

              {/* Forgot Password Link */}
              <div className="text-right">
                <span
                  data-layer="パスワードをお忘れですか?"
                  className="cursor-pointer text-[12px] font-normal text-[#F06800] hover:underline"
                  onClick={() => alert('管理者にお問い合わせください。')}
                >
                  パスワードをお忘れですか?
                </span>
              </div>
            </div>

            {/* Submit Button (Component 5) */}
            <button
              type="submit"
              disabled={isSubmitting}
              data-layer="Component 5"
              className="w-full h-[48px] bg-[#F06800] hover:bg-[#d95d00] active:scale-[0.99] transition-all rounded-[6px] text-white text-[16px] font-medium flex items-center justify-center cursor-pointer disabled:opacity-60 shadow-sm"
            >
              <span data-layer="Primary" className="text-white text-[16px] font-medium">
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
