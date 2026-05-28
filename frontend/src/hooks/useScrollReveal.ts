import { useEffect, useRef } from "react";

/**
 * A custom React hook that observes an element using the IntersectionObserver API.
 * When the element scrolls into view, it appends the `is-visible` CSS class,
 * triggering smooth premium hardware-accelerated entrance animations.
 */
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Fallback for environments without IntersectionObserver support
      if (ref.current) {
        ref.current.classList.add("is-visible");
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Only trigger animation once for a clean look
        }
      },
      {
        threshold: 0.05, // Trigger early as element comes into viewport
        rootMargin: "0px 0px -20px 0px", // Trigger slightly before it fully appears
      }
    );

    const currentEl = ref.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, []);

  return ref;
};
