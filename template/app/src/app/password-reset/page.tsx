import { ResetPasswordForm } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { AuthPageLayout } from "../../auth/AuthPageLayout";

export default function PasswordResetPage() {
  return (
    <AuthPageLayout>
      <ResetPasswordForm />
      <br />
      <span className="text-sm font-medium text-gray-900">
        If everything is okay,{" "}
        <WaspRouterLink to={routes.LoginRoute.to}>go to login</WaspRouterLink>
      </span>
    </AuthPageLayout>
  );
}
