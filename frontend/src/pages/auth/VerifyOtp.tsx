import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { App } from 'antd';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { authApi } from '../../api/auth';

const RESEND_COOLDOWN = 60;

const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resetPw, setResetPw] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    startCooldown();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCooldown(RESEND_COOLDOWN);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      message.error('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, otp: otpStr });
      if (res.success) {
        setStep('password');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Mã OTP không hợp lệ';
      message.error(msg);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      const res = await authApi.resendOtp({ email });
      if (res.success) {
        message.success('Mã OTP mới đã được gửi đến email của bạn.');
        startCooldown();
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; data?: { remaining?: number } } } };
      const remaining = axiosErr?.response?.data?.data?.remaining;
      const msg =
        axiosErr?.response?.data?.message ||
        'Gửi lại mã thất bại';
      message.error(msg);
      if (remaining) {
        setCooldown(remaining);
        setCanResend(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const PASSWORD_REQUIREMENTS = [
    { label: 'Ít nhất 8 ký tự', test: (v: string) => v.length >= 8 },
    { label: 'Có chữ hoa (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
    { label: 'Có chữ thường (a-z)', test: (v: string) => /[a-z]/.test(v) },
    { label: 'Có chữ số (0-9)', test: (v: string) => /\d/.test(v) },
    { label: 'Có ký tự đặc biệt', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
  ];

  const handleResetPassword = async (values: Record<string, string>) => {
    const otpStr = otp.join('');
    const pw = values.mat_khau;
    if (PASSWORD_REQUIREMENTS.some((r) => !r.test(pw))) {
      message.error('Mật khẩu chưa đạt yêu cầu');
      return;
    }
    if (pw !== values.xac_nhan_mat_khau) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email,
        otp: otpStr,
        password: pw,
      });
      if (res.success) {
        message.success('Mật khẩu đã được đặt lại thành công.');
        navigate('/login', { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đặt lại mật khẩu thất bại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderOtpStep = () => (
    <div className="space-y-lg">
      <div className="flex justify-between gap-2 max-w-[320px] mx-auto" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border border-hairline rounded-lg focus:ring-4 focus:ring-primary-soft focus:border-primary outline-none bg-surface-container-lowest text-on-surface transition-all"
            maxLength={1}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            autoFocus={index === 0}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-[15px] md:text-[16px] leading-[1.6] text-text-secondary">
          Bạn không nhận được mã?{' '}
          {canResend ? (
            <button
              className="text-primary font-bold hover:underline transition-all bg-transparent border-none cursor-pointer text-[15px] md:text-[16px]"
              onClick={handleResendOtp}
              disabled={loading}
            >
              Gửi lại mã
            </button>
          ) : (
            <span className="text-text-secondary">
              Gửi lại mã ({cooldown}s)
            </span>
          )}
        </p>
      </div>

      <div className="pt-sm">
        <button
          className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-[16px] py-3 rounded-full active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleVerifyOtp}
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? 'Đang xác thực...' : 'Xác nhận'}
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = () => {
    const pw = resetPw;

    return (
      <form className="space-y-md" onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleResetPassword(Object.fromEntries(formData) as Record<string, string>);
      }}>
        <div>
          <label className="block text-[15px] md:text-[16px] leading-[1.5] font-semibold text-text-primary mb-1.5" htmlFor="mat_khau_reset">
            Mật khẩu mới
          </label>
          <input
            className="w-full px-4 py-2.5 border border-hairline rounded-lg focus:ring-4 focus:ring-primary-soft focus:border-primary outline-none text-[15px] bg-surface-container-lowest text-on-surface transition-all"
            id="mat_khau_reset"
            name="mat_khau"
            type="password"
            placeholder="Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt"
            required
            value={resetPw}
            onChange={(e) => setResetPw(e.target.value)}
          />
          {pw && (
            <div className="-mt-1">
              {PASSWORD_REQUIREMENTS.map((req) => {
                const ok = req.test(pw);
                return (
                  <div key={req.label} className="flex items-center gap-1.5 text-sm leading-6">
                    <span className={`text-base leading-none ${ok ? 'text-green-600' : 'text-red-500'}`}>
                      {ok ? '✓' : '✗'}
                    </span>
                    <span className={ok ? 'text-green-600' : 'text-red-500'}>{req.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <label className="block text-[15px] md:text-[16px] leading-[1.5] font-semibold text-text-primary mb-1.5" htmlFor="xac_nhan_mat_khau_reset">
            Xác nhận mật khẩu
          </label>
          <input
            className="w-full px-4 py-2.5 border border-hairline rounded-lg focus:ring-4 focus:ring-primary-soft focus:border-primary outline-none text-[15px] bg-surface-container-lowest text-on-surface transition-all"
            id="xac_nhan_mat_khau_reset"
            name="xac_nhan_mat_khau"
            type="password"
            placeholder="Nhập lại mật khẩu"
            required
            onChange={() => {}}
          />
        </div>
        <div className="pt-sm">
          <button
            className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-[16px] py-3 rounded-full active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-container to-secondary items-center justify-center text-white relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col items-center justify-center px-12 py-16 w-full">
            <img
              alt="AdmisX Brand Mark"
              className="w-28 h-28 md:w-32 md:h-32 mb-8 md:mb-10 rounded-2xl shadow-2xl bg-white/90 p-4"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsZ8PgnmBWF7MzIsdKEp8EgUJYxYGTS6L0o70U_gJssmzKeeFRfri8zsvA6_71Rs09BLDMOzfSeizXC2eVpx13w5vzEiIHv6cX_4HpU7wjFVXioOxIvmNTbNN_7v9NR29Ps0aFrFp2VwfNVi8HUWDD5MrTkVMaLAEy2cWHJ8TKxRSXig1ci3Vcw1ziQw41-Gu09wYVHHpKuZpFG7pFJt8dDzOxVle9zRfVGUKbJtMwSbmwuhAU0FMI2rm_dPJiPtE7shKiyopZvEo"
            />
            <h1 className="text-[52px] md:text-[64px] lg:text-[72px] leading-[1.1] font-bold tracking-tight text-center max-w-[520px]">
              Chào mừng
              <br />
              quay trở lại
            </h1>
            <p className="text-[22px] md:text-[24px] lg:text-[26px] leading-[1.6] font-light opacity-90 mt-5 mb-10 text-center max-w-[440px]">
              Hệ thống tuyển sinh đại học thông minh, đồng hành cùng bạn trên con đường kiến tạo tương lai.
            </p>
            <div className="glass-effect p-6 md:p-7 rounded-2xl w-full max-w-[460px]">
              <div className="flex items-start gap-4 mb-5">
                <span className="material-symbols-outlined text-[26px] text-primary-fixed shrink-0 mt-0.5">verified</span>
                <p className="text-[17px] md:text-[18px] leading-[1.7]">Hệ thống xác thực danh tính an toàn qua Citizen ID.</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[26px] text-primary-fixed shrink-0 mt-0.5">speed</span>
                <p className="text-[17px] md:text-[18px] leading-[1.7]">Xử lý hồ sơ nhanh chóng, cập nhật trạng thái thời gian thực.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
          <div className="w-full max-w-[580px] bg-surface-container-lowest p-6 sm:p-8 md:p-10 rounded-xxxl border border-hairline-soft">
            {step === 'otp' ? (
              <>
                <div className="mb-7 md:mb-8">
                  <h2 className="text-[32px] sm:text-[34px] md:text-[38px] leading-[1.2] font-bold text-text-primary mb-2">Xác thực OTP</h2>
                  <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">
                    Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email <strong className="text-text-primary">{email}</strong>. Vui lòng kiểm tra hộp thư đến.
                  </p>
                </div>
                {renderOtpStep()}
              </>
            ) : (
              <>
                <div className="mb-7 md:mb-8">
                  <h2 className="text-[32px] sm:text-[34px] md:text-[38px] leading-[1.2] font-bold text-text-primary mb-2">Đặt mật khẩu mới</h2>
                  <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">
                    Vui lòng nhập mật khẩu mới cho tài khoản <strong className="text-text-primary">{email}</strong>.
                  </p>
                </div>
                {renderPasswordStep()}
              </>
            )}

            <div className="mt-8 text-center">
              <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">
                {step === 'otp' ? (
                  <>Bạn đã nhớ mật khẩu?{' '}
                    <Link className="text-primary font-bold hover:underline transition-all" to="/login">
                      Quay lại đăng nhập
                    </Link>
                  </>
                ) : (
                  <button
                    className="text-primary font-bold hover:underline transition-all bg-transparent border-none cursor-pointer text-[17px] md:text-[18px]"
                    onClick={() => { setStep('otp'); setOtp(Array(6).fill('')); }}
                  >
                    Quay lại nhập OTP
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyOtp;
