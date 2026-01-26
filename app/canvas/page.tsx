/**
 * Canvas Page - Hybrid Plant Builder
 * 
 * Full-screen 3-panel layout for engineering simulation:
 * - Left: SlotPanel (sequence slots) + Toolbox (components)
 * - Center: BlueprintCanvas (drag & drop area)
 * - Right: StatusPanel (progress & system log)
 * 
 * Responsive Design:
 * - Desktop (lg+): 3-column horizontal layout
 * - Mobile/Tablet: Vertical stacked layout
 * 
 * Brand Colors Only:
 * - #2E3093 (deep indigo) - backgrounds, borders
 * - #2A6BB5 (blue) - secondary, grid lines
 * - #FAE452 (yellow) - accents, highlights
 */

import { CanvasClient } from "./CanvasClient";

/**
 * Server component wrapper for the canvas page
 * Keeps "use client" only in the client component
 */
export default function CanvasPage() {
  return <CanvasClient />;
}
