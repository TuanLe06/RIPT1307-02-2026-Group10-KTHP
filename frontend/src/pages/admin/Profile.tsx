import { Tag, Spin, App } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../api/auth';

const Profile = () => {
  const { message } = App.useApp();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

  const createdDate = new Date(user.created_at).toLocaleDateString('vi-VN');
  const lastLogin = user.last_login_at
    ? new Date(user.last_login_at).toLocaleString('vi-VN')
    : 'Chưa có';
  const updatedDate = new Date(user.updated_at).toLocaleString('vi-VN');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('Ảnh tối đa 5MB');
      return;
    }
    setUploading(true);
    try {
      const res = await authApi.uploadAvatar(file);
      if (res.success && res.data) {
        setUser(res.data);
        message.success('Cập nhật avatar thành công');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload thất bại';
      message.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setUploading(true);
    try {
      const res = await authApi.deleteAvatar();
      if (res.success && res.data) {
        setUser(res.data);
        message.success('Đã xoá avatar');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xoá thất bại';
      message.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-h2-page-title text-h2-page-title text-text-primary">
          Thông tin tài khoản
        </h2>
        <p className="text-text-secondary font-body mt-1">
          Thông tin cá nhân và hoạt động tài khoản
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="bg-surface-container-lowest border border-hairline-soft rounded-xxl overflow-hidden">
            <div className="px-5 py-4 border-b border-hairline-soft bg-surface-container-low flex items-center justify-between">
              <h3 className="font-h5-subsection text-h5-subsection text-text-primary">
                Thông tin cá nhân
              </h3>
              <span className="font-metadata text-metadata px-2 py-1 bg-primary-container/10 text-primary rounded-full">
                ID: {user.id}
              </span>
            </div>
            <div className="p-5">
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="flex flex-col items-center gap-3 w-full md:w-auto">
                  {user.avatar_url ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 shadow-md border border-hairline-soft">
                      <img
                        src={user.avatar_url}
                        alt={user.email}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary text-on-primary flex items-center justify-center text-4xl font-bold shadow-md">
                      {user.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      <UploadOutlined />
                      {uploading ? 'Đang tải...' : user.avatar_url ? 'Đổi avatar' : 'Tải avatar'}
                    </button>
                    {user.avatar_url && (
                      <button
                        onClick={handleDelete}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-surface-container-high text-text-primary rounded-lg text-sm font-medium hover:bg-error-container/20 transition-colors disabled:opacity-50"
                      >
                        <DeleteOutlined />
                        Xoá avatar
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1">
                    <label className="font-label text-label text-text-primary">Họ và Tên</label>
                    <input
                      className="w-full h-10 border border-hairline rounded-lg px-4 text-body bg-surface-container-low text-text-secondary cursor-not-allowed"
                      type="text"
                      value="Quản trị viên"
                      disabled
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label text-label text-text-primary">Mã quản trị</label>
                    <input
                      className="w-full h-10 border border-hairline rounded px-4 text-body bg-surface-container-low text-text-secondary cursor-not-allowed"
                      type="text"
                      value={String(user.id)}
                      disabled
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label text-label text-text-primary">Email liên hệ</label>
                    <input
                      className="w-full h-10 border border-hairline rounded px-4 text-body bg-surface-container-low text-text-secondary cursor-not-allowed"
                      type="email"
                      value={user.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label text-label text-text-primary">Số điện thoại</label>
                    <input
                      className="w-full h-10 border border-hairline rounded px-4 text-body bg-surface-container-low text-text-secondary cursor-not-allowed"
                      type="tel"
                      value="--"
                      disabled
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label text-label text-text-primary">Vai trò hệ thống</label>
                    <div className="w-full h-10 border border-hairline rounded px-4 flex items-center bg-surface-container-low">
                      <span className="material-symbols-outlined text-sm mr-1 text-primary">
                        verified_user
                      </span>
                      <span className="text-body font-bold text-primary">Admin</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label text-label text-text-primary">Ngày gia nhập</label>
                    <input
                      className="w-full h-10 border border-hairline rounded px-4 text-body bg-surface-container-low text-text-secondary cursor-not-allowed"
                      type="text"
                      value={createdDate}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest border border-hairline-soft rounded-xxl overflow-hidden">
            <div className="px-5 py-4 border-b border-hairline-soft bg-surface-container-low flex items-center justify-between">
              <h3 className="font-h5-subsection text-h5-subsection text-text-primary">
                Hoạt động tài khoản
              </h3>
              <span className="material-symbols-outlined text-text-secondary cursor-pointer hover:text-primary transition-colors text-lg">
                history
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined text-[24px]">login</span>
                </div>
                <div>
                  <p className="font-label text-label text-text-primary">Đăng nhập gần nhất</p>
                  <p className="text-body text-text-secondary">{lastLogin}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined text-[24px]">update</span>
                </div>
                <div>
                  <p className="font-label text-label text-text-primary">Cập nhật gần nhất</p>
                  <p className="text-body text-text-secondary">{updatedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined text-[24px]">badge</span>
                </div>
                <div>
                  <p className="font-label text-label text-text-primary">Trạng thái</p>
                  <Tag color={statusColor[user.status]} className="!mt-0.5">
                    {statusText[user.status]}
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
