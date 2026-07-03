import { Navigate } from "react-router";
import useAuth from "../hooks/useAuth";
import useRole from "../hooks/useRole";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { role, roleLoading } = useRole();

  if (loading || roleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <h2 className="card-title text-error justify-center">
              Access Denied
            </h2>
            <p>You don't have permission to access this page.</p>
            <div className="card-actions justify-center mt-4">
              <a href="/" className="btn btn-primary">
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;