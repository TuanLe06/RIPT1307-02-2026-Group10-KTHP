import { useEffect, useMemo, useRef, useState } from 'react';
import { App, Button, Form, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PasswordInput from '../../components/common/PasswordInput';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth';

type AuthMode = 'login' | 'register';

interface AuthSliderProps {
  initialMode: AuthMode;
}

const PASSWORD_REQUIREMENTS = [
  { label: 'Ít nhất 8 ký tự', test: (v: string) => v.length >= 8 },
  { label: 'Có chữ hoa (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Có chữ thường (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Có chữ số (0-9)', test: (v: string) => /\d/.test(v) },
  { label: 'Có ký tự đặc biệt', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

const inputClassName =
  'auth-login-input h-[56px] rounded-2xl border-hairline bg-surface-container-lowest px-5 text-[16px] shadow-sm transition-all hover:border-primary focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(1,67,181,0.12)] [&_.ant-input]:text-[16px] [&_.ant-input]:font-medium [&_.material-symbols-outlined]:mr-2 [&_.material-symbols-outlined]:text-[23px]';

const registerInputClassName =
  'auth-login-input h-[48px] rounded-2xl border-hairline bg-surface-container-lowest px-5 text-[16px] shadow-sm transition-all hover:border-primary focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(1,67,181,0.1)] [&_.ant-input]:text-[16px] [&_.ant-input]:font-medium [&_.material-symbols-outlined]:mr-2 [&_.material-symbols-outlined]:text-[23px]';

const submitButtonStyle = {
  backgroundColor: '#0143b5',
  borderColor: '#0143b5',
  height: 52,
  fontSize: 17,
  borderRadius: 9999,
};

const registerSubmitButtonStyle = {
  ...submitButtonStyle,
  height: 52,
  fontSize: 17,
};

const slideDurationMs = 700;
const slideMotion =
  'transform-gpu transition-transform duration-700 ease-in-out will-change-transform';
const formMotion =
  'transform-gpu transition-[transform,opacity] duration-700 ease-in-out will-change-[transform,opacity]';

const authOverlayBackgroundStyle = {
  backgroundImage:
    "linear-gradient(135deg, rgba(1, 67, 181, 0.82), rgba(132, 207, 255, 0.58)), url('/auth_bg.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const AuthSlider = ({ initialMode }: AuthSliderProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [password, setPassword] = useState('');
  const navigationTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isRegister = mode === 'register';

  const overlayPanels = useMemo(
    () => ({
      login: {
        icon: 'login',
        title: 'Đã có tài khoản?',
        description: 'Đăng nhập để tiếp tục quản lý hồ sơ xét tuyển và theo dõi trạng thái mới nhất.',
        button: 'Đăng nhập',
        target: 'login' as AuthMode,
      },
      register: {
        icon: 'person_add',
        title: 'Lần đầu đến AdmisX?',
        description: 'Tạo tài khoản bằng CCCD, email và mật khẩu bảo mật để bắt đầu hành trình xét tuyển.',
        button: 'Đăng ký',
        target: 'register' as AuthMode,
      },
    }),
    [],
  );

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) return;

    setMode(nextMode);

    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current);
    }

    navigationTimerRef.current = window.setTimeout(() => {
      navigate(nextMode === 'login' ? '/login' : '/register', { replace: true });
      navigationTimerRef.current = null;
    }, slideDurationMs);
  };

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        window.clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const onLoginFinish = async (values: Record<string, string>) => {
    setLoginLoading(true);
    try {
      const res = await authApi.login({
        email: values.identifier,
        password: values.mat_khau,
      });
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        message.success('Đăng nhập thành công');
        if (res.data.user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          const candidateUrl = import.meta.env.VITE_CANDIDATE_URL || 'http://localhost:3000';
          window.location.href = `${candidateUrl}?token=${res.data.token}`;
        }
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
      const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'Đăng nhập thất bại, vui lòng thử lại';
      message.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const onRegisterFinish = async (values: Record<string, string>) => {
    setRegisterLoading(true);
    try {
      const res = await authApi.register({
        citizen_id: values.so_cccd.trim(),
        full_name: values.ho_ten,
        email: values.email,
        password: values.mat_khau,
      });
      if (res.success) {
        message.success('Đăng ký tài khoản thành công');
        switchMode('login');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký thất bại, vui lòng thử lại';
      message.error(msg);
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onAuthNavigate={switchMode} />
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-[980px] overflow-hidden rounded-xxxl border border-hairline-soft bg-surface-container-lowest shadow-[0_22px_70px_rgba(15,23,42,0.12)]">
          <div className="lg:hidden border-b border-hairline-soft bg-surface-container-low p-2">
            <div className="grid grid-cols-2 rounded-full bg-surface-container-lowest p-1">
              {(['login', 'register'] as AuthMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchMode(item)}
                  className={`h-11 rounded-full text-sm font-bold transition-all ${
                    mode === item ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary'
                  }`}
                >
                  {item === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[640px] lg:min-h-[660px]">
            <div
              className={`absolute inset-0 grid grid-cols-1 bg-surface-container-lowest ${formMotion} lg:w-1/2 ${
                isRegister
                  ? 'pointer-events-none z-10 opacity-0 lg:translate-x-full lg:opacity-100'
                  : 'pointer-events-auto z-30 opacity-100 lg:translate-x-0'
              }`}
            >
              <div className="flex h-full items-center justify-center p-5 sm:p-7 lg:p-8">
                <div className="w-full max-w-[430px]">
                  <div className="mb-7">
                    <p className="mb-2 text-sm font-bold uppercase text-primary">AdmisX Account</p>
                    <h1 className="text-[32px] leading-tight font-bold text-text-primary sm:text-[38px]">
                      Đăng nhập
                    </h1>
                    <p className="mt-2 text-[16px] leading-7 text-text-secondary">
                      Vui lòng đăng nhập để quản lý hồ sơ xét tuyển của bạn.
                    </p>
                  </div>

                  <Form
                    layout="vertical"
                    onFinish={onLoginFinish}
                    autoComplete="off"
                    requiredMark={false}
                    className="[&_.ant-form-item]:mb-5 [&_.ant-form-item-explain-error]:pt-1"
                  >
                    <Form.Item
                      name="identifier"
                      rules={[{ required: true, message: 'Vui lòng nhập email hoặc số CCCD' }]}
                    >
                      <Input
                        placeholder="Email hoặc số CCCD"
                        prefix={<span className="material-symbols-outlined text-outline">person</span>}
                        size="large"
                        className={inputClassName}
                      />
                    </Form.Item>

                    <Form.Item
                      name="mat_khau"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                      <PasswordInput className={inputClassName} placeholder="Mật khẩu" />
                    </Form.Item>

                    <div className="-mt-3 mb-5 flex justify-end">
                      <Link className="text-[14px] text-primary hover:underline" to="/forgot-password">
                        Quên mật khẩu?
                      </Link>
                    </div>

                    <Form.Item className="pt-0">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loginLoading}
                        block
                        size="large"
                        className="font-bold"
                        style={submitButtonStyle}
                      >
                        Đăng nhập
                      </Button>
                    </Form.Item>
                  </Form>

                  <p className="mt-6 text-center text-[16px] leading-7 text-text-secondary lg:hidden">
                    Bạn chưa có tài khoản?{' '}
                    <button
                      type="button"
                      className="font-bold text-primary hover:underline"
                      onClick={() => switchMode('register')}
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`absolute inset-0 grid grid-cols-1 bg-surface-container-lowest ${formMotion} lg:w-1/2 ${
                isRegister
                  ? 'pointer-events-auto z-30 opacity-100 lg:translate-x-full'
                  : 'pointer-events-none z-10 opacity-0 lg:translate-x-0'
              }`}
            >
              <div className="flex h-full items-center justify-center overflow-y-auto p-4 sm:p-5 lg:overflow-hidden lg:p-5">
                <div className="w-full max-w-[430px] py-1 lg:py-0">
                  <div className="mb-3">
                    <p className="mb-0.5 text-[10px] font-bold uppercase text-primary">Hồ sơ mới</p>
                    <h1 className="text-[22px] leading-tight font-bold text-text-primary sm:text-[24px]">
                      Đăng ký tài khoản mới
                    </h1>
                  </div>

                  <Form
                    layout="vertical"
                    onFinish={onRegisterFinish}
                    autoComplete="off"
                    requiredMark={false}
                    onValuesChange={(changed) => {
                      if ('mat_khau' in changed) setPassword(changed.mat_khau ?? '');
                    }}
                    className="[&_.ant-form-item]:mb-2.5 [&_.ant-form-item-explain-error]:pt-0 [&_.ant-form-item-explain-error]:text-[10px]"
                  >
                    <Form.Item
                      name="ho_ten"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                      <Input
                        placeholder="Họ và tên"
                        prefix={<span className="material-symbols-outlined text-outline">person</span>}
                        size="large"
                        className={registerInputClassName}
                      />
                    </Form.Item>

                    <Form.Item
                      name="so_cccd"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số CCCD' },
                        { pattern: /^\d{12}$/, message: 'Số CCCD phải gồm 12 chữ số' },
                      ]}
                    >
                      <Input
                        placeholder="CCCD"
                        maxLength={12}
                        prefix={<span className="material-symbols-outlined text-outline">badge</span>}
                        size="large"
                        className={registerInputClassName}
                        onInput={(e) => {
                          (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(
                            /[^0-9]/g,
                            '',
                          );
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' },
                      ]}
                    >
                      <Input
                        placeholder="email@vi-du.com"
                        prefix={<span className="material-symbols-outlined text-outline">mail</span>}
                        size="large"
                        className={registerInputClassName}
                      />
                    </Form.Item>

                    <Form.Item
                      name="mat_khau"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' },
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
                      <PasswordInput className={registerInputClassName} placeholder="Mật khẩu" />
                    </Form.Item>

                    {password && (
                      <div className="-mt-1.5 mb-2 rounded-xl bg-surface-container-low px-3 py-2">
                        {PASSWORD_REQUIREMENTS.map((req) => {
                          const ok = req.test(password);
                          return (
                            <div key={req.label} className="flex items-center gap-1 text-[10px] leading-4">
                              <span className={`material-symbols-outlined text-[13px] ${ok ? 'text-success' : 'text-critical'}`}>
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
                      <PasswordInput className={registerInputClassName} placeholder="Xác nhận mật khẩu" />
                    </Form.Item>

                    <Form.Item className="pt-0">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={registerLoading}
                        block
                        size="large"
                        className="font-bold"
                        style={registerSubmitButtonStyle}
                      >
                        Đăng ký ngay
                      </Button>
                    </Form.Item>
                  </Form>

                  <p className="mt-4 text-center text-[16px] leading-7 text-text-secondary lg:hidden">
                    Bạn đã có tài khoản?{' '}
                    <button
                      type="button"
                      className="font-bold text-primary hover:underline"
                      onClick={() => switchMode('login')}
                    >
                      Đăng nhập
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`absolute inset-y-0 left-1/2 z-40 hidden w-1/2 overflow-hidden ${slideMotion} lg:block ${
                isRegister ? '-translate-x-full' : 'translate-x-0'
              }`}
            >
              <div
                className={`absolute top-0 left-[-100%] h-full w-[200%] bg-primary text-white ${slideMotion} ${
                  isRegister ? 'translate-x-1/2' : 'translate-x-0'
                }`}
                style={authOverlayBackgroundStyle}
              >
                <div
                  className={`absolute top-0 flex h-full w-1/2 flex-col items-center justify-center px-12 py-14 text-center ${slideMotion} ${
                    isRegister ? 'translate-x-0' : '-translate-x-[20%]'
                  }`}
                >
                  <img
                    alt="AdmisX Brand Mark"
                    className="mb-8 h-28 w-28 object-contain"
                    src="/logo_3.png"
                  />
                  <span className="material-symbols-outlined mb-5 text-[42px] text-primary-fixed">
                    {overlayPanels.login.icon}
                  </span>
                  <h2 className="max-w-[420px] text-[46px] leading-tight font-bold">{overlayPanels.login.title}</h2>
                  <p className="mt-5 max-w-[420px] text-[18px] leading-8 opacity-90">
                    {overlayPanels.login.description}
                  </p>
                  <Button
                    type="default"
                    size="large"
                    className="pointer-events-auto mt-9 min-w-40 border-white/70 bg-white/10 font-bold text-white hover:!border-white hover:!bg-white hover:!text-primary"
                    onClick={() => switchMode(overlayPanels.login.target)}
                  >
                    {overlayPanels.login.button}
                  </Button>
                </div>

                <div
                  className={`absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-12 py-14 text-center ${slideMotion} ${
                    isRegister ? 'translate-x-[20%]' : 'translate-x-0'
                  }`}
                >
                  <img
                    alt="AdmisX Brand Mark"
                    className="mb-8 h-28 w-28 object-contain"
                    src="/logo_3.png"
                  />
                  <span className="material-symbols-outlined mb-5 text-[42px] text-primary-fixed">
                    {overlayPanels.register.icon}
                  </span>
                  <h2 className="max-w-[420px] text-[46px] leading-tight font-bold">{overlayPanels.register.title}</h2>
                  <p className="mt-5 max-w-[420px] text-[18px] leading-8 opacity-90">
                    {overlayPanels.register.description}
                  </p>
                  <Button
                    type="default"
                    size="large"
                    className="pointer-events-auto mt-9 min-w-40 border-white/70 bg-white/10 font-bold text-white hover:!border-white hover:!bg-white hover:!text-primary"
                    onClick={() => switchMode(overlayPanels.register.target)}
                  >
                    {overlayPanels.register.button}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AuthSlider;
