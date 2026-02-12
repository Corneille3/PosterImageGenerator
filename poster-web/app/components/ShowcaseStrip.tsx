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
