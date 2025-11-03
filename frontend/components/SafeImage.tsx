"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='system-ui' font-size='24'%3EBook Cover%3C/text%3E%3C/svg%3E";

/**
 * Get fallback URLs for Waterstones images
 * Try different size variants: large -> medium -> small
 */
function getImageFallbacks(url: string): string[] {
  if (!url || !url.includes("cdn.waterstones.com")) {
    return [url];
  }

  const fallbacks: string[] = [url];

  // If large, try medium and small
  if (url.includes("/large/")) {
    fallbacks.push(url.replace("/large/", "/medium/"));
    fallbacks.push(url.replace("/large/", "/small/"));
  }
  // If medium, try small
  else if (url.includes("/medium/")) {
    fallbacks.push(url.replace("/medium/", "/small/"));
  }

  return fallbacks;
}

export default function SafeImage({
  src,
  alt,
  fill = false,
  className = "",
  sizes = "(max-width: 480px) 400px, (max-width: 768px) 500px, (max-width: 1024px) 400px, 600px",
  priority = false,
  quality = 100,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [imageFallbacks] = useState(() => getImageFallbacks(src));

  // Reset when src changes
  useEffect(() => {
    setImgSrc(src);
    setFallbackIndex(0);
  }, [src]);

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;

    // Try next fallback
    if (nextIndex < imageFallbacks.length) {
      setFallbackIndex(nextIndex);
      setImgSrc(imageFallbacks[nextIndex]);
    } else {
      // All fallbacks failed, use placeholder
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQABQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGxwf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      unoptimized={imgSrc === FALLBACK_IMAGE}
    />
  );
}
