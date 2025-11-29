import { useState, useEffect, useCallback } from "react";
import { X, Loader2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { addToCart, fetchCart, removeFromCart } from "../../services/handleCart";

// Update the type to include our new property from fetchCart
type CartItemType = Awaited<ReturnType<typeof fetchCart>>[0] & { total_stock: number };

// --- Sub-Components for a Cleaner Structure ---

// 1. Loading Spinner Component
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center flex-grow py-24">
        <Loader2 className="h-12 w-12 animate-spin text-[#817565]" />
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Loading Your Cart...</p>
    </div>
);

// 2. Empty Cart Component
const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center flex-grow py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-[#817565]" />
        <h2 className="mt-6 text-2xl font-semibold dark:text-white">Your cart is empty</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Looks like you haven't added anything yet.</p>
        <Link
            to="/gallery"
            className="mt-6 inline-block px-6 py-3 rounded-lg font-medium dark:bg-[#817565] dark:hover:bg-[#625a50] bg-[#817565] hover:bg-[#686055] text-white transition-colors duration-200 cursor-pointer"
        >
            Continue Exploring
        </Link>
    </div>
);

// 3. Cart Item Component
const CartItem = ({
    item,
    onUpdateQuantity,
    onRemove,
    isDisabled,
}: {
    item: CartItemType;
    onUpdateQuantity: (id: string, amount: number) => void;
    onRemove: (id: string) => void;
    isDisabled: boolean;
}) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flex gap-4 border-b dark:border-gray-700 border-gray-200 pb-4"
    >
        <a href={`/art/${item._id}`}>
        <img
            src={item.mainImage}
            alt={item.title}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md flex-shrink-0"
        />
        </a>
        <div className="flex flex-col flex-grow min-w-0">
            <div className="flex justify-between items-start">
                <div className="pr-2">
                    <Link to={`/art/${item._id}`} className="hover:underline">
                        <h3 className="font-semibold text-lg dark:text-white leading-tight">{item.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.medium} • {item.dimensions}
                    </p>
                </div>
                <button
                    onClick={(e) => { e.preventDefault(); onRemove(item._id); }}
                    className="cursor-pointer p-1.5 rounded-full h-fit hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label="Remove item"
                    disabled={isDisabled}
                >
                    <X size={18} />
                </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-auto pt-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={(e) => { e.preventDefault(); onUpdateQuantity(item._id, -1); }}
                        className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full border text-xl font-medium text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={item.quantity <= 1 || isDisabled}
                    >
                        -
                    </button>
                    <span className="w-6 text-center font-medium text-lg dark:text-white">{item.quantity}</span>
                    <button
                        onClick={(e) => { e.preventDefault(); onUpdateQuantity(item._id, 1); }}
                        className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full border text-xl font-medium text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={item.quantity >= item.total_stock || isDisabled}
                    >
                        +
                    </button>
                </div>
                <p className="font-semibold text-lg dark:text-white">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
            </div>
        </div>
    </motion.div>
);

// 4. Order Summary Component
const OrderSummary = ({ subtotal,url }: { subtotal: number, url: string }) => (
    <div className="lg:sticky lg:top-28">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Order Summary</h2>
            <div className="space-y-3">
                <div className="flex justify-between dark:text-white ">
                    <span>Subtotal</span>
                    <span className="font-medium dark:text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>Calculated at next step</span>
                </div>
            </div>
            <div className="border-t dark:border-gray-700 my-4"></div>
            <div className="flex justify-between font-bold text-lg mb-4 dark:text-white">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <button onClick={() => { window.location.href = url; }} className="cursor-pointer w-full py-3 rounded-lg font-semibold text-white bg-[#817565] hover:bg-[#625a50] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#817565] dark:focus:ring-offset-gray-900">
                Proceed to Checkout
            </button>
        </div>
    </div>
);

// --- Main Cart Component ---

const MainCart = () => {
    const [cartItems, setCartItems] = useState<CartItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const refreshCart = useCallback(async () => {
        try {
            const artworks = await fetchCart();
            setCartItems(artworks as CartItemType[]);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const handleUpdateQuantity = async (_id: string, amount: number) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            if (amount > 0) {
                await addToCart(_id, amount);
            } else {
                await removeFromCart(_id, Math.abs(amount));
            }
            await refreshCart();
        } catch (error) {
            console.error("Failed to update quantity:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveItem = async (_id: string) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const item = cartItems.find(i => i._id === _id);
            if (item) {
                await removeFromCart(_id, item.quantity);
            }
            await refreshCart();
        } catch (error) {
            console.error("Failed to remove item:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const subtotal = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity, 0
    );

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!cartItems.length) {
        return <EmptyCart />;
    }

    return (
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-8 font-playfair dark:text-white">Cart</h1>

            <div className="lg:grid lg:grid-cols-3 lg:gap-12 items-start">
                <div className="lg:col-span-2">
                    <div className="space-y-6">
                        <AnimatePresence>
                            {cartItems.map((item) => (
                                <CartItem
                                    key={item._id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemove={handleRemoveItem}
                                    isDisabled={isUpdating}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="lg:col-span-1 mt-8 lg:mt-0">
                    <OrderSummary subtotal={subtotal} url={`/checkout/${cartItems.map(item => item._id +"="+ item.quantity).join('+')}`} />
                </div>
            </div>
        </main>
    );
};

export default MainCart;