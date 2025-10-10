import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

const ACCOUNT_PAGE_REDIRECT_DELAY_MS = 4000;

export default function CheckoutResultPage() {
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const status = urlSearchParams.get("status");

  useEffect(() => {
    const accountPageRedirectTimeoutId = setTimeout(() => {
      navigate("/account");
    }, ACCOUNT_PAGE_REDIRECT_DELAY_MS);

    return () => {
      clearTimeout(accountPageRedirectTimeoutId);
    };
  }, []);

  if (status !== "success" && status !== "canceled") {
    return <Navigate to="/account" />;
  }

  return (
    <div className="mt-10 flex flex-col items-stretch sm:mx-6 sm:items-center">
      <div className="flex flex-col gap-4 px-4 py-8 text-center shadow-xl ring-1 ring-gray-900/10 sm:max-w-md sm:rounded-lg sm:px-10 dark:ring-gray-100/10">
        <h1 className="text-xl font-semibold">
          {status === "success" && "🥳 Payment Successful!"}
          {status === "canceled" && "😢 Payment Canceled."}
        </h1>
        <span className="">
          You will be redirected to your account page in{" "}
          {ACCOUNT_PAGE_REDIRECT_DELAY_MS / 1000} seconds...
        </span>
      </div>
    </div>
  );
}
