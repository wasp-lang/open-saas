import { Checkout } from "@moneydevkit/replit";
import "@moneydevkit/replit/mdk-styles.css";
import { useParams } from "react-router";

export default function MdkCheckoutPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">Missing checkout ID</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Checkout id={id} />
    </div>
  );
}
