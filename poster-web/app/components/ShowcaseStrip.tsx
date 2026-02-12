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

  // Update imagesPerPage based on screen width
  useEffect(() => {
    const updateImagesPerPage = () => {
      setImagesPerPage(window.innerWidth < 640 ? 1 : 3);
    };

    updateImagesPerPage();
    window.addEventListener("resize", updateImagesPerPage);
    return () => window.removeEventListener("resize", updateImagesPerPage);
  }, []);

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const child = container.children[index] as HTMLElement;
    if (child) {
      container.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const maxIndex = EXAMPLES.length - imagesPerPage;
    const newIndex = Math.min(currentIndex + 1, maxIndex);
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const scrollLeft = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

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
            className="flex overflow-x-auto gap-6 snap-x snap-mandatory scroll-smooth"
          >
            {EXAMPLES.map((item, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-full sm:w-[calc(33.333%-16px)] snap-center overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-soft transition-transform duration-300 hover:scale-[1.03]"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>

          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200
              ${currentIndex === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          {/* Right Arrow */}
        <button
          onClick={scrollRight}
          disabled={currentIndex >= EXAMPLES.length - imagesPerPage}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 hover:bg-opacity-100 p-3 rounded-full shadow-md transition-all duration-200 ${
            currentIndex >= EXAMPLES.length - imagesPerPage ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
