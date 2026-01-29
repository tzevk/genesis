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
export { StatusPanel } from "@/src/components/plant/StatusPanel";

// Reusable sub-components
export { Timer } from "./Timer";
export { WelcomeOverlay } from "./WelcomeOverlay";
export { CompletionOverlay } from "./CompletionOverlay";
export { TutorialOverlay, getTutorialSteps, OIL_GAS_TUTORIAL_STEPS } from "./TutorialOverlay";
export { PipeConnectingCanvas } from "./PipeConnectingCanvas";
export { HVAC2DCanvas } from "./HVAC2DCanvas";
export { HVACWelcomeOverlay } from "./HVACWelcomeOverlay";
export { MEP2DCanvas } from "./MEP2DCanvas";
export { MEPWelcomeOverlay } from "./MEPWelcomeOverlay";
export { default as Electrical2DCanvas } from "./Electrical2DCanvas";
export { default as ElectricalWelcomeOverlay } from "./ElectricalWelcomeOverlay";
export { default as Process2DCanvas } from "./Process2DCanvas";
export { default as ProcessWelcomeOverlay } from "./ProcessWelcomeOverlay";
export { default as ThankYouOverlay } from "./ThankYouOverlay";


// Re-export CanvasItem type explicitly
export type { CanvasItem } from "./types";
