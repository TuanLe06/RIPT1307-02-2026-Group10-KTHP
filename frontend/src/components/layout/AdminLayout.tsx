import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Badge } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/auth';
import { authApi } from '../../api/auth';
import { notificationApi, type AdminNotification } from '../../api/notifications';
import { useTheme } from '../../hooks/useTheme';
import { useSocket } from '../../hooks/useSocket';

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
    <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = activePath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
              isActive
                ? 'bg-secondary-container text-on-secondary-container font-extrabold underline decoration-2 underline-offset-4'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            } ${full ? '' : 'justify-center'}`}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              {item.icon}
            </span>
            {full && (
              <span className={`font-label truncate ${isActive ? 'text-[15px]' : 'text-label'}`}>{item.label}</span>
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
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8FMk_2YUwidtrwhRpI_5EggfXfw-tW7sKIBjhIt-mcuZ9qOrqQhL2OfwXenQwTGngfsQEVDlcn7O2Id2As_MWHFj9PGm8rtKvYKOIEWkxRspjvdHh9pyyYpGIw71DuAArN1TBmFC4lXjcD3ScWFYrv5w7LVzbL2QTnBFPjuVAv1KpSNO6s0ZET0NV9FDj9YNYQNesFcbb1jKOt6tnCx5b2T51n_A1ncaXy8xAReWb24bPvQMkGLAPN92PpDW1wEi-nD8GRSRJSnQ"
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

      <div className="border-t border-outline-variant pt-2 pb-3 px-2">
        <Link
          to="#"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 ${full ? '' : 'justify-center'}`}
        >
          <span className="material-symbols-outlined text-xl shrink-0">contact_support</span>
          {full && <span className="font-label text-label">Hỗ trợ</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 ${full ? '' : 'justify-center'}`}
        >
          <span className="material-symbols-outlined text-xl shrink-0">logout</span>
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

        <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-soft text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="material-symbols-outlined text-xl shrink-0">
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className={`font-label truncate ${isActive ? 'text-[15px]' : 'text-label'}`}>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-outline-variant pt-2 pb-3 px-2">
          <Link
            to="#"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-xl shrink-0">contact_support</span>
            {!collapsed && <span className="font-label text-label">Hỗ trợ</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-xl shrink-0">logout</span>
            {!collapsed && <span className="font-label text-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between h-14 px-4 lg:px-6 sticky top-0 z-40">
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
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-outline-variant overflow-hidden z-50">
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
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-warning/10 text-warning">Chờ gửi</span>
                              )}
                              {n.status === 'SENT' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-success/10 text-success">Đã gửi</span>
                              )}
                              {n.status === 'FAILED' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-error-container text-error">Lỗi</span>
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
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-lg">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
              <QuestionCircleOutlined className="text-lg" />
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
                  <img
                    src={user.avatar_url}
                    alt={user.email}
                    className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                  />
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

        <footer className="bg-surface-container-low border-t border-outline-variant px-4 lg:px-6 py-3 font-metadata text-metadata text-text-secondary">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <span>&copy; 2024 AdmisX Admin Dashboard. All rights reserved.</span>
            <div className="flex gap-4">
              <a className="hover:text-primary transition-colors" href="#">Chính sách</a>
              <a className="hover:text-primary transition-colors" href="#">Điều khoản</a>
              <a className="hover:text-primary transition-colors" href="#">Trợ giúp</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
