import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  error?: ReactNode;
  helperText?: ReactNode;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  containerClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (typeof label === "string" ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const hasError = Boolean(error);

    return (
      <div className={`field-wrapper ${containerClassName}`.trim()}>
        {label && (
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
        )}
        <div className="field-input-container">
          {prefixIcon && <span className="field-input-icon">{prefixIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`field-input ${prefixIcon ? "has-prefix" : ""} ${
              suffixIcon ? "has-suffix" : ""
            } ${hasError ? "has-error" : ""} ${className}`.trim()}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          {suffixIcon && <span className="field-input-icon suffix">{suffixIcon}</span>}
        </div>
        {hasError ? (
          <p id={`${inputId}-error`} className="field-error" role="alert">
            {error}
          </p>
        ) : (
          helperText && (
            <p id={`${inputId}-helper`} className="field-helper">
              {helperText}
            </p>
          )
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
