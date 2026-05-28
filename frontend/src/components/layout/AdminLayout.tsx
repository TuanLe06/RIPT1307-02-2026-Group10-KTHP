import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Dropdown } from 'antd';
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
import { useTheme } from '../../hooks/useTheme';

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
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle: toggleTheme } = useTheme();

  const activePath = '/' + location.pathname.split('/').slice(1, 3).join('/');

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <aside
        className={`fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant flex flex-col z-50 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-outline-variant ${collapsed ? 'justify-center' : 'px-5'}`}>
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
          {!collapsed && (
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

        <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-extrabold underline decoration-2 underline-offset-4'
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-xl shrink-0">contact_support</span>
            {!collapsed && <span className="font-label text-label">Hỗ trợ</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-xl shrink-0">logout</span>
            {!collapsed && <span className="font-label text-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center justify-between h-14 px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3 flex-1">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg text-on-surface-variant"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
              <BellOutlined className="text-lg" />
            </button>
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
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                  A
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 bg-surface">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </div>

        <footer className="bg-surface-container-low border-t border-outline-variant flex items-center justify-between px-4 lg:px-6 py-2 font-metadata text-metadata text-text-secondary">
          <span>&copy; 2024 AdmisX Admin Dashboard. All rights reserved.</span>
          <div className="flex gap-4">
            <a className="hover:text-primary transition-colors" href="#">Chính sách</a>
            <a className="hover:text-primary transition-colors" href="#">Điều khoản</a>
            <a className="hover:text-primary transition-colors" href="#">Trợ giúp</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
