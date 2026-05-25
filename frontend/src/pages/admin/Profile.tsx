import { Tag, Descriptions, Divider, Card, Spin } from 'antd';
import { useAuthStore } from '../../store/auth';
import {
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const Profile = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) return <Spin />;

  const statusColor: Record<string, string> = {
    ACTIVE: 'green',
    LOCKED: 'red',
    PENDING: 'orange',
  };

  const statusText: Record<string, string> = {
    ACTIVE: 'Hoạt động',
    LOCKED: 'Bị khóa',
    PENDING: 'Chờ xác thực',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-h2-page-title text-h2-page-title text-text-primary">
          Thông tin tài khoản
        </h2>
        <p className="text-text-secondary font-body mt-1">
          Quản lý thông tin cá nhân và bảo mật
        </p>
      </div>

      <Card className="!bg-surface-container-lowest !border-outline-variant !shadow-sm !rounded-xl">
        <div className="flex items-center gap-5 pb-6 border-b border-outline-variant">
          <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-2xl font-bold shrink-0">
            A
          </div>
          <div>
            <h3 className="font-h4-card-header text-h4-card-header text-text-primary">
              Quản trị viên
            </h3>
            <p className="text-text-secondary font-body mt-0.5">{user.email}</p>
          </div>
        </div>

        <Descriptions
          column={1}
          className="mt-5"
          labelStyle={{
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            paddingBottom: 12,
            whiteSpace: 'nowrap',
          }}
          contentStyle={{ paddingBottom: 12 }}
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <MailOutlined className="text-text-secondary" /> Email
              </span>
            }
          >
            <span className="font-body text-body text-text-primary">{user.email}</span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <SafetyCertificateOutlined className="text-text-secondary" /> Vai trò
              </span>
            }
          >
            <Tag color="blue">Admin</Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <CheckCircleOutlined className="text-text-secondary" /> Trạng thái
              </span>
            }
          >
            <Tag color={statusColor[user.status]}>{statusText[user.status]}</Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <UserOutlined className="text-text-secondary" /> ID
              </span>
            }
          >
            <span className="font-body text-body text-text-primary">{user.id}</span>
          </Descriptions.Item>
        </Descriptions>

        <Divider className="!border-outline-variant !my-4" />

        <Descriptions
          column={1}
          labelStyle={{
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            paddingBottom: 12,
            whiteSpace: 'nowrap',
          }}
          contentStyle={{ paddingBottom: 12 }}
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined className="text-text-secondary" /> Đăng nhập gần nhất
              </span>
            }
          >
            <span className="font-body text-body text-text-primary">
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString('vi-VN')
                : 'Chưa có'}
            </span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined className="text-text-secondary" /> Ngày tạo
              </span>
            }
          >
            <span className="font-body text-body text-text-primary">
              {new Date(user.created_at).toLocaleString('vi-VN')}
            </span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined className="text-text-secondary" /> Cập nhật gần nhất
              </span>
            }
          >
            <span className="font-body text-body text-text-primary">
              {new Date(user.updated_at).toLocaleString('vi-VN')}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile;
