import type { ReactNode } from "react";

/**
 * Reserves the gutters the GPS route runs through, as real layout rather than
 * as an overlay guess. The route overlay measures these elements, so the route
 * can never end up on top of the content.
 *
 * Left gutter only on small screens; both on wide ones.
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
      className={`grid grid-cols-[3rem_minmax(0,1fr)] lg:grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] ${className}`}
    >
      <span data-lane="left" aria-hidden="true" className="block h-full" />
      <div className="min-w-0">{children}</div>
      <span
        data-lane="right"
        aria-hidden="true"
        className="hidden h-full lg:block"
      />
    </div>
  );
}
