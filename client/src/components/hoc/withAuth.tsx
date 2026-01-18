import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { requireAuth?: boolean; guestOnly?: boolean } = {
    requireAuth: true,
    guestOnly: false,
  },
) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const { requireAuth = true, guestOnly = false } = options;

    useEffect(() => {
      if (isLoading) return;

      if (requireAuth && !isAuthenticated) {
        navigate("/admin/login");
      }

      if (guestOnly && isAuthenticated) {
        navigate("/admin/dashboard");
      }
    }, [isLoading, isAuthenticated, navigate, requireAuth, guestOnly]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (requireAuth && !isAuthenticated) {
      return null;
    }

    if (guestOnly && isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};
