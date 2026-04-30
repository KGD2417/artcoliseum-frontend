/* SVG icon set used across the app to replace emoji glyphs.
   All icons inherit currentColor so they respect text color. */

const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const ArEyeIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M21 7V5a2 2 0 0 0-2-2h-2" />
    <path d="M3 17v2a2 2 0 0 0 2 2h2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

export const SunIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const TextureIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 9l6-6M3 15l12-12M3 21l18-18M9 21l12-12M15 21l6-6" />
  </svg>
);

export const PlusIcon = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const UploadIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const CloudIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5 1.5A4 4 0 0 0 6 19h11.5z" />
  </svg>
);

export const ImageIcon = ({ size = 20 }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M21 15l-5-5-9 9" />
  </svg>
);

export const HeartIcon = ({ size = 16, filled = false }) => (
  <svg {...base(size)} fill={filled ? "currentColor" : "none"}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const ZoomIcon = ({ size = 16 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const SparkIcon = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2z" />
  </svg>
);

export const SearchIcon = ({ size = 14 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const CopyIcon = ({ size = 14 }) => (
  <svg {...base(size)}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckIcon = ({ size = 14 }) => (
  <svg {...base(size)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const MessageIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const ShieldIcon = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const PaletteIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M12 2a10 10 0 1 0 0 20c1.66 0 3-1.34 3-3 0-.81-.31-1.55-.83-2.1a1 1 0 0 1 .73-1.69H17a5 5 0 0 0 5-5c0-4.42-4.48-8-10-8z" />
    <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
    <circle cx="10.5" cy="6.5" r="1.2" fill="currentColor" />
    <circle cx="15" cy="6.5" r="1.2" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r="1.2" fill="currentColor" />
  </svg>
);

export const ChiselIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M14 4l6 6-9 9-6-6 9-9z" />
    <path d="M5 19l-2 2" />
  </svg>
);

export const CameraIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const ChipIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </svg>
);

export const PencilIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

export const FrameIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <rect x="7" y="7" width="10" height="10" />
  </svg>
);

export const GlobeIcon = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/* Service strip icons (image1 reference, gold line-art) */
export const ArtistFigureIcon = ({ size = 56 }) => (
  <svg {...base(size)} strokeWidth={1.2}>
    <path d="M7.8 5.5C7.8 4 9.5 3 12 3s4.2 1 4.2 2.5V7H7.8z" />
    <path d="M7 7h10" />
    <circle cx="12" cy="11" r="3.4" />
    <path d="M5.5 21v-2.5c0-2 2.5-3.5 6.5-3.5s6.5 1.5 6.5 3.5V21" />
    <path d="M19.5 13.6l2.5 6" />
    <path d="M21 13l-1.4 1.5" />
  </svg>
);

export const HandshakeIcon = ({ size = 56 }) => (
  <svg {...base(size)} strokeWidth={1.2}>
    <path d="M2.5 12.5l4-4 3.5 3.5-1.5 1.5-1.5 1.5-2.5 1z" />
    <path d="M21.5 12.5l-4-4-3.5 3.5 1.5 1.5 1.5 1.5 2.5 1z" />
    <path d="M9 12l3-3 3 3" />
    <path d="M12 9l3.5 3.5-1 1L11.5 10z" />
  </svg>
);

export const ArtSolutionsIcon = ({ size = 56 }) => (
  <svg {...base(size)} strokeWidth={1.2}>
    <path d="M12 3a9 9 0 1 0 0 18c1.6 0 2.8-1.3 2.8-2.9 0-.8-.3-1.5-.8-2-.5-.5-.3-1.4.4-1.4H16a5 5 0 0 0 5-5c0-3.9-4-6.7-9-6.7z" />
    <circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="17" cy="11" r="1.1" fill="currentColor" stroke="none" />
    <path d="M14.5 17.5l3-3 4 4-3 3z" />
  </svg>
);

export const FrameArtIcon = ({ size = 56 }) => (
  <svg {...base(size)} strokeWidth={1.2}>
    <rect x="4" y="4" width="16" height="16" />
    <rect x="6.5" y="6.5" width="11" height="11" />
    <circle cx="9" cy="10" r="1.2" />
    <path d="M7 16l3-3 2.5 2.5L15 13l3 3" />
  </svg>
);

export const PencilRulerIcon = ({ size = 56 }) => (
  <svg {...base(size)} strokeWidth={1.2}>
    <path d="M14 3l-10 10-1.5 4.5L7 16l10-10z" />
    <path d="M12 5l4 4" />
    <path d="M19 10l3 3-9 9-3-3z" />
    <path d="M12 16l1 1M14 14l1 1M16 12l1 1" />
  </svg>
);

export const DealIcon = ({ size = 56 }) => (
  <svg {...base(size)} strokeWidth={1.2}>
    <path d="M5 3h10l4 4v14H5z" />
    <path d="M15 3v4h4" />
    <path d="M7 13l3-2 3 2 4-3" />
    <path d="M9 16l2-1 2 1 2-1.5" />
  </svg>
);
