export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
      </header>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <h2 className="text-lg font-semibold mb-6">Admin Panel</h2>

        <nav className="space-y-3">
          <a
            href="/admin/users"
            className="block text-gray-700 hover:text-blue-600"
          >
            Users
          </a>
          <a href="#" className="block text-gray-700 hover:text-blue-600">
            Analytics
          </a>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
