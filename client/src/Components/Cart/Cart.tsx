import Navbar from "../global/NavBar";
import Footer from "../global/Footer";
import MainCart from "./MainCart";
import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { addToCartFromOtherPage } from "../../services/handleCart";
import { Loader2 } from "lucide-react";
import useTitle from "../../hooks/useTitle";

function Cart() {
  useTitle("Cart");

  const { artId: productId } = useParams();
  const navigate = useNavigate();
  const isDone = useRef(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const doAdd = async () => {
    if (isDone.current) return;
    isDone.current = true;
    if (!productId) return;
    const searchParams = new URLSearchParams(window.location.search);
    const quantity = Number(searchParams.get("quantity") || "1");
    try {
      setLoadingAdd(true);

      await addToCartFromOtherPage(productId, quantity);
    } catch (e) {
      console.error(e);
    }
    navigate("/cart");
    setLoadingAdd(false);
  };

  return (
    <div className="flex flex-col min-h-screen dark:bg-gradient-to-b dark:from-gray-900 dark:to-black bg-white">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* give flex-grow to MainCart  */}
      {loadingAdd ? (
        <div className="flex flex-col items-center justify-center flex-grow py-24">
          <Loader2 className="h-12 w-12 animate-spin text-[#817565]" />
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Adding to cart...
          </p>
        </div>
      ) : (
        <MainCart doAdd={doAdd} />
      )}

      <div>
        <Footer />
      </div>
    </div>
  );
}

export default Cart;
