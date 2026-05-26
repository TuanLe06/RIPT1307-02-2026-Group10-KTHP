import { useAuthStore } from '../store/auth';

const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">AdmisX - Quản trị</h1>
          <span className="text-gray-600">Xin chào, {user?.email}</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Trang quản trị</h2>
          <p className="text-gray-600">Trang quản trị đang được phát triển. Vui lòng quay lại sau.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
