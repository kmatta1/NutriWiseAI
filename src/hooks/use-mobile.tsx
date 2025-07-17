
"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check on mount
    checkDevice();

    // Add resize listener
    window.addEventListener("resize", checkDevice);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []); // Empty dependency array ensures this runs only once on the client after mount

  return isMobile;
}
