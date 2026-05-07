import AdminDashboardClient from "../components/AdminDashboardClient";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardClient />
    </ProtectedRoute>
  );
}
