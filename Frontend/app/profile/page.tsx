import ProfileClient from "../components/ProfileClient";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileClient />
    </ProtectedRoute>
  );
}
