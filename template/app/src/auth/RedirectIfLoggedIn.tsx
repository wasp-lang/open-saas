import { Loader2 } from "lucide-react";
import { type ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "wasp/client/auth";
import { routes } from "wasp/client/router";

export function RedirectIfLoggedIn({
  children,
  to = routes.DemoAppRoute.to,
}: {
  children: ReactNode;
  to?: string;
}) {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
}
