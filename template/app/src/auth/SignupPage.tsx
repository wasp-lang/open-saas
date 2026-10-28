import { SignupForm } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { AuthPageLayout } from "./AuthPageLayout";
import { RedirectIfLoggedIn } from "./RedirectIfLoggedIn";

export function SignupPage() {
  return (
    <RedirectIfLoggedIn>
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
    </RedirectIfLoggedIn>
  );
}
