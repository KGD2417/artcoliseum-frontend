import { forwardRef } from "react";
import { motion } from "framer-motion";

const SPRING = {
  type: "spring",
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
};

const filterVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

// Stagger wrapper — triggers children animations on scroll into view
export const ContainerStagger = forwardRef(function ContainerStagger(
  { transition, children, style, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{
        staggerChildren: transition?.staggerChildren ?? 0.18,
        delayChildren: transition?.delayChildren ?? 0.15,
        duration: 0.3,
        ...transition,
      }}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
});

// Individual animated child — blurs in
export const ContainerAnimated = forwardRef(function ContainerAnimated(
  { transition, children, style, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      variants={filterVariants}
      transition={{ ...SPRING, duration: 0.3, ...transition }}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
});

// 2-column grid with staggered row heights
export const GalleryGrid = forwardRef(function GalleryGrid(
  { children, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "50px 150px 50px 150px 50px",
        gap: 16,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

const AREA_STYLES = [
  { gridColumn: "2/3", gridRow: "1/3" },
  { gridColumn: "1/2", gridRow: "2/4" },
  { gridColumn: "1/2", gridRow: "4/6" },
  { gridColumn: "2/3", gridRow: "3/5" },
];

// Single grid cell with fade-in and image
export const GalleryGridCell = forwardRef(function GalleryGridCell(
  { index, src, alt = "", style, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        ...AREA_STYLES[index],
        ...style,
      }}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
      />
    </motion.div>
  );
});
