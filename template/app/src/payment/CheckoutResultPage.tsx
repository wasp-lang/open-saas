import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { confirmCheckoutSession } from "wasp/client/operations";
import { Link, routes } from "wasp/client/router";
import { CheckoutResult } from "./checkoutResult";

const ACCOUNT_PAGE_REDIRECT_DELAY_MS = 4000;
const CONFIRMATION_POLL_INTERVAL_MS = 3000;
const CONFIRMATION_TIMEOUT_MS = 10 * 60 * 1000;

export function CheckoutResultPage() {
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const status = urlSearchParams.get("status");
  const sessionId = urlSearchParams.get("session_id");
  const paymentConfirmation = useCheckoutSessionConfirmation(
    status === CheckoutResult.Canceled ? null : sessionId,
  );

  const isAwaitingPayment = paymentConfirmation === "awaiting";

  useEffect(() => {
    if (isAwaitingPayment) {
      return;
    }

    const accountPageRedirectTimeoutId = setTimeout(() => {
      navigate(routes.AccountRoute.to);
    }, ACCOUNT_PAGE_REDIRECT_DELAY_MS);

    return () => {
      clearTimeout(accountPageRedirectTimeoutId);
    };
  }, [navigate, isAwaitingPayment]);

  const isKnownStatus =
    status === CheckoutResult.Success || status === CheckoutResult.Canceled;
  // A processor that confirms payments itself may return with a `session_id`
  // and no `status`.
  if (!isKnownStatus && (status !== null || sessionId === null)) {
    return <Link to={routes.AccountRoute.to} />;
  }

  return (
    <div className="mt-10 flex flex-col items-stretch sm:mx-6 sm:items-center">
      <div className="flex flex-col gap-4 px-4 py-8 text-center shadow-xl ring-1 ring-gray-900/10 sm:max-w-md sm:rounded-lg sm:px-10 dark:ring-gray-100/10">
        <h1 className="text-xl font-semibold">
          {isAwaitingPayment && "⏳ Waiting for your payment to arrive..."}
          {paymentConfirmation === "failed" && "😢 Payment Failed."}
          {paymentConfirmation === "timedOut" &&
            "⏳ Your payment hasn't arrived yet."}
          {paymentConfirmation === "done" &&
            status !== CheckoutResult.Canceled &&
            "🥳 Payment Successful!"}
          {status === CheckoutResult.Canceled && "😢 Payment Canceled."}
        </h1>
        {isAwaitingPayment && (
          <Link to={routes.AccountRoute.to} className="underline">
            Back to your account
          </Link>
        )}
        {!isAwaitingPayment && (
          <span className="">
            You will be redirected to your account page in{" "}
            {ACCOUNT_PAGE_REDIRECT_DELAY_MS / 1000} seconds...
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Some payment processors (e.g. bank transfers) settle after the buyer is
 * redirected back. If the redirect carries a `session_id`, ask the server to
 * confirm it until it is paid, failed, or we give up. Processors that rely on
 * webhooks only answer `unsupported` and the page behaves as before.
 *
 * "done" also covers processors without confirmation, and pages without a
 * `session_id`.
 */
type PaymentConfirmation = "awaiting" | "done" | "failed" | "timedOut";

function useCheckoutSessionConfirmation(
  sessionId: string | null,
): PaymentConfirmation {
  const [paymentConfirmation, setPaymentConfirmation] =
    useState<PaymentConfirmation>(sessionId === null ? "done" : "awaiting");

  useEffect(() => {
    if (sessionId === null) {
      return;
    }

    let isCancelled = false;
    const startedAt = Date.now();

    async function pollConfirmation() {
      let nextConfirmation: PaymentConfirmation;
      try {
        const result = await confirmCheckoutSession(sessionId!);
        if (result === "pending") {
          if (Date.now() - startedAt < CONFIRMATION_TIMEOUT_MS) {
            scheduleNextPoll();
            return;
          }
          nextConfirmation = "timedOut";
        } else {
          nextConfirmation = result === "failed" ? "failed" : "done";
        }
      } catch (error) {
        console.error("Error confirming checkout session: ", error);
        nextConfirmation = "timedOut";
      }
      if (!isCancelled) {
        setPaymentConfirmation(nextConfirmation);
      }
    }

    let pollTimeoutId: ReturnType<typeof setTimeout> | undefined;
    function scheduleNextPoll() {
      if (!isCancelled) {
        pollTimeoutId = setTimeout(
          pollConfirmation,
          CONFIRMATION_POLL_INTERVAL_MS,
        );
      }
    }

    pollConfirmation();

    return () => {
      isCancelled = true;
      clearTimeout(pollTimeoutId);
    };
  }, [sessionId]);

  return paymentConfirmation;
}
