"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";

const EXAMPLES = [
  { src: "/images/dragon.png", alt: "Animation poster" },
  { src: "/images/catering1.png", alt: "Cinematic poster example" },
  { src: "/images/fiction1.png", alt: "Noir poster example" },
  { src: "/images/dragon.png", alt: "Animated poster example" },
  { src: "/images/dish.png", alt: "Animated poster example" },
  { src: "/images/fiction2.png", alt: "Noir style" },
  { src: "/images/dish2.png", alt: "Animation" },
];

export default function ShowcaseStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const imagesPerPage = isMobile ? 1 : 3;

  const scrollRight = () => {
    if (containerRef.current) {
      const totalImages = EXAMPLES.length;
      const maxIndex = totalImages - imagesPerPage;
      const newIndex = Math.min(currentIndex + 1, maxIndex);
      setCurrentIndex(newIndex);
      containerRef.current.scrollTo({
        left: containerRef.current.clientWidth * newIndex,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      const newIndex = Math.max(currentIndex - 1, 0);
      setCurrentIndex(newIndex);
      containerRef.current.scrollTo({
        left: containerRef.current.clientWidth * newIndex,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="showcase-strip"
      className="mt-16 relative max-w-6xl mx-auto px-6"
    >
      <h2 className="text-2xl sm:text-3xl font-semibold text-center text-text mb-4">
        See What You Can Create
      </h2>
      <p className="text-center text-sm text-muted mb-6 sm:mb-8">
        Swipe on mobile or use the arrows on desktop
      </p>

      <div className="relative">
        {/* Image container */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory"
        >
          {EXAMPLES.map((item, index) => (
            <div
              key={index}
              className={`relative flex-shrink-0 rounded-2xl border border-border bg-surface/60 shadow-soft transition-transform duration-300 hover:scale-[1.03] ${
                isMobile ? "w-full snap-center" : "w-1/3"
              }`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={1200}
                height={800}
                className="w-full h-auto object-cover rounded-2xl"
              />
            </div>
          ))}
        </div>

        {/* Desktop arrows */}
        {!isMobile && (
          <>
            <button
              onClick={scrollLeft}
              disabled={currentIndex === 0}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 ${
                currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Scroll left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              disabled={currentIndex >= EXAMPLES.length - imagesPerPage}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 ${
                currentIndex >= EXAMPLES.length - imagesPerPage
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              aria-label="Scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Mobile swipe hint */}
        {isMobile && (
          <div className="absolute right-4 bottom-2 text-xs text-muted animate-bounce">
            Swipe →
          </div>
        )}
      </div>
    </section>
  );
}
