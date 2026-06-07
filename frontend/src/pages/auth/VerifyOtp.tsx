import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Form } from 'antd';
import AuthFormShell from './AuthFormShell';
import PasswordInput from '../../components/common/PasswordInput';
import { authApi } from '../../api/auth';

const RESEND_COOLDOWN = 60;

const PASSWORD_REQUIREMENTS = [
  { label: 'Ít nhất 8 ký tự', test: (v: string) => v.length >= 8 },
  { label: 'Có chữ hoa (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Có chữ thường (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Có chữ số (0-9)', test: (v: string) => /\d/.test(v) },
  { label: 'Có ký tự đặc biệt', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

const inputClassName =
  'auth-login-input h-[56px] rounded-2xl border-hairline bg-surface-container-lowest px-5 text-[16px] shadow-sm transition-all hover:border-primary focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(1,67,181,0.12)] [&_.ant-input]:text-[16px] [&_.ant-input]:font-medium [&_.material-symbols-outlined]:mr-2 [&_.material-symbols-outlined]:text-[23px]';

const submitButtonStyle = {
  backgroundColor: '#0143b5',
  borderColor: '#0143b5',
  height: 52,
  fontSize: 17,
  borderRadius: 9999,
};

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
  }, [startCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

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
    const nextOtp = [...otp];

    for (let i = 0; i < pasted.length; i += 1) {
      nextOtp[i] = pasted[i];
    }

    setOtp(nextOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
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
        message.success('Mã OTP mới đã được gửi đến email của cậu.');
        startCooldown();
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; data?: { remaining?: number } } } };
      const remaining = axiosErr?.response?.data?.data?.remaining;
      const msg = axiosErr?.response?.data?.message || 'Gửi lại mã thất bại';
      message.error(msg);
      if (remaining) {
        setCooldown(remaining);
        setCanResend(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: Record<string, string>) => {
    const otpStr = otp.join('');
    const pw = values.mat_khau;

    if (PASSWORD_REQUIREMENTS.some((r) => !r.test(pw))) {
      message.error('Mật khẩu chưa đạt yêu cầu');
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
    <div className="space-y-5">
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            className="h-12 w-12 rounded-xl border border-hairline bg-surface-container-lowest text-center text-xl font-bold text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-soft sm:h-14 sm:w-14"
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

      <p className="text-center text-[15px] leading-6 text-text-secondary">
        Cậu không nhận được mã?{' '}
        {canResend ? (
          <button
            className="border-none bg-transparent text-[15px] font-bold text-primary transition-all hover:underline disabled:opacity-60"
            onClick={handleResendOtp}
            disabled={loading}
            type="button"
          >
            Gửi lại mã
          </button>
        ) : (
          <span>Gửi lại mã ({cooldown}s)</span>
        )}
      </p>

      <Button
        type="primary"
        loading={loading}
        disabled={otp.join('').length !== 6}
        block
        size="large"
        className="font-bold"
        style={submitButtonStyle}
        onClick={handleVerifyOtp}
      >
        Xác nhận
      </Button>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3">
        <div className="flex items-center gap-2 text-[14px] font-bold text-success">
          <span className="material-symbols-outlined text-[19px]">check_circle</span>
          OTP đã xác thực
        </div>
        <p className="mt-1 text-[13px] leading-5 text-text-secondary">
          Nhập mật khẩu mới ngay trong form này để hoàn tất khôi phục tài khoản.
        </p>
      </div>

      <Form
        layout="vertical"
        onFinish={handleResetPassword}
        autoComplete="off"
        requiredMark={false}
        onValuesChange={(changed) => {
          if ('mat_khau' in changed) setResetPw(changed.mat_khau ?? '');
        }}
        className="[&_.ant-form-item]:mb-4 [&_.ant-form-item-explain-error]:pt-1"
      >
        <Form.Item
          name="mat_khau"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const fail = PASSWORD_REQUIREMENTS.find((r) => !r.test(value));
                return fail
                  ? Promise.reject(new Error('Mật khẩu chưa đạt yêu cầu'))
                  : Promise.resolve();
              },
            },
          ]}
        >
          <PasswordInput className={inputClassName} placeholder="Mật khẩu mới" />
        </Form.Item>

        {resetPw && (
          <div className="-mt-2 mb-4 rounded-xl bg-surface-container-low px-3 py-2">
            {PASSWORD_REQUIREMENTS.map((req) => {
              const ok = req.test(resetPw);
              return (
                <div key={req.label} className="flex items-center gap-1.5 text-[12px] leading-5">
                  <span className={`material-symbols-outlined text-[15px] ${ok ? 'text-success' : 'text-critical'}`}>
                    {ok ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={ok ? 'text-success' : 'text-critical'}>{req.label}</span>
                </div>
              );
            })}
          </div>
        )}

        <Form.Item
          name="xac_nhan_mat_khau"
          dependencies={['mat_khau']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('mat_khau') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
              },
            }),
          ]}
        >
          <PasswordInput className={inputClassName} placeholder="Xác nhận mật khẩu" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          className="font-bold"
          style={submitButtonStyle}
        >
          Đặt lại mật khẩu
        </Button>
      </Form>
    </div>
  );

  return (
    <AuthFormShell
      eyebrow="AdmisX Account"
      title="Xác thực OTP"
      description={
        <>
          Nhập mã xác thực gồm 6 chữ số đã gửi đến{' '}
          <strong className="text-text-primary">{email}</strong>, rồi đặt mật khẩu mới trong cùng form.
        </>
      }
      visualIcon="pin"
      visualTitle="Kiểm tra email của cậu"
      visualDescription="Nhập mã OTP để xác minh yêu cầu khôi phục mật khẩu trong AdmisX."
      footer={
        step === 'otp' ? (
          <p>
            Cậu đã nhớ mật khẩu?{' '}
            <Link className="font-bold text-primary transition-all hover:underline" to="/login">
              Quay lại đăng nhập
            </Link>
          </p>
        ) : (
          <button
            className="border-none bg-transparent text-[16px] font-bold text-primary transition-all hover:underline"
            onClick={() => {
              setStep('otp');
              setOtp(Array(6).fill(''));
            }}
            type="button"
          >
            Quay lại nhập OTP
          </button>
        )
      }
    >
      {step === 'otp' ? renderOtpStep() : renderPasswordStep()}
    </AuthFormShell>
  );
};

export default VerifyOtp;
