/**
 * Canvas Page - Plant Builder
 * 
 * Routes to different canvas experiences based on sector:
 * - Oil & Gas: Pipe-connecting canvas with flow validation
 * - Other sectors: Standard drag-drop component builder
 * 
 * Brand Colors Only:
 * - #2E3093 (deep indigo) - backgrounds, borders
 * - #2A6BB5 (blue) - secondary, grid lines
 * - #FAE452 (yellow) - accents, highlights
 */

"use client";

import { CanvasRouter } from "./CanvasRouter";

/**
 * Server component wrapper for the canvas page
 * Keeps "use client" only in the client component
 */
export default function CanvasPage() {
  return <CanvasRouter />;
}
