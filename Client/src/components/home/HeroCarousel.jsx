import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const HeroCarousel = () => {
  const carouselRef = useRef(null);

  const images = [
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop', // Books on shelf
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop', // Study desk
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop', // Library
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1200&auto=format&fit=crop', // Open book
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop', // Reading nook
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });
      const N = images.length;
      
      // We duplicate the array in the DOM, so total slides = N * 2
      // The container width holds N * 2 slides. One slide is (100 / (N * 2))% of container width.
      const slidePercent = 100 / (N * 2);

      // Loop through the original number of images to create the slide & pause effect
      for (let i = 1; i <= N; i++) {
        tl.to(carouselRef.current, {
          xPercent: -(slidePercent * i),
          duration: 0.8,
          ease: "power2.inOut",
        }, "+=3"); // Pause for 3 seconds before each slide
      }
    });

    return () => ctx.revert(); // Cleanup on unmount
  }, [images.length]);

  return (
    <div className="relative w-full overflow-hidden rounded-md bg-[var(--color-parchment-50)] mb-8 shadow-[var(--shadow-card)]">
      <div 
        ref={carouselRef} 
        className="flex"
        style={{ width: `${images.length * 200}%` }}
      >
        {/* Duplicate the images array to create an infinite scroll effect */}
        {[...images, ...images].map((src, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 h-[300px] md:h-[400px]"
            style={{ width: `${100 / (images.length * 2)}%` }}
          >
            <img 
              src={src} 
              alt={`Hero Banner ${index + 1}`} 
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Optional Gradient Overlays for better text readability or styling */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-6 left-8 pointer-events-none text-white">
        <h2 className="text-3xl font-display font-bold mb-2">Welcome to Bibliobazar</h2>
        <p className="text-lg">Discover your next great read today.</p>
      </div>
    </div>
  );
};

export default HeroCarousel;
