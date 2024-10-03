import { useState } from "react";
import { FieldError } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  placeholder?: string; // Optional placeholder
  fullWidth?: boolean;   // Optional width
  textarea?: boolean;    // Optional prop to render a textarea
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
  placeholder,
  fullWidth = false, // Default to false
  textarea = false,   // Default to false
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div
      className={hidden ? "hidden" : `flex flex-col gap-2 ${fullWidth ? "w-[100%]" : "w-full md:w-[48.5%]"}`}
    >
      <label className="text-xs text-gray-500">{label}</label>
      <div className="relative w-full">
        {textarea ? (
          <textarea
            {...register(name)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            defaultValue={defaultValue}
            placeholder={placeholder} // Optional placeholder
            {...inputProps} // Spread additional props
          />
        ) : (
          <input
            type={inputType}
            {...register(name)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full pr-10"
            {...inputProps}
            defaultValue={defaultValue}
            placeholder={placeholder} // Optional placeholder
          />
        )}
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-600"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
