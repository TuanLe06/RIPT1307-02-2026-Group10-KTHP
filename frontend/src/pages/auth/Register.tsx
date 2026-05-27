import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, App } from 'antd';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PasswordInput from '../../components/common/PasswordInput';
import { authApi } from '../../api/auth';

const PASSWORD_REQUIREMENTS = [
  { label: 'Ít nhất 8 ký tự', test: (v: string) => v.length >= 8 },
  { label: 'Có chữ hoa (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Có chữ thường (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Có chữ số (0-9)', test: (v: string) => /\d/.test(v) },
  { label: 'Có ký tự đặc biệt', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        citizen_id: Number(values.so_cccd),
        full_name: values.ho_ten,
        email: values.email,
        password: values.mat_khau,
      });
      if (res.success) {
        message.success('Đăng ký tài khoản thành công');
        navigate('/login', { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký thất bại, vui lòng thử lại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex pt-14 md:pt-16">
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
              Chào mừng<br />đến với AdmisX
            </h1>
            <p className="text-[22px] md:text-[24px] lg:text-[26px] leading-[1.6] font-light opacity-90 mt-5 mb-10 text-center max-w-[440px]">
              Cổng đăng ký xét tuyển đại học hiện đại, minh bạch và tối ưu hóa cho tương lai của bạn.
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
          <div className="w-full max-w-[580px] bg-surface-container-lowest p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl border border-border">
            <div className="mb-7 md:mb-8">
              <h2 className="text-[32px] sm:text-[34px] md:text-[38px] leading-[1.2] font-bold text-text-primary mb-2">Tạo tài khoản mới</h2>
              <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">Điền thông tin của bạn để bắt đầu hành trình nhập học.</p>
            </div>

            <Form layout="vertical" onFinish={onFinish} autoComplete="off" requiredMark={false} onValuesChange={(changed) => { if ('mat_khau' in changed) setPassword(changed.mat_khau); }}>
              <Form.Item
                name="ho_ten"
                label={<span className="text-[17px] md:text-[18px] leading-[1.5] font-semibold text-text-primary">Họ và tên</span>}
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input
                  placeholder="Nguyễn Văn A"
                  prefix={<span className="material-symbols-outlined text-outline">person</span>}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="so_cccd"
                label={<span className="text-[17px] md:text-[18px] leading-[1.5] font-semibold text-text-primary">Số CCCD (12 chữ số)</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập số CCCD' },
                  { pattern: /^\d{12}$/, message: 'Số CCCD phải gồm 12 chữ số' },
                ]}
              >
                <Input
                  placeholder="012345678912"
                  maxLength={12}
                  prefix={<span className="material-symbols-outlined text-outline">badge</span>}
                  size="large"
                  onInput={(e) => {
                    (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
                  }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="text-[17px] md:text-[18px] leading-[1.5] font-semibold text-text-primary">Email</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input
                  placeholder="email@vi-du.com"
                  prefix={<span className="material-symbols-outlined text-outline">mail</span>}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="mat_khau"
                label={<span className="text-[17px] md:text-[18px] leading-[1.5] font-semibold text-text-primary">Mật khẩu</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const fail = PASSWORD_REQUIREMENTS.find((r) => !r.test(value));
                      return fail ? Promise.reject(new Error('Mật khẩu chưa đạt yêu cầu')) : Promise.resolve();
                    },
                  },
                ]}
              >
                <PasswordInput />
              </Form.Item>
              {password && (
                <div className="-mt-4 mb-2">
                  {PASSWORD_REQUIREMENTS.map((req) => {
                    const ok = req.test(password);
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

              <Form.Item
                name="xac_nhan_mat_khau"
                label={<span className="text-[17px] md:text-[18px] leading-[1.5] font-semibold text-text-primary">Xác nhận mật khẩu</span>}
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
                <PasswordInput />
              </Form.Item>

              <Form.Item className="pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="font-bold shadow-sm"
                  style={{
                    backgroundColor: '#00a1e0',
                    borderColor: '#00a1e0',
                    height: 54,
                    fontSize: 18,
                    borderRadius: 8,
                  }}
                >
                  Đăng ký ngay
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-6 md:mt-8 text-center">
              <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">
                Bạn đã có tài khoản?{' '}
                <Link className="text-primary font-bold hover:underline transition-all" to="/login">
                  Đăng nhập
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex justify-center">
              <Button
                type="default"
                className="text-text-secondary"
                style={{ fontSize: 16, borderColor: '#D8DDE6', background: 'transparent' }}
              >
                Hỗ trợ kỹ thuật
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
