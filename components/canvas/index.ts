/**
 * Canvas components barrel export
 * Re-exports all canvas-related components for easy importing
 */

// Types and constants
export * from "./types";
export * from "./constants";

// Layout panels (main 3-column structure)
export { SlotPanel, type SlotState, type PlantStatus } from "./SlotPanel";
export { Toolbox } from "./Toolbox";
export { BlueprintCanvas } from "./BlueprintCanvas";
export { StatusPanel } from "@/src/components/plant/StatusPanel";

// Reusable sub-components
export { ComponentSlot } from "./ComponentSlot";
export { PlacedComponentNode } from "./PlacedComponentNode";
export { PipeSvg } from "./PipeSvg";
export { SystemLog } from "./SystemLog";
export { DragPreview } from "./DragPreview";
export { Timer } from "./Timer";
export { WelcomeOverlay } from "./WelcomeOverlay";
export { CompletionOverlay } from "./CompletionOverlay";

// Re-export CanvasItem type explicitly
export type { CanvasItem } from "./types";
