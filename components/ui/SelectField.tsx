"use client";

import { SelectFieldProps } from "@/lib/types";
import { ChevronDownIcon } from "@/components/icons";

export function SelectField({
  id,
  name,
  label,
  value,
  placeholder,
  options,
  error,
  icon,
  onChange,
}: SelectFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-2"
        style={{ color: "#b8dff7" }}
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#FAE452" }}>
          {icon}
        </span>
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-10 py-3 rounded-lg transition-colors appearance-none cursor-pointer focus:outline-none"
          style={{
            backgroundColor: "rgba(5, 40, 80, 0.8)",
            border: error ? "1px solid #ef4444" : "1px solid rgba(250, 228, 82, 0.3)",
            color: "#f0f8ff",
          }}
        >
          <option value="" style={{ backgroundColor: "#0a4d8c", color: "#b8dff7" }}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} style={{ backgroundColor: "#0a4d8c", color: "#f0f8ff" }}>
              {option}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#FAE452" }}>
          <ChevronDownIcon />
        </span>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default SelectField;
