/**
 * Type definitions for the Canvas/Plant Builder feature
 * Shared across all canvas-related components
 */

/** Component definition from engineering sequence */
export interface ComponentDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requiredBefore: string[];
  connectsTo: string[];
}

/** A component that has been placed on the canvas */
export interface PlacedComponent {
  id: string;
  componentId: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  slotIndex: number;
}

/** A canvas-placed component instance (new system) */
export interface CanvasItem {
  id: string;           // Unique instance ID (crypto.randomUUID())
  componentId: string;  // Reference to catalog component
  x: number;            // Percentage position (0-100)
  y: number;            // Percentage position (0-100)
}

/** A pipe connection between two placed components */
export interface PipeConnection {
  id: string;
  from: string;
  to: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

/** Validation message shown in the system log */
export interface ValidationMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

/** Drag state for component dragging */
export interface DragState {
  isDragging: boolean;
  componentId: string | null;
  position: { x: number; y: number };
}
