import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { App, Button, Form, Input } from 'antd';
import AuthFormShell from './AuthFormShell';
import { authApi } from '../../api/auth';

const inputClassName =
  'auth-login-input h-[56px] rounded-2xl border-hairline bg-surface-container-lowest px-5 text-[16px] shadow-sm transition-all hover:border-primary focus-within:border-primary focus-within:shadow-[0_0_0_4px_rgba(1,67,181,0.12)] [&_.ant-input]:text-[16px] [&_.ant-input]:font-medium [&_.material-symbols-outlined]:mr-2 [&_.material-symbols-outlined]:text-[23px]';

const submitButtonStyle = {
  backgroundColor: '#0143b5',
  borderColor: '#0143b5',
  height: 52,
  fontSize: 17,
  borderRadius: 9999,
};

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
    <AuthFormShell
      eyebrow="AdmisX Account"
      title="Quên mật khẩu"
      description="Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu."
      visualIcon="mark_email_unread"
      visualTitle="Lấy lại quyền truy cập"
      visualDescription="AdmisX sẽ gửi mã xác thực đến email của bạn để đặt lại mật khẩu an toàn."
      footer={
        <p>
          Bạn đã nhớ mật khẩu?{' '}
          <Link className="font-bold text-primary transition-all hover:underline" to="/login">
            Quay lại đăng nhập
          </Link>
        </p>
      }
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        requiredMark={false}
        className="[&_.ant-form-item]:mb-5 [&_.ant-form-item-explain-error]:pt-1"
      >
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
            className={inputClassName}
          />
        </Form.Item>

        <Form.Item className="pt-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            className="font-bold"
            style={submitButtonStyle}
          >
            Gửi mã xác nhận
          </Button>
        </Form.Item>
      </Form>
    </AuthFormShell>
  );
};

export default ForgotPassword;
