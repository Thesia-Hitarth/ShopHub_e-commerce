import CheckoutClient from "../components/CheckoutClient";
import ProtectedRoute from "../components/ProtectedRoute";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutClient />
    </ProtectedRoute>
  );
}
