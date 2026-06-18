import { ForgotPasswordForm } from "wasp/client/auth";
import { AuthPageLayout } from "../../auth/AuthPageLayout";

export default function RequestPasswordResetPage() {
  return (
    <AuthPageLayout>
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}
