"use client"; // Ensure this is a Client Component

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

// Example images
const EXAMPLES = [
  { src: "/images/dragon.png", alt: "Animation poster" },
  { src: "/images/catering1.png", alt: "Cinematic poster example", caution: "what is this" },
  { src: "/images/fiction1.png", alt: "Noir poster example" },
  { src: "/images/dragon.png", alt: "Animated poster example" },
  { src: "/images/dish.png", alt: "Animated poster example" },
  { src: "/images/fiction2.png", alt: "Noir style" },
  { src: "/images/dish2.png", alt: "Animation" },
];

export default function ShowcaseStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Number of images to display at once
  const imagesPerPage = 3;

  // Handle right scroll action (next set of 3 images)
  const scrollRight = () => {
    if (containerRef.current) {
      const totalImages = EXAMPLES.length;
      const maxScrollIndex = totalImages - imagesPerPage;
      const newIndex = Math.min(currentIndex + 1, maxScrollIndex);
      setCurrentIndex(newIndex);
    }
  };

  // Handle left scroll action (previous set of 3 images)
  const scrollLeft = () => {
    if (containerRef.current) {
      const newIndex = Math.max(currentIndex - 1, 0);
      setCurrentIndex(newIndex);
    }
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

        {/* Showcase Grid with Horizontal Scroll */}
        <div className="relative">
          <div
            ref={containerRef}
            className="flex overflow-hidden gap-6"
            style={{
              scrollBehavior: "smooth",
            }}
          >
            {/* Map through the EXAMPLES array but only show 3 images at a time */}
            {EXAMPLES.slice(currentIndex, currentIndex + imagesPerPage).map(
              (item, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-soft transition-transform duration-300 hover:scale-[1.03]"
                >
                  {/* Image */}
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                    priority={index === 0}
                  />
                </div>
              )
            )}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 
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
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={scrollRight}
            disabled={currentIndex === EXAMPLES.length - imagesPerPage}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 
              ${currentIndex === EXAMPLES.length - imagesPerPage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
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
