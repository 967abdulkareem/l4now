import type { ReactNode } from "react";

/**
 * Reserves the gutters the GPS route runs through, as real layout rather than
 * as an overlay guess. The route overlay measures these elements, so the route
 * can never end up on top of the content.
 *
 * Both gutters exist at every width: on phones the route squares off around
 * the cards, so it needs room on the right as well as the left. The phone
 * lanes are narrower — the content column matters more there.
 */
export function Lanes({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-[2.75rem_minmax(0,1fr)_2.25rem] lg:grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] ${className}`}
    >
      <span data-lane="left" aria-hidden="true" className="block h-full" />
      <div className="min-w-0">{children}</div>
      <span data-lane="right" aria-hidden="true" className="block h-full" />
    </div>
  );
}
