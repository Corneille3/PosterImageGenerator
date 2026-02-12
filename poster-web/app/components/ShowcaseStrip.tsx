"use client";

import Image from "next/image";
import Link from "next/link";
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
  const [imagesPerPage, setImagesPerPage] = useState(3);

  useEffect(() => {
    const updateLayout = () => {
      if (window.innerWidth < 640) setImagesPerPage(1);
      else if (window.innerWidth < 1024) setImagesPerPage(2);
      else setImagesPerPage(3);
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const scrollRight = () => {
    const maxIndex = EXAMPLES.length - imagesPerPage;
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const scrollLeft = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <section className="mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-text mb-8">
          See What You Can Create — click on{" "}
          <Link
            href="/gallery"
            className="inline-block px-4 py-2 text-sm sm:text-base font-medium text-white bg-accent rounded-lg shadow hover:bg-accent2 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Gallery
          </Link>{" "}
          for more images
        </h2>

        <div className="relative">
          <div
            ref={containerRef}
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollBehavior: "smooth" }}
          >
            {EXAMPLES.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full sm:w-[45%] lg:w-[32%] snap-center rounded-2xl border border-border bg-surface/60 shadow-soft transition-transform duration-300 hover:scale-[1.03]"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover rounded-2xl"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Left Button */}
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 ${
              currentIndex === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
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
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Button */}
          <button
            onClick={scrollRight}
            disabled={currentIndex >= EXAMPLES.length - imagesPerPage}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 ${
              currentIndex >= EXAMPLES.length - imagesPerPage ? "cursor-not-allowed opacity-50" : "cursor-pointer"
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
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
