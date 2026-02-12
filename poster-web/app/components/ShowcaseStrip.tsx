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
  const imagesPerPage = 3;

  const scrollRight = () => {
    if (containerRef.current) {
      const totalImages = EXAMPLES.length;
      const maxScrollIndex = totalImages - imagesPerPage;
      setCurrentIndex((prev) => Math.min(prev + 1, maxScrollIndex));
    }
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <section id="showcase-strip" className="mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-text mb-8">
          See What You Can Create — swipe on mobile or use arrows on desktop
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
                className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-soft flex-shrink-0 w-[80%] sm:w-[33%] snap-start"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className={`absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 ${
              currentIndex === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            disabled={currentIndex >= EXAMPLES.length - imagesPerPage}
            className={`absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 ${
              currentIndex >= EXAMPLES.length - imagesPerPage ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
