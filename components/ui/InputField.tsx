"use client";

import { InputFieldProps } from "@/lib/types";

export function InputField({
  id,
  name,
  type = "text",
  label,
  value,
  placeholder,
  error,
  icon,
  onChange,
}: InputFieldProps) {
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
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 rounded-lg transition-colors focus:outline-none`}
          style={{
            backgroundColor: "rgba(5, 40, 80, 0.8)",
            border: error ? "1px solid #ef4444" : "1px solid rgba(250, 228, 82, 0.3)",
            color: "#f0f8ff",
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default InputField;
