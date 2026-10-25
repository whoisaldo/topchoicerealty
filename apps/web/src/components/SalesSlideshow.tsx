import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import image1 from '../assets/salesimages/image.png';
import image2 from '../assets/salesimages/image2.png';
import image3 from '../assets/salesimages/image3.png';
import image4 from '../assets/salesimages/image4.png';
import image5 from '../assets/salesimages/image5.png';
import image6 from '../assets/salesimages/image6.png';
import image7 from '../assets/salesimages/image7.png';
import image8 from '../assets/salesimages/image8.png';

const salesImages = [image1, image2, image3, image4, image5, image6, image7, image8];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function SalesSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || prefersReducedMotion()) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % salesImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? salesImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % salesImages.length);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border-4 border-gold shadow-2xl transition-shadow duration-300 hover:shadow-glow-gold">
        <div className="relative h-[500px]">
          {salesImages.map((image, index) => (
            <div
              key={index}
              className={cn(
                'absolute inset-0 transition-all duration-1000 ease-in-out',
                index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
            >
              <img
                src={image}
                alt={`Sold property ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-gold opacity-0 transition-all duration-300 hover:bg-black/80 group-hover:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-gold/70"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-gold opacity-0 transition-all duration-300 hover:bg-black/80 group-hover:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-gold/70"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {salesImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70',
                index === currentIndex
                  ? 'w-8 h-3 bg-gold'
                  : 'w-3 h-3 bg-white/60 hover:bg-white/80'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm font-bold text-gold backdrop-blur-sm">
          {currentIndex + 1} / {salesImages.length}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
        <Trophy className="h-4 w-4 text-gold" aria-hidden="true" />
        <p className="italic">Recent successful sales by Top Choice Realty</p>
      </div>
    </div>
  );
}
