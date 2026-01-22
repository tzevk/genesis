"use client";

import { useState } from "react";
import { EDUCATION_LEVELS } from "@/lib/constants";
import { validateLoginForm, saveUserData } from "@/lib/utils";
import { FormErrors } from "@/lib/types";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";
import { SubmitButton } from "@/components/ui/NeonButton";
import { UserIcon, PhoneIcon, EducationIcon, ArrowRightIcon } from "@/components/icons";

interface LoginFormProps {
  onStartSimulation?: () => void;
}

export function LoginForm({ onStartSimulation }: LoginFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    educationLevel: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    saveUserData(formData);

    // Trigger simulation launch transition
    if (onStartSimulation) {
      onStartSimulation();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div 
      className="rounded-lg p-8 backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(10, 77, 140, 0.8)",
        border: "1px solid rgba(250, 228, 82, 0.3)",
        boxShadow: "0 0 30px rgba(250, 228, 82, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.2)"
      }}
    >
      <h2 className="text-xl font-semibold mb-1" style={{ color: "#f0f8ff" }}>
        Welcome
      </h2>
      <p className="text-blue-200 mb-6 text-sm opacity-70">
        Enter your details to begin
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="name"
          name="name"
          label="Full Name"
          value={formData.name}
          placeholder="Enter your full name"
          error={errors.name}
          icon={<UserIcon />}
          onChange={handleChange}
        />

        <InputField
          id="phone"
          name="phone"
          type="tel"
          label="Phone Number"
          value={formData.phone}
          placeholder="Enter your phone number"
          error={errors.phone}
          icon={<PhoneIcon />}
          onChange={handleChange}
        />

        <SelectField
          id="educationLevel"
          name="educationLevel"
          label="Education Level"
          value={formData.educationLevel}
          placeholder="Select your education level"
          options={[...EDUCATION_LEVELS]}
          error={errors.educationLevel}
          icon={<EducationIcon />}
          onChange={handleChange}
        />

        <SubmitButton isLoading={isLoading} loadingText="Launching...">
          <span>Start Simulation</span>
          <ArrowRightIcon />
        </SubmitButton>
      </form>
    </div>
  );
}

export default LoginForm;
