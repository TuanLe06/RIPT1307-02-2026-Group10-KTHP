import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, App } from 'antd';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { authApi } from '../../api/auth';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: values.email });
      if (res.success) {
        message.success('Mã OTP đã được gửi đến email của bạn.');
        navigate(`/verify-otp?email=${encodeURIComponent(values.email)}`);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gửi mã thất bại, vui lòng thử lại';
      message.error(msg);
    } finally {
      setLoading(false);
    }
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
            <div className="mb-7 md:mb-8">
              <h2 className="text-[32px] sm:text-[34px] md:text-[38px] leading-[1.2] font-bold text-text-primary mb-2">Quên mật khẩu</h2>
              <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">
                Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu.
              </p>
            </div>

            <Form
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label={
                  <span className="text-[17px] md:text-[18px] leading-[1.5] font-semibold text-text-primary">Email</span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input
                  placeholder="email@vi-du.com"
                  prefix={
                    <span className="material-symbols-outlined text-outline">mail</span>
                  }
                  size="large"
                />
              </Form.Item>

              <Form.Item className="pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="font-bold"
                  style={{
                    backgroundColor: '#0143b5',
                    borderColor: '#0143b5',
                    height: 54,
                    fontSize: 18,
                    borderRadius: 9999,
                  }}
                >
                  Gửi mã xác nhận
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-8 text-center">
              <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">
                Bạn đã nhớ mật khẩu?{' '}
                <Link
                  className="text-primary font-bold hover:underline transition-all"
                  to="/login"
                >
                  Quay lại đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
