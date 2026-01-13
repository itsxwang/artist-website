import { useEffect,  useState } from "react";
import { fetchAllArtoworks } from "../../services/handleArtworks";
import { type Artwork } from "../../services/handleArtworks";
import truncateDescription from "../../utilities/truncateDescription";
import { Link } from "react-router-dom";

function FeatureSection() {
  // ✅ Fetch all artworks (will come from API later)
  const [artworks, setArtworks] = useState<Awaited<ReturnType<typeof fetchAllArtoworks>>>();
  const [featuredItems, setFeaturedItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllArtoworks().then((artoworks) => {
      setArtworks(artoworks);
      setLoading(false);
    });
  }, []);

  // ✅ Filter featured artworks only
  useEffect(() => {
    if (!Array.isArray(artworks)) return;
    setFeaturedItems(artworks.filter((item) => item.featured === true));
  }, [artworks]);

  // Skeleton loader component
  const FeatureSkeleton = () => (
    <div className="animate-pulse bg-white dark:bg-gray-800 p-0 rounded-lg shadow-md transition-all duration-300 ease hover:scale-105">
      <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 mb-4 rounded-t-lg"></div>
      <div className="p-4 text-left">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto mb-2"></div>
      </div>
      <div className="p-4 pt-0">
        <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
      </div>
    </div>
  );


  return (
    <section className="pb-20 pt-20 w-full py-12 cursor-pointer bg-gray-100 text-gray-800 dark:bg-[#202738] dark:text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-[playflair] text-5xl font-bold mb-4">Featured Artworks</h2>
        <p className="font-[Intra] text-2xl mb-8">
          Discover the latest collection of contemporary paintings, each piece telling its own unique story
        </p>

        {/* ✅ Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-15">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <FeatureSkeleton key={i} />
              ))
            : featuredItems.map((item) => (
            <Link
              to={`/art/${item._id}`}
              key={item._id}
              className="cursor-pointer bg-white dark:bg-gray-800 p-0 rounded-lg shadow-md transition duration-300 ease hover:scale-105"
            >
              {/* ✅ Image placeholder */}
              <div
                className="w-full h-64 bg-gray-300 dark:bg-gray-700 mb-4 rounded-t-lg"
                style={{
                  backgroundImage: `url(${item.mainImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              {/* ✅ Artwork details */}
              <div className="p-4 text-left">
                <h3 className="text-xl font-semibold mb-2 text-center font-playfair">{item.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm text-center">
                  {item.medium} • {item.dimensions}
                </p>

                {/* ✅ Truncated description */}
                <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm leading-snug text-center font-[Intra]">
                  {truncateDescription(item.description)}
                </p>

                {/* ✅ Price */}
                <p className="text-gray-900 dark:text-gray-100 font-bold mt-3 text-center">₹{item.price ? (item.price).toLocaleString("en-IN") : "N/A"}</p>
              </div>

              {/* ✅ Button Section */}
              <div className="p-4 pt-0">
                {item.availability === "Reserved" ? (
                  <button
                    className="w-full bg-yellow-500 text-white font-semibold py-2 rounded opacity-70 cursor-not-allowed"
                    disabled
                  >
                    Reserved
                  </button>
                ) : item.stock_quantity === 0 ? (
                  <button
                    className="w-full bg-gray-500 text-white font-semibold py-2 rounded opacity-70 cursor-not-allowed"
                    disabled
                  >
                    Sold
                  </button>
                ) : (
                  <button
                    onClick={ (e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/cart/${item._id}?quantity=1` } }
                    className="cursor-pointer transition duration-200 w-full bg-[#817565] font-semibold py-2 rounded text-white dark:text-white hover:bg-[#686055] dark:hover:bg-[#625a50]">
                    Add To Cart
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* ✅ View All Button */}

        <Link
          to="/gallery"
          className="cursor-pointer mt-15 px-9 py-[0.67rem]  font-[Inter] font-semibold text-[1.2rem] transition duration-200 rounded bg-[#E0DCD1] text-gray-800 hover:bg-[#cec7b5] dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        >
          View All Artworks <span className="ml-2 text-2xl">→</span>
        </Link>
      </div>
    </section>
  );
}

export default FeatureSection;
