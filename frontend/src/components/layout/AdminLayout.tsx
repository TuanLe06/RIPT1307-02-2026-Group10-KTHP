import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Badge, Modal } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../api/auth';
import { notificationApi, type AdminNotification } from '../../api/notifications';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../hooks/useTheme';
import Footer from './Footer';

const navItems = [
  {
    path: '/admin',
    icon: 'dashboard',
    label: 'Tổng quan',
  },
  {
    path: '/admin/universities',
    icon: 'school',
    label: 'Trường học',
  },
  {
    path: '/admin/majors',
    icon: 'menu_book',
    label: 'Ngành học',
  },
  {
    path: '/admin/combinations',
    icon: 'description',
    label: 'Tổ hợp',
  },
  {
    path: '/admin/applications',
    icon: 'file_copy',
    label: 'Hồ sơ',
  },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle: toggleTheme } = useTheme();
  const activePath = '/' + location.pathname.split('/').slice(1, 3).join('/');

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await notificationApi.getAdminNotifications({ page: 1, limit: 5 });
      setNotifications(res.data || []);
    } catch {
      // ignore
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useSocket({
    'new-submission': fetchNotifications,
    'application-updated': fetchNotifications,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return 'Vài phút trước';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleMarkRead = useCallback(async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n)),
      );
    } catch {
      // ignore
    }
  }, []);

  const unreadCount = notifications.filter((n) => n.status === 'PENDING').length;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    navigate('/login', { replace: true });
  };

  const renderNav = (full: boolean) => (
    <nav className={`flex-1 flex flex-col gap-2 py-4 overflow-y-auto ${full ? 'px-3' : 'px-2'}`}>
      {navItems.map((item) => {
        const isActive = activePath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`group flex items-center gap-3 border px-3 py-3 transition-all duration-200 ${
              isActive
                ? 'border-primary bg-primary text-on-primary font-bold'
                : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary hover:bg-surface-container-high hover:text-primary'
            } ${full ? '' : 'justify-center'}`}
          >
            <span
              className={`material-symbols-outlined text-xl shrink-0 transition-colors ${
                isActive ? 'text-on-primary' : 'text-primary group-hover:text-primary'
              }`}
            >
              {item.icon}
            </span>
            {full && (
              <span className="font-label text-[15px] truncate">{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebar = (full: boolean) => (
    <>
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-outline-variant ${full ? 'px-5' : 'justify-center'}`}>
        {logoError ? (
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold shrink-0">
            A
          </div>
        ) : (
          <img
            src="/logo_3.png"
            alt="AdmisX Logo"
            className="w-9 h-9 rounded-lg shrink-0 object-contain"
            onError={() => setLogoError(true)}
          />
        )}
        {full && (
          <div className="min-w-0">
            <h1 className="font-h4-card-header text-h4-card-header text-text-primary leading-tight truncate">
              AdmisX Admin
            </h1>
            <p className="font-metadata text-metadata text-text-secondary truncate">
              Management Portal
            </p>
          </div>
        )}
      </div>

      {renderNav(full)}

      <div className={`border-t border-outline-variant pt-3 pb-4 ${full ? 'px-3' : 'px-2'}`}>
        <button
          type="button"
          onClick={() => {
            setSupportOpen(true);
            setMobileOpen(false);
          }}
          className={`group w-full flex items-center gap-3 border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface-variant transition-all duration-200 hover:border-primary hover:bg-surface-container-high hover:text-primary ${full ? '' : 'justify-center'}`}
        >
          <span className="material-symbols-outlined text-xl shrink-0 text-primary group-hover:text-primary">contact_support</span>
          {full && <span className="font-label text-label">Hỗ trợ</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`group mt-2 w-full flex items-center gap-3 border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface-variant transition-all duration-200 hover:border-primary hover:bg-surface-container-high hover:text-primary ${full ? '' : 'justify-center'}`}
        >
          <span className="material-symbols-outlined text-xl shrink-0 text-primary group-hover:text-primary">logout</span>
          {full && <span className="font-label text-label">Đăng xuất</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Desktop sidebar — fixed, respects collapsed state */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant flex-col z-50 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderSidebar(!collapsed)}
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer — always full width, slide from left */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col z-50 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebar(true)}
      </aside>

      <main className={`flex-1 flex flex-col transition-all duration-200 ml-0 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between h-14 px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile hamburger */}
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-lg text-on-surface-variant lg:!hidden"
            />
            {/* Desktop collapse toggle */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg text-on-surface-variant !hidden lg:!inline-flex"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
              >
                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                  <BellOutlined className="text-lg" />
                </Badge>
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-outline-variant overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                    <h3 className="font-bold text-sm text-text-primary">Thông báo đã gửi</h3>
                    <span className="text-xs text-text-secondary">{notifications.length} gần đây</span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-8 text-text-secondary">
                        <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">refresh</span>
                        <span className="text-xs">Đang tải...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center text-text-secondary">
                        <span className="material-symbols-outlined text-[32px]">notifications_off</span>
                        <p className="text-xs mt-2">Chưa có thông báo nào</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isRead = n.status === 'READ' || n.status === 'SENT' || n.status === 'FAILED';
                        return (
                          <button
                            key={n.id}
                            onClick={() => handleMarkRead(n.id)}
                            className={`w-full text-left px-4 py-3 border-b border-outline-variant last:border-b-0 hover:bg-surface-container transition-colors ${
                              isRead ? 'opacity-60' : ''
                            }`}
                          >
                            <p className={`text-xs truncate ${isRead ? 'font-medium text-text-secondary' : 'font-bold text-text-primary'}`}>
                              {n.subject}
                            </p>
                            <p className={`text-xs mt-0.5 line-clamp-2 ${isRead ? 'text-text-secondary/70' : 'text-text-secondary'}`}>
                              {n.content}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-text-secondary">{formatTimeAgo(n.created_at)}</span>
                              {n.status === 'READ' && (
                                <span className="text-[10px] text-success font-bold">Đã xem</span>
                              )}
                              {n.status === 'PENDING' && (
                                <span className="text-[10px] px-1.5 py-0.5 font-bold bg-warning/10 text-warning">Chờ gửi</span>
                              )}
                              {n.status === 'SENT' && (
                                <span className="text-[10px] px-1.5 py-0.5 font-bold bg-success/10 text-success">Đã gửi</span>
                              )}
                              {n.status === 'FAILED' && (
                                <span className="text-[10px] px-1.5 py-0.5 font-bold bg-error-container text-error">Lỗi</span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-outline-variant bg-surface-container-low">
                    <button
                      onClick={() => { setNotifOpen(false); navigate('/admin/applications'); }}
                      className="w-full text-center text-xs font-bold text-primary hover:text-primary-deep transition-colors"
                    >
                      Xem tất cả hồ sơ
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-lg">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
            <div className="h-7 w-px bg-outline-variant mx-1" />
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: 'Xem hồ sơ',
                    onClick: () => navigate('/admin/profile'),
                  },
                  { type: 'divider' },
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Đăng xuất',
                    danger: true,
                    onClick: handleLogout,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="text-right hidden lg:block">
                  <p className="font-label text-label text-text-primary leading-none">Admin</p>
                  <p className="font-metadata text-metadata text-text-secondary">Quản trị viên</p>
                </div>
                {user?.avatar_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-outline-variant">
                    <img
                      src={user.avatar_url}
                      alt={user.email}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 bg-surface">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </div>

        <Footer />
      </main>

      <Modal
        title={
          <div className="flex items-center gap-2 text-text-primary">
            <span className="material-symbols-outlined text-primary">contact_support</span>
            <span className="font-bold">Trung tâm hỗ trợ Admin</span>
          </div>
        }
        open={supportOpen}
        onCancel={() => setSupportOpen(false)}
        footer={null}
        width={760}
      >
        <div className="space-y-5 text-text-primary">
          <div className="border border-outline-variant bg-surface-container-low p-4">
            <p className="text-sm font-semibold text-text-secondary">
              Kênh hỗ trợ vận hành hệ thống tuyển sinh AdmisX dành cho quản trị viên.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <a
                href="tel:19001009"
                className="border border-outline-variant bg-surface-container-lowest p-3 transition-colors hover:border-primary hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">call</span>
                <p className="mt-1 text-xs font-bold uppercase text-text-secondary">Hotline</p>
                <p className="text-sm font-extrabold">1900 1009</p>
              </a>
              <a
                href="mailto:support@admisx.vn"
                className="border border-outline-variant bg-surface-container-lowest p-3 transition-colors hover:border-primary hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">mail</span>
                <p className="mt-1 text-xs font-bold uppercase text-text-secondary">Email</p>
                <p className="text-sm font-extrabold">support@admisx.vn</p>
              </a>
              <div className="border border-outline-variant bg-surface-container-lowest p-3">
                <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
                <p className="mt-1 text-xs font-bold uppercase text-text-secondary">Thời gian</p>
                <p className="text-sm font-extrabold">08:00 - 17:30</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <span className="material-symbols-outlined text-primary">checklist</span>
                Xử lý hồ sơ nhanh
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                <li>1. Vào Hồ sơ, lọc trạng thái Chờ duyệt.</li>
                <li>2. Tick một hoặc nhiều hồ sơ cần xử lý.</li>
                <li>3. Chọn Duyệt tất cả hoặc mở chi tiết để kiểm tra từng hồ sơ.</li>
                <li>4. Nhập lý do khi từ chối hoặc đánh dấu không đỗ.</li>
              </ul>
            </div>

            <div className="border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <span className="material-symbols-outlined text-primary">manage_search</span>
                Khi gặp sự cố
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                <li>Kiểm tra lại bộ lọc và từ khóa tìm kiếm nếu không thấy dữ liệu.</li>
                <li>Làm mới trang nếu trạng thái hồ sơ vừa được cập nhật.</li>
                <li>Gửi mã hồ sơ, email thí sinh và ảnh lỗi cho bộ phận hỗ trợ.</li>
                <li>Không tự sửa dữ liệu trực tiếp trong cơ sở dữ liệu khi chưa xác minh.</li>
              </ul>
            </div>
          </div>

          <div className="border border-primary/20 bg-primary-fixed p-4 text-on-primary-fixed-variant">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">tips_and_updates</span>
              <div>
                <p className="text-sm font-extrabold">Gợi ý vận hành</p>
                <p className="mt-1 text-sm">
                  Khi cần xử lý số lượng lớn, hãy dùng bộ lọc theo trường, ngành và trạng thái trước rồi mới tick chọn hàng loạt để tránh duyệt nhầm hồ sơ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLayout;
