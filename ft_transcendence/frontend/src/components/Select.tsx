import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";

export type SelectOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  options?: SelectOption[];
  error?: ReactNode;
  helperText?: ReactNode;
  placeholder?: string;
  containerClassName?: string;
  children?: ReactNode;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      placeholder,
      className = "",
      containerClassName = "",
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (typeof label === "string" ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const hasError = Boolean(error);

    return (
      <div className={`field-wrapper ${containerClassName}`.trim()}>
        {label && (
          <label htmlFor={selectId} className="field-label">
            {label}
          </label>
        )}
        <div className="field-input-container">
          <select
            ref={ref}
            id={selectId}
            className={`field-input ${hasError ? "has-error" : ""} ${className}`.trim()}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        </div>
        {hasError ? (
          <p id={`${selectId}-error`} className="field-error" role="alert">
            {error}
          </p>
        ) : (
          helperText && (
            <p id={`${selectId}-helper`} className="field-helper">
              {helperText}
            </p>
          )
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
