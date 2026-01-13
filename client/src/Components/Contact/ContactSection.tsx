import { Mail, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const ContactSection = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState<string>(() => {

    const requested_art = searchParams.get("requested_art");
    if (requested_art) {
      return `Hi Samridhi, I want the same painting or a customized version of "${requested_art}" Artwork. Thank you!`;
    }
    return "";
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Auto-dismiss success message after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function handleSendEmail(
    sender: string,
    name: string,
    message: string
  ) {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!sender.trim() || !message.trim() || !name.trim()) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    if (!sender.match(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${BACKEND_URL}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: sender, message }),
      });

      if (res.ok) {
        setSuccess("Email sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError("Failed to send email. Please try again.");
      }
      setLoading(false);
    } catch {
      setError("An error occurred. Please try again later.");
      setLoading(false);
    }
  }

  return (
    <section className="w-full flex-grow px-4 sm:px-6 md:px-12 lg:px-20 py-16 dark:bg-transparent bg-white transition-colors duration-300">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold font-playfair dark:text-white text-gray-900 tracking-tight">
          Get In Touch
        </h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto">
          Interested in commissioning a piece or have questions about available
          artworks?
        </p>
      </div>

      {/* Content Grid */}
      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        {/* Left: Contact Info */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-[#e0dcd1] dark:bg-[#2a3042] flex items-center justify-center">
              <Mail className="text-[#625a50] dark:text-[#c7c2b8] w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-black font-playfair dark:text-white">
                Email
              </h4>
              <p className="text-gray-700 dark:text-gray-300 font-['Roboto']">
                sfgsamridhi36325@gmail.com
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-[#e0dcd1] dark:bg-[#2a3042] flex items-center justify-center">
              <MapPin className="text-[#625a50] dark:text-[#c7c2b8] w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-black font-playfair dark:text-white">
                Studio
              </h4>
              <p className="text-gray-700 dark:text-gray-300 font-['Roboto']">India</p>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="flex-1">
          <div className="flex flex-col gap-5">
            {/* Name */}
            <div>
              <label className="block mb-1.5 text-black dark:text-white text-sm font-medium">
                Name
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-[#1c1e2e] border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#817565] dark:focus:ring-[#c7c2b8] text-black dark:text-white transition-all duration-300"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1.5 text-black dark:text-white text-sm font-medium">
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-[#1c1e2e] border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#817565] dark:focus:ring-[#c7c2b8] text-black dark:text-white transition-all duration-300"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block mb-1.5 text-black dark:text-white text-sm font-medium">
                Message
              </label>
              <textarea
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                rows={5}
                placeholder="Your message"
                className="w-full px-4 py-3 rounded-md bg-gray-100 dark:bg-[#1c1e2e] border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#817565] dark:focus:ring-[#c7c2b8] text-black dark:text-white transition-all duration-300 resize-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSendEmail(email, name, message);
              }}
              disabled={loading}
              className={`py-3 px-6 rounded-md font-medium text-white bg-[#625a50] dark:bg-[#817565] hover:bg-[#50483f] dark:hover:bg-[#6b5f4e] transition-all duration-300 transform hover:scale-105 ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Sending...
                </div>
              ) : (
                "Send Message"
              )}
            </button>
          </div>

          {/* Message container moved below the form */}
          <div className="mt-4 min-h-[40px] flex justify-center items-center">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-center gap-2 animate-fade-in">
                <svg
                  className="w-5 h-5 mb-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded-md flex items-center justify-center gap-2 animate-fade-out">
                <svg
                  className="w-5 h-5 mb-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {success}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-fade-out {
          animation: fadeOut 2s ease-in-out;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
};

export default ContactSection;
