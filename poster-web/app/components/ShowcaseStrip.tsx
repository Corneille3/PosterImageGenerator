"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

const EXAMPLES = [
  { src: "/images/dragon.png", alt: "Animation poster" },
  { src: "/images/catering1.png", alt: "Cinematic poster example" },
  { src: "/images/fiction1.png", alt: "Noir poster example" },
  { src: "/images/dish.png", alt: "Food poster example" },
  { src: "/images/fiction2.png", alt: "Noir style" },
  { src: "/images/dish2.png", alt: "Animation" },
];

export default function ShowcaseStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);

  // Hide swipe hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.9;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section id="showcase-strip" className="mt-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-text mb-8">
          See What You Can Create —{" "}
          <Link
            href="/gallery"
            className="inline-block px-4 py-2 text-sm sm:text-base font-medium text-white bg-accent rounded-lg shadow hover:bg-accent2 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Gallery
          </Link>
        </h2>

        <div className="relative">
          {/* Swipe Hint (Mobile Only) */}
          {showHint && (
            <div className="absolute -top-6 right-4 text-xs text-muted animate-pulse md:hidden">
              Swipe →
            </div>
          )}

          {/* Scroll Container */}
          <div
            ref={containerRef}
            className="
              flex gap-6 overflow-x-auto scroll-smooth
              scrollbar-hide
            "
          >
            {EXAMPLES.map((item, index) => (
              <div
                key={index}
                className="
                  flex-shrink-0
                  w-full
                  md:w-[calc(33.333%-1rem)]
                  relative overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-soft
                  transition-transform duration-300 hover:scale-[1.03]
                "
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

          {/* Desktop Arrows */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10
                       bg-white/70 hover:bg-white p-3 rounded-full shadow-md transition"
            aria-label="Scroll left"
          >
            ←
          </button>

          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10
                       bg-white/70 hover:bg-white p-3 rounded-full shadow-md transition"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
