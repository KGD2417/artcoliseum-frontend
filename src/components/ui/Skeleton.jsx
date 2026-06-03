/**
 * Skeleton loaders — gold-tinted shimmer placeholders that match the site palette.
 *
 * The shimmer animation + `.coli-skeleton` base class live in index.css.
 *
 *   <Skeleton width="100%" height={220} radius={12} />
 *   <SkeletonCard />
 *   <SkeletonGrid count={8} />
 *   <SkeletonText lines={3} />
 *   <SkeletonDetail />
 */

/** Base shimmer block. */
export function Skeleton({ width = "100%", height = 16, radius = 8, style, className = "" }) {
  return (
    <span
      className={`coli-skeleton ${className}`}
      style={{
        display: "block",
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

/** Single artwork card: image block + title + subtitle. */
export function SkeletonCard({ imageHeight = 280 }) {
  return (
    <div
      style={{
        border: "1px solid rgba(212,175,55,0.12)",
        borderRadius: 14,
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
      }}>
      <Skeleton height={imageHeight} radius={0} />
      <div style={{ padding: "14px 16px" }}>
        <Skeleton width="75%" height={16} />
        <Skeleton width="45%" height={12} style={{ marginTop: 10 }} />
        <Skeleton width="30%" height={14} style={{ marginTop: 14 }} />
      </div>
    </div>
  );
}

/** Responsive grid of skeleton cards (mirrors the catalog grids). */
export function SkeletonGrid({ count = 8, minColWidth = 260, maxColWidth = 320, imageHeight = 280, gap = 22 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minColWidth}px, 100%), ${maxColWidth}px))`,
        justifyContent: "center",
        gap,
      }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} imageHeight={imageHeight} />
      ))}
    </div>
  );
}

/** A block of text lines (last one shorter). */
export function SkeletonText({ lines = 3, gap = 10 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === lines - 1 ? "60%" : "100%"} />
      ))}
    </div>
  );
}

/** Product / profile hero: large image beside a column of text. */
export function SkeletonDetail() {
  return (
    <div
      className="coli-skeleton-detail"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)",
        gap: 40,
        alignItems: "start",
      }}>
      <Skeleton height={480} radius={16} />
      <div>
        <Skeleton width="40%" height={12} />
        <Skeleton width="85%" height={34} radius={10} style={{ marginTop: 16 }} />
        <Skeleton width="55%" height={18} style={{ marginTop: 14 }} />
        <div style={{ marginTop: 28 }}>
          <SkeletonText lines={4} />
        </div>
        <Skeleton width="100%" height={52} radius={999} style={{ marginTop: 32 }} />
        <Skeleton width="100%" height={52} radius={999} style={{ marginTop: 12 }} />
      </div>
    </div>
  );
}

/** Row skeletons for list/table views (cart, dashboards, inbox). */
export function SkeletonRows({ count = 5, height = 64, gap = 12 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={height} radius={10} />
      ))}
    </div>
  );
}

export default Skeleton;
