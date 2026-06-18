import { SignupForm } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { AuthPageLayout } from "../../auth/AuthPageLayout";
import { useRedirectIfLoggedIn } from "../../auth/hooks/useRedirectIfLoggedIn";

export default function SignupPage() {
  useRedirectIfLoggedIn();

  return (
    <AuthPageLayout>
      <SignupForm />
      <br />
      <span className="text-sm font-medium text-gray-900">
        I already have an account (
        <WaspRouterLink to={routes.LoginRoute.to} className="underline">
          go to login
        </WaspRouterLink>
        ).
      </span>
      <br />
    </AuthPageLayout>
  );
}
