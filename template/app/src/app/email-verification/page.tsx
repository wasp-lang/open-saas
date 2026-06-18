import { VerifyEmailForm } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { AuthPageLayout } from "../../auth/AuthPageLayout";

export default function EmailVerificationPage() {
  return (
    <AuthPageLayout>
      <VerifyEmailForm />
      <br />
      <span className="text-sm font-medium text-gray-900">
        If everything is okay,{" "}
        <WaspRouterLink to={routes.LoginRoute.to} className="underline">
          go to login
        </WaspRouterLink>
      </span>
    </AuthPageLayout>
  );
}
