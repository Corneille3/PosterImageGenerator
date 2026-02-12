"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

// Example images
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

  // Responsive: 1 image on mobile, 3 on desktop
  useEffect(() => {
    const updateImagesPerPage = () => {
      setImagesPerPage(window.innerWidth < 768 ? 1 : 3);
    };
    updateImagesPerPage();
    window.addEventListener("resize", updateImagesPerPage);
    return () => window.removeEventListener("resize", updateImagesPerPage);
  }, []);

  // Scroll container manually whenever currentIndex changes
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const childWidth = container.scrollWidth / EXAMPLES.length;
    container.scrollTo({
      left: childWidth * currentIndex,
      behavior: "smooth",
    });
  }, [currentIndex]);

  const scrollRight = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + 1, EXAMPLES.length - imagesPerPage)
    );
  };

  const scrollLeft = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="mt-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
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
          {/* Image container */}
          <div
            ref={containerRef}
            className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }} // hide scrollbar on Firefox
          >
            {EXAMPLES.map((item, index) => (
              <div
                key={index}
                className={`snap-start flex-shrink-0 rounded-2xl border border-border bg-surface/60 shadow-soft transition-transform duration-300 hover:scale-[1.03]`}
                style={{ width: imagesPerPage === 1 ? "100%" : "calc((100% - 1.5rem*2)/3)" }}
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

          {/* Left arrow - hidden on mobile */}
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className={`hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-50 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 
              ${currentIndex === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
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

          {/* Right arrow - hidden on mobile */}
          <button
            onClick={scrollRight}
            disabled={currentIndex >= EXAMPLES.length - imagesPerPage}
            className={`hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-50 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 
              ${currentIndex >= EXAMPLES.length - imagesPerPage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
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
        </div>
      </div>
    </section>
  );
}
