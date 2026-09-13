import { site } from "@/lib/site";

/** Native pixel size of public/logo.png — never rendered larger than this. */
export const LOGO_NATIVE = { width: 446, height: 337 } as const;

/**
 * The supplied logo, used as-is.
 *
 * It already contains the wordmark and the strapline, so nothing renders a
 * text lockup beside it — that would print the name twice.
 */
export function BrandLogo({
  className = "",
  width = 170,
}: {
  className?: string;
  /** Capped at the source's own width so it is never upscaled. */
  width?: number;
}) {
  const w = Math.min(width, LOGO_NATIVE.width);
  const h = Math.round((w / LOGO_NATIVE.width) * LOGO_NATIVE.height);

  return (
    // Static export has no image optimiser, and the asset is already sized
    // for its slot.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt={site.name}
      width={w}
      height={h}
      className={className}
      decoding="async"
    />
  );
}
