"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640); // sm breakpoint
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const imagesPerPage = isMobile ? 1 : 3;

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

        {/* Horizontal scroll container */}
        <div className="flex overflow-x-auto gap-6 snap-x snap-mandatory">
          {EXAMPLES.map((item, index) => (
            <div
              key={index}
              className={`relative min-w-[${isMobile ? "80%" : "30%"}] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-soft transition-transform duration-300 hover:scale-[1.03]`}
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
      </div>
    </section>
  );
}
