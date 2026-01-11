import React from "react";
import { motion } from "framer-motion";
// import { useCountUp } from "../../hooks/useCountUp"; // ✅ import utility hook

const MainAbout: React.FC = () => {
  // const artworksCount = useCountUp(150, 2000); // counts to 150 in 2s
  // const exhibitionsCount = useCountUp(25, 2000); // counts to 25 in 2s

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 px-4 sm:px-6 md:px-12 lg:px-20 py-10 md:py-20 dark:text-white text-black dark:bg-transparent bg-white transition-colors duration-200">
      {/* Left - Image */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="md:h-[500px] flex justify-center mb-2.5 md:mb-8 self-center"
      >
        <img
          src="aboutimg.jpg"
          alt="Channel Profile"
          className="w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px] object-cover rounded-full shadow-lg flex-shrink-0"
        />
      </motion.div>

      {/* Right - Content */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start max-w-[650px]"
      >
        <h2 className="font-bold mb-6 font-[playfair] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl self-center text-center">
          About Samridhi
        </h2>

        <p className=" mb-4 px-2 text-[1.25rem] sm:px-0 font-[inter]">
          Hi, I'm <span className="font-semibold">Samridhi</span> — a
          23-year-old self-taught artist. Even though I studied B.Com, life
          gently led me back to the thing that has been with me since childhood:
          ART I’ve been painting professionally for two years now, discovering
          more of my instinct and expression with every canvas.
        </p>

        <p className="leading-relaxed text-[1.25rem] mb-4 px-2 sm:px-0">
          For me, art is storytelling. I try to transform moments, emotions, and
          little pieces of life into colours on a canvas. Every artwork I create
          comes from a feeling — a memory, a place, or a story that I reimagine
          in my own world of soft, poetic visuals.
        </p>

        <p className="italic leading-relaxed text-[1.25rem] mb-6 px-2 sm:px-0 text-center">
          "Through my paintings, I blend imagination with reality, turning
          ordinary moments into something magical. Welcome to my studio — where
          every stroke holds a story.""
        </p>

        {/* specific */}
        <motion.blockquote
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="w-full hover:scale-105 transition-transform duration-300 md:w-4/5 mx-auto bg-gradient-to-r from-[#fffaf0] via-[#fff6e8] to-white dark:from-[#0f1724] dark:via-[#111827] dark:to-[#0b1220] px-6 py-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 text-center mb-6"
          aria-label="Artist quote"
        >
          <p className="italic text-[1.05rem] sm:text-[1.1rem] font-[playfair] text-black dark:text-gray-200">
            “Bringing stories to life through art.”
          </p>
          <cite className="mt-2 block text-sm font-semibold text-gray-600 dark:text-gray-400">
            — Samridhi
          </cite>
        </motion.blockquote>

        {/* Stats Section
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 justify-center md:justify-start w-full">
          <div className="flex-1 bg-[#e0dcd1] dark:bg-[#2a3042] px-6 py-4 rounded-md shadow-md text-center cursor-pointer transition duration-300 hover:scale-105">
            <h3 className="text-2xl font-bold font-playfair  italic sm:text-3xl">{artworksCount}+</h3>
            <p className="dark:text-gray-300 text-black font-[Inter] text-sm sm:text-base">
              Artworks Created
            </p>
          </div>
          <div className="flex-1 bg-[#e0dcd1] dark:bg-[#2a3042] px-6 py-4 rounded-md shadow-md text-center cursor-pointer transition duration-300 hover:scale-105">
            <h3 className="text-2xl font-bold font-playfair  sm:text-3xl">{exhibitionsCount}</h3>
            <p className="dark:text-gray-300 text-black font-[Inter] text-sm sm:text-base">
              Gallery Exhibitions
            </p>
          </div>
        </div> */}
      </motion.div>
    </div>
  );
};

export default MainAbout;
