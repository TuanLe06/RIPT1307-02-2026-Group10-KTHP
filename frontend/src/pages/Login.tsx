import { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, App } from "antd";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PasswordInput from "../components/common/PasswordInput";
import { loginSchema } from "../validations/auth";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/auth";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values: Record<string, string>) => {
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      message.error(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({
        citizenId: result.data.so_cccd,
        password: result.data.mat_khau,
      });
      if (res.success && res.data) {
        setAuth(
          {
            ma_nguoi_dung: res.data.ma_nguoi_dung,
            email: res.data.email,
            ho_ten: res.data.ho_ten,
            vai_tro: res.data.vai_tro,
          },
          res.data.token,
        );
        message.success("Đăng nhập thành công");
      }
    } catch {
      message.error("Đăng nhập thất bại, vui lòng thử lại");
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
              Chào mừng
              <br />
              quay trở lại
            </h1>
            <p className="text-[22px] md:text-[24px] lg:text-[26px] leading-[1.6] font-light opacity-90 mt-5 mb-10 text-center max-w-[440px]">
              Đăng nhập để tiếp tục hành trình xét tuyển đại học của bạn cùng
              AdmisX.
            </p>
            <div className="glass-effect p-6 md:p-7 rounded-2xl w-full max-w-[460px]">
              <div className="flex items-start gap-4 mb-5">
                <span className="material-symbols-outlined text-[26px] text-primary-fixed shrink-0 mt-0.5">
                  verified
                </span>
                <p className="text-[17px] md:text-[18px] leading-[1.7]">
                  Đăng nhập an toàn với tài khoản đã được xác thực.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[26px] text-primary-fixed shrink-0 mt-0.5">
                  sync_lock
                </span>
                <p className="text-[17px] md:text-[18px] leading-[1.7]">
                  Bảo mật thông tin tuyệt đối với hệ thống mã hóa tiên tiến.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
          <div className="w-full max-w-[580px] bg-surface-container-lowest p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl border border-border">
            <div className="mb-7 md:mb-8">
              <h2 className="text-[32px] sm:text-[34px] md:text-[38px] leading-[1.2] font-bold text-text-primary mb-2">
                Đăng nhập
              </h2>
              <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">
                Vui lòng đăng nhập để quản lý hồ sơ xét tuyển của bạn.
              </p>
            </div>

            <Form
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              requiredMark={false}
            >
              <Form.Item
                name="so_cccd"
                label={
                  <span className="text-[17px] md:text-[18px] leading-[1.5] font-semibold text-text-primary">
                    Số CCCD
                  </span>
                }
                rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}
              >
                <Input
                  placeholder="012345678912"
                  prefix={
                    <span className="material-symbols-outlined text-outline">
                      badge
                    </span>
                  }
                  size="large"
                  onInput={(e) => {
                    (e.target as HTMLInputElement).value = (
                      e.target as HTMLInputElement
                    ).value.replace(/[^0-9]/g, "");
                  }}
                />
              </Form.Item>

              <Form.Item
                name="mat_khau"
                label={
                  <div className="flex justify-between items-center w-full gap-4">
                    <span className="text-[17px] md:text-[18px] leading-[1.5] font-semibold text-text-primary whitespace-nowrap">
                      Mật khẩu
                    </span>
                    <a
                      className="text-[15px] text-primary hover:underline whitespace-nowrap"
                      href="#"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                }
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
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
                    backgroundColor: "#00a1e0",
                    borderColor: "#00a1e0",
                    height: 54,
                    fontSize: 18,
                    borderRadius: 8,
                  }}
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-surface-container-lowest text-[15px] leading-[1.5] text-text-secondary">
                  HOẶC TIẾP TỤC VỚI
                </span>
              </div>
            </div>

            <Button
              block
              className="flex items-center justify-center gap-3 !h-auto py-3 border-border font-semibold"
              style={{ fontSize: 20, borderRadius: 8 }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <div className="mt-8 text-center">
              <p className="text-[17px] md:text-[18px] leading-[1.6] text-text-secondary">
                Bạn chưa có tài khoản?{" "}
                <Link
                  className="text-primary font-bold hover:underline transition-all"
                  to="/register"
                >
                  Đăng ký ngay
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

export default Login;
