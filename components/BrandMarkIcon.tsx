/** Same mark as `app/favicon.ico` / `public/icon.png` (32×32 viewBox). */
export default function BrandMarkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#0f1412" />
      <rect x="6" y="19" width="5" height="7" rx="1.5" fill="#00c98d" />
      <rect x="13.5" y="13" width="5" height="13" rx="1.5" fill="#00c98d" />
      <rect x="21" y="7" width="5" height="19" rx="1.5" fill="#00c98d" />
    </svg>
  );
}
