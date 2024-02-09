// TODO: Removed  from "@wasp/types" import because it is deprecated and has no clear alternative. Please check migration instructions in Wasp docs on how to manually migrate the code that was using it.
import { type GetVerificationEmailContentFn, type GetPasswordResetEmailContentFn } from "wasp/server/auth";

export const getVerificationEmailContent: GetVerificationEmailContentFn = ({ verificationLink }) => ({
  subject: 'Verify your email',
  text: `Click the link below to verify your email: ${verificationLink}`,
  html: `
        <p>Click the link below to verify your email</p>
        <a href="${verificationLink}">Verify email</a>
    `,
});

export const getPasswordResetEmailContent: GetPasswordResetEmailContentFn = ({ passwordResetLink }) => ({
  subject: 'Password reset',
  text: `Click the link below to reset your password: ${passwordResetLink}`,
  html: `
        <p>Click the link below to reset your password</p>
        <a href="${passwordResetLink}">Reset password</a>
    `,
});