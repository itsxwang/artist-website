import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchArt } from "../../services/handleArtworks";
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  Heart,
  IndianRupee,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import "./styles/MainDetails.css";
import {
  addToFavourites,
  isFavourite,
  removeFromFavourites,
} from "../../services/handleFavourites";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FaXTwitter } from "react-icons/fa6";
import useTitle from "../../hooks/useTitle";

// --- Types ---
type Artwork = Awaited<ReturnType<typeof fetchArt>>;

interface ButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  id?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

// --- Helper Components ---
const Button = ({
  children,
  onClick,
  disabled = false,
  className = "",
  id,
}: ButtonProps) => (
  <button
    id={id}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${className}`}
  >
    {children}
  </button>
);

const Badge = ({ children, className = "" }: BadgeProps) => (
  <span
    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${className}`}
  >
    {children}
  </span>
);

// --- SKELETON COMPONENT ---
const MainDetailsSkeleton = () => {
  return (
    <section className="py-12 md:py-20 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button Placeholder */}
        <div className="mb-8">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-sm flex items-center px-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Image Skeleton */}
          <div className="relative flex flex-col items-center space-y-4">
            {/* Aspect Ratio 3:4 matches the 3000x4000px requirement.
                This ensures layout doesn't shift when the real image loads.
            */}
            <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-lg shadow-sm"></div>

            {/* Dot Indicators */}
            <div className="flex space-x-2 mt-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Details Skeleton */}
          <div className="space-y-6">
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
              </div>

              {/* Title */}
              <div className="h-10 md:h-14 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>

              {/* Medium • Dimensions */}
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>

            {/* Description Paragraphs */}
            <div className="space-y-3 pt-2">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
              {/* Price and Action Buttons Row */}
              <div className="flex flex-row items-center justify-between">
                <div>
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>

                <div className="flex space-x-2">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="h-14 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>

            {/* Product Details Box */}
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- MAIN COMPONENT ---
function MainDetails({ id }: { id: string }) {
  const [artWork, setArtWork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [showSharePopup, setShowSharePopup] = useState(false);

  // State and refs for Amazon-style zoom
  const [zoomActive, setZoomActive] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isFavorited, setIsFavorited] = useState(() => isFavourite(id));

  // State for swipe functionality
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // State for copied notification
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    setIsLoading(true); // Start loading
    fetchArt(id)
      .then((artWork) => setArtWork(artWork!))
      .catch((error) => console.error("Failed to fetch artwork:", error))
      .finally(() => setIsLoading(false)); // Stop loading regardless of success/failure
  }, [id]);

  useTitle(artWork ? artWork.title : "Artwork Details");
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Calculations for the zoom pane
  const zoomLevel = 2;
  const backgroundPositionX = -lensPosition.x * zoomLevel;
  const backgroundPositionY = -lensPosition.y * zoomLevel;

  // Event handlers for the zoom feature
  const handleMouseEnter = () => {
    if (window.innerWidth > 768) {
      // Only activate zoom on larger screens
      setZoomActive(true);
    }
  };

  const handleMouseLeave = () => {
    setZoomActive(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !zoomActive) return;

    const imageRect = imageContainerRef.current.getBoundingClientRect();
    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;

    // Lens size (1/zoomLevel of the image)
    const lensWidth = imageWidth / zoomLevel;
    const lensHeight = imageHeight / zoomLevel;

    // Calculate mouse position relative to the image container
    const mouseX = e.clientX - imageRect.left;
    const mouseY = e.clientY - imageRect.top;

    // Center the lens on the mouse
    let x = mouseX - lensWidth / 2;
    let y = mouseY - lensHeight / 2;

    // Clamp the lens position so it doesn't go off the image
    x = Math.max(0, Math.min(x, imageWidth - lensWidth));
    y = Math.max(0, Math.min(y, imageHeight - lensHeight));

    setLensPosition({ x, y });
  };

  function handleDecreaseQuantity() {
    setCartQuantity((prev) => Math.max(1, prev - 1));
  }

  function handleIncreaseQuantity() {
    if (!artWork) return;
    setCartQuantity((prev) => Math.min(artWork.stock_quantity, prev + 1));
  }

  // Swipe event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 50;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) handleNextImage();
      else handlePrevImage();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const allImages = useMemo(() => {
    if (!artWork) return [];
    return [artWork.mainImage, ...artWork.images];
  }, [artWork]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  }, [allImages.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length
    );
  }, [allImages.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") handleNextImage();
      else if (event.key === "ArrowLeft") handlePrevImage();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleNextImage, handlePrevImage]);

  useEffect(() => {
    if (showSharePopup) {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") setShowSharePopup(false);
      };
      document.addEventListener("keydown", handleEsc);
      //  remove focus from share button also
      document.getElementById("shared-button")?.blur();
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [showSharePopup]);

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const handleShareOption = (platform: string) => {
    if (!artWork) return;
    const shareUrl = window.location.href;
    const shareText = `Check out this beautiful artwork: ${artWork.title}`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(
            shareText + " " + shareUrl
          )}`,
          "_blank"
        );
        break;
      case "x":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
        break;
    }
    setShowSharePopup(false);
  };

  const handleClosePopup = () => {
    setShowSharePopup(false);
  };

  // Render Loading Skeleton
  if (isLoading) {
    return <MainDetailsSkeleton />;
  }

  // Render Not Found (Only if not loading and artwork is missing)
  if (!artWork) {
    return (
      <div className="flex-grow flex items-center justify-center text-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Artwork Not Found
          </h1>
          <Button className="bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300">
            <Link to="/gallery" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isSold = artWork.availability === "Sold";
  const isRequest = artWork.availability === "Request";
  const isAvailable = !isSold && !isRequest && artWork.stock_quantity > 0;
  if (isRequest) {
    localStorage.setItem(
      "contactMessage",
      `Hi Samridhi, I want the same painting or a customized version of "${artWork.title}" Artwork. Thank you!`
    );
  }

  const showQuantitySelector = artWork.stock_quantity > 1;

  const ctaButton = isAvailable ? (
    <Link to={`/cart/${id}?quantity=${cartQuantity}`} className="block w-full">
      <Button className="font-[inter] bg-[#625a50] hover:bg-[#45403b] transition-colors duration-200 w-full py-3 text-lg font-medium text-white dark:text-white dark:bg-[#817565] dark:hover:bg-[#625a50]">
        Add To Cart
      </Button>
    </Link>
  ) : isRequest ? (
    <div className="flex justify-between gap-2">
      {" "}
      <p className="w-full py-3 rounded-lg text-center text-lg font-semibold bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed">
        Sold
      </p>{" "}
      <Link
        to={`/contact`}
        className="w-full py-3  rounded-lg text-center text-lg font-semibold bg-[#625a50] hover:bg-[#45403b] transition-colors duration-200 dark:text-white dark:bg-[#817565] text-white cursor-pointer dark:hover:bg-[#625a50]"
      >
        Request
      </Link>{" "}
    </div>
  ) : (
    <Button
      disabled
      className="w-full py-3 text-lg font-semibold bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
    >
      Sold
    </Button>
  );

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/gallery"
            className="hover:bg-gray-200 px-4 py-2 rounded-sm dark:hover:bg-gray-800 inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative flex flex-col items-center">
            <div
              ref={imageContainerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative group rounded-lg shadow-lg overflow-hidden w-full cursor-crosshair"
            >
              <img
                key={allImages[currentImageIndex]}
                src={`/${allImages[currentImageIndex]}`}
                alt={`${artWork.title} - view ${currentImageIndex + 1}`}
                className="w-full h-auto"
              />
              <div
                style={{
                  display: zoomActive ? "block" : "none",
                  left: `${lensPosition.x}px`,
                  top: `${lensPosition.y}px`,
                }}
                className="absolute w-1/2 h-1/2 border-2 border-white bg-white/30 pointer-events-none"
              />
              {allImages.length > 1 && (
                <>
                  <Button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 md:opacity-100 md:hover:opacity-80"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 md:opacity-100 md:hover:opacity-80"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
            <div
              style={{
                display: zoomActive ? "block" : "none",
                backgroundImage: `url(/${allImages[currentImageIndex]})`,
                backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`,
                backgroundSize: `${zoomLevel * 100}% auto`,
              }}
              className="absolute top-[102%] left-0 lg:top-0 lg:left-[102%] w-full h-full border-2 rounded-lg shadow-xl hidden lg:block bg-no-repeat z-10 pointer-events-none"
            ></div>
            {allImages.length > 1 && (
              <div className="flex space-x-2 p-2 mt-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                      currentImageIndex === index
                        ? "bg-gray-900 dark:bg-white scale-125"
                        : "bg-gray-400 dark:bg-gray-500 hover:bg-gray-600 dark:hover:bg-gray-300"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {artWork.types.map((type) => (
                  <Badge
                    key={type}
                    className="dark:text-white bg-[#e0dcd1] dark:bg-gray-700/50 text-black px-2.5 py-1 rounded-full"
                  >
                    {type}
                  </Badge>
                ))}
              </div>
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-3">
                {artWork.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {artWork.medium} • {artWork.dimensions}
              </p>
            </div>
            {artWork.description && (
              <div>
                <h3 className="font-[inter] font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                  About This Piece
                </h3>
                <p className="font-[inter] font-extralight text-gray-700 dark:text-gray-300 leading-relaxed">
                  {artWork.description}
                </p>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
              <div
                className={
                  showQuantitySelector
                    ? "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative"
                    : "flex flex-row items-center justify-between relative"
                }
              >
                <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Price
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                      <IndianRupee className="inline h-7 w-7" />
                      {artWork.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  {showQuantitySelector && (
                    <div className="flex items-center gap-x-2">
                      <p className="text-2xl text-gray-500 dark:text-gray-400">
                        ×
                      </p>
                      <div className="flex flex-col items-center">
                        <button
                          onClick={handleIncreaseQuantity}
                          disabled={cartQuantity >= artWork.stock_quantity}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          <ChevronUp className="inline h-5 w-5" />
                        </button>
                        <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                          {cartQuantity}
                        </span>
                        <button
                          onClick={handleDecreaseQuantity}
                          disabled={cartQuantity <= 1}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          <ChevronDown className="inline h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative flex space-x-2 self-start sm:self-center">
                  <div className="relative flex flex-row gap-2">
                    <a
                      href={artWork.instaVideoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-md transition-colors cursor-pointer flex items-center"
                      aria-label="View on Instagram"
                    >
                      <FaInstagram className="h-5 w-5 text-pink-500" />
                    </a>
                    <Button
                      id="shared-button"
                      onClick={handleShare}
                      className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Share2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </Button>
                    <AnimatePresence>
                      {showSharePopup && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClosePopup}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                          />

                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto"
                          >
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-auto">
                              <div className="flex justify-between items-center mb-5">
                                <h4 className="font-semibold font-[inter] text-lg text-gray-900 dark:text-gray-100">
                                  Share Artwork
                                </h4>
                                <button
                                  onClick={handleClosePopup}
                                  className="flex items-center justify-center w-11 h-11 rounded-full 
             text-gray-500 hover:text-gray-800 hover:bg-gray-100 
             dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 
             transition-all duration-200 
             active:scale-95 cursor-pointer"
                                  aria-label="Close"
                                >
                                  <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={4}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <Button
                                  onClick={() => handleShareOption("whatsapp")}
                                  className="flex flex-col items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20ba56] py-5 rounded-xl font-medium transition-transform hover:scale-105"
                                >
                                  <FaWhatsapp className="h-8 w-8" />
                                  <span className="text-sm">WhatsApp</span>
                                </Button>

                                <Button
                                  onClick={() => handleShareOption("x")}
                                  className="flex flex-col items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 py-5 rounded-xl font-medium transition-transform hover:scale-105"
                                >
                                  <FaXTwitter className="h-8 w-8" />
                                  <span className="text-sm">Twitter</span>
                                </Button>

                                <Button
                                  onClick={() => handleShareOption("copy")}
                                  className="col-span-2 flex items-center justify-center gap-3 bg-gray-700 text-white hover:bg-gray-600 py-5 rounded-xl font-medium transition-transform hover:scale-105"
                                >
                                  <LinkIcon className="h-5 w-5" />
                                  <span>Copy Link</span>
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  <Button
                    className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      if (isFavorited) {
                        removeFromFavourites(id);
                      } else {
                        addToFavourites(id);
                      }
                      setIsFavorited(!isFavorited);
                    }}
                  >
                    <Heart
                      className={`h-5 w-5 transition-all duration-200 ${
                        isFavorited
                          ? "text-red-500 fill-red-500 scale-110 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                          : "text-gray-700 dark:text-gray-300 fill-transparent"
                      }`}
                    />
                  </Button>
                </div>
                {showCopied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                    className="absolute top-full mt-2 right-0 bg-[#e0dcd1] dark:bg-gray-700/50 text-black dark:text-gray-100 px-4 py-2 rounded-lg shadow-lg font-[inter] font-medium text-sm z-50"
                  >
                    Link copied successfully!
                  </motion.div>
                )}
              </div>
              {ctaButton}
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Artwork Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Medium:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {artWork.medium}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Dimensions:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {artWork.dimensions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Framed:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {artWork.framed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {artWork.created_at}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Availability:
                  </span>
                  <span
                    className={`font-bold ${
                      isAvailable
                        ? "text-green-600 dark:text-green-400"
                        : isRequest
                        ? "text-orange-500 dark:text-orange-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {artWork.availability}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainDetails;
