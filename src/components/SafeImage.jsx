import { useState } from "react";
import fb1 from "../assets/i1.png";
import fb2 from "../assets/i2.png";
import fb3 from "../assets/i3.png";
import fb4 from "../assets/i4.png";
import fb5 from "../assets/i5.png";
import fb6 from "../assets/i6.png";
import fb7 from "../assets/i7.png";
import fb8 from "../assets/i8.png";

const FALLBACKS = [fb1, fb2, fb3, fb4, fb5, fb6, fb7, fb8];

export default function SafeImage({ src, alt = "", fallbackIndex = 0, style, className, ...rest }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fallback = FALLBACKS[fallbackIndex % FALLBACKS.length];

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      onError={() => setError(true)}
      onLoad={() => setLoaded(true)}
      loading="lazy"
      decoding="async"
      style={{
        opacity: loaded || error ? 1 : 0.2,
        transition: "opacity 0.4s ease",
        ...style,
      }}
      className={className}
      {...rest}
    />
  );
}

export const LOCAL_ASSETS = FALLBACKS;
