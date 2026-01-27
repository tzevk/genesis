"use client";

/**
 * Toolbox - Component palette for available engineering components
 * 
 * Features:
 * - Components grouped by category: Core, Utility, Safety, Control
 * - Filtered by active sector
 * - HTML5 drag and drop support
 * - Click to select as active tool
 * 
 * Brand Colors:
 * - #2E3093 (deep indigo) - primary backgrounds
 * - #2A6BB5 (blue) - borders, secondary
 * - #FAE452 (yellow) - active states, highlights
 * - #FFFFFF (white) - text, icons
 */

import { useState, useCallback, useMemo } from "react";
import {
  CATEGORIES,
  ICONS,
  getComponentsBySector,
} from "../../src/components/plant/catalog";

// ============================================
// BRAND COLORS
// ============================================
const BRAND = {
  indigo: "#2E3093",
  blue: "#2A6BB5",
  yellow: "#FAE452",
  white: "#FFFFFF",
} as const;

// ============================================
// TYPES
// ============================================

/** Component from catalog */
interface CatalogComponent {
  id: string;
  label: string;
  slotHint: string;
  category: string;
  icon: string;
  sectorTags: string[];
}

/** Grouped components by category */
type GroupedComponents = Record<string, CatalogComponent[]>;
interface ToolboxProps {
  /** User's selected sector */
  sector: string;
  /** Currently selected tool ID */
  selectedTool: string | null;
  /** Callback when a tool is selected */
  onSelectTool: (toolId: string | null) => void;
  /** Callback when drag starts */
  onDragStart?: (componentId: string) => void;
}

interface ComponentCardProps {
  id: string;
  label: string;
  iconKey: string;
  slotHint: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

// ============================================
// COMPONENT CARD
// Individual draggable component card
// ============================================
function ComponentCard({
  id,
  label,
  iconKey,
  slotHint,
  isSelected,
  onSelect,
  onDragStart,
}: ComponentCardProps) {
  const iconSvg = ICONS[iconKey as keyof typeof ICONS] || ICONS.tank;
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart(e, id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(id)}
      className="relative flex flex-col items-center justify-center p-2 rounded-lg cursor-grab active:cursor-grabbing select-none hover:scale-[1.02] transition-all duration-150"
      style={{
        background: isSelected ? `${BRAND.yellow}20` : `${BRAND.blue}15`,
        border: isSelected ? `2px solid ${BRAND.yellow}` : `1px solid ${BRAND.blue}30`,
        boxShadow: isSelected ? `0 0 12px ${BRAND.yellow}40` : 'none',
        minHeight: "64px",
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {/* Icon */}
      <div
        className="w-6 h-6 mb-1"
        style={{ color: isSelected ? BRAND.yellow : BRAND.white }}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />

      {/* Label */}
      <span
        className="text-[10px] font-medium text-center leading-tight"
        style={{ color: isSelected ? BRAND.yellow : `${BRAND.white}CC` }}
      >
        {label}
      </span>

      {/* Slot hint badge */}
      <span
        className="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 rounded"
        style={{
          background: `${BRAND.indigo}`,
          color: `${BRAND.white}80`,
          border: `1px solid ${BRAND.blue}40`,
        }}
      >
        {slotHint.slice(0, 3)}
      </span>
    </div>
  );
}

// ============================================
// CATEGORY SECTION
// Collapsible category with component grid
// ============================================
interface CategorySectionProps {
  categoryId: string;
  categoryLabel: string;
  components: CatalogComponent[];
  selectedTool: string | null;
  onSelectTool: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategorySection({
  categoryId,
  categoryLabel,
  components,
  selectedTool,
  onSelectTool,
  onDragStart,
  isExpanded,
  onToggle,
}: CategorySectionProps) {
  if (components.length === 0) return null;

  // Suppress unused variable warning - categoryId used for key prop at parent level
  void categoryId;

  return (
    <div className="mb-2">
      {/* Category header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded"
        style={{
          background: `${BRAND.indigo}60`,
        }}
      >
        <span
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: BRAND.white }}
        >
          {categoryLabel}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: `${BRAND.blue}40`,
              color: `${BRAND.white}90`,
            }}
          >
            {components.length}
          </span>
          <svg
            className="w-3 h-3 transition-transform"
            style={{
              color: `${BRAND.white}70`,
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Components grid */}
      {isExpanded && (
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {components.map((comp) => (
              <ComponentCard
                key={comp.id}
                id={comp.id}
                label={comp.label}
                iconKey={comp.icon}
                slotHint={comp.slotHint}
                isSelected={selectedTool === comp.id}
                onSelect={onSelectTool}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN TOOLBOX COMPONENT
// ============================================
export function Toolbox({
  sector,
  selectedTool,
  onSelectTool,
  onDragStart,
}: ToolboxProps) {
  // Track expanded categories - default all expanded
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Core: true,
    Utility: true,
    Safety: true,
    Control: true,
  });

  // Get components grouped by category, filtered by sector
  const groupedComponents = useMemo((): GroupedComponents => {
    return getComponentsBySector(sector) as GroupedComponents;
  }, [sector]);

  // Total component count
  const totalCount = useMemo(() => {
    return Object.values(groupedComponents).flat().length;
  }, [groupedComponents]);

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

  // Handle tool selection (click)
  const handleSelectTool = useCallback(
    (toolId: string) => {
      // Toggle selection if clicking the same tool
      if (selectedTool === toolId) {
        onSelectTool(null);
      } else {
        onSelectTool(toolId);
      }
    },
    [selectedTool, onSelectTool]
  );

  // Handle drag start (HTML5 DnD)
  const handleDragStart = useCallback(
    (e: React.DragEvent, componentId: string) => {
      // Set drag data
      e.dataTransfer.setData("componentId", componentId);
      e.dataTransfer.effectAllowed = "copy";

      // Use a transparent 1x1 pixel image to hide the default drag ghost
      // This prevents the "glitch" of seeing a duplicate element
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      e.dataTransfer.setDragImage(canvas, 0, 0);

      // Notify parent
      onDragStart?.(componentId);
    },
    [onDragStart]
  );

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{
        background: `${BRAND.indigo}`,
        border: `1px solid ${BRAND.blue}40`,
      }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-3 py-2 flex items-center justify-between"
        style={{
          background: `${BRAND.indigo}`,
          borderBottom: `1px solid ${BRAND.blue}30`,
        }}
      >
        <div className="flex items-center gap-2">
          {/* Toolbox icon */}
          <div
            className="w-5 h-5"
            style={{ color: BRAND.yellow }}
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-8.5 8.5a2.12 2.12 0 103 3L17 9"/><path d="M7 16l-3 3"/><path d="M16 8L8 16"/><path d="M18 12l-3-3 3-3 3 3z"/></svg>`,
            }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: BRAND.white }}
          >
            Components
          </span>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: `${BRAND.blue}40`,
            color: BRAND.yellow,
          }}
        >
          {totalCount}
        </span>
      </div>

      {/* Sector badge */}
      <div
        className="flex-shrink-0 px-3 py-1.5"
        style={{
          background: `${BRAND.blue}20`,
          borderBottom: `1px solid ${BRAND.blue}20`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: BRAND.yellow }}
          />
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: `${BRAND.white}90` }}
          >
            {sector}
          </span>
        </div>
      </div>

      {/* Scrollable component list */}
      <div
        className="flex-1 overflow-y-auto p-2"
        style={{
          background: `linear-gradient(to bottom, ${BRAND.indigo}90, ${BRAND.indigo})`,
        }}
      >
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            categoryId={cat.id}
            categoryLabel={cat.label}
            components={groupedComponents[cat.id] || []}
            selectedTool={selectedTool}
            onSelectTool={handleSelectTool}
            onDragStart={handleDragStart}
            isExpanded={expandedCategories[cat.id]}
            onToggle={() => toggleCategory(cat.id)}
          />
        ))}

        {/* Empty state */}
        {totalCount === 0 && (
          <div
            className="flex flex-col items-center justify-center py-8 text-center"
            style={{ color: `${BRAND.white}50` }}
          >
            <svg
              className="w-10 h-10 mb-2 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <span className="text-xs">No components for this sector</span>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div
        className="flex-shrink-0 px-3 py-2"
        style={{
          background: `${BRAND.indigo}`,
          borderTop: `1px solid ${BRAND.blue}20`,
        }}
      >
        <p
          className="text-[10px] text-center"
          style={{ color: `${BRAND.white}50` }}
        >
          Click to select or drag to canvas
        </p>
      </div>
    </div>
  );
}
