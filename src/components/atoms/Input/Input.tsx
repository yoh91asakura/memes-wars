import React, { useState, useId } from 'react';
import { InputProps } from '../../types';
import './Input.css';

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  error,
  onChange,
  onBlur,
  onFocus,
  className = '',
  testId,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const id = useId();
  
  const inputValue = value !== undefined ? value : internalValue;
  const hasError = Boolean(error);
  const hasValue = Boolean(inputValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const inputClassName = [
    'input',
    hasError && 'input--error',
    disabled && 'input--disabled',
    isFocused && 'input--focused',
    hasValue && 'input--has-value',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      <div className="input-container">
        <input
          id={id}
          type={type}
          className={inputClassName}
          placeholder={placeholder}
          value={inputValue}
          disabled={disabled}
          required={required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid={testId}
          autoComplete={type === 'password' ? 'current-password' : undefined}
        />
        {placeholder && (
          <label 
            htmlFor={id} 
            className={`input-label ${isFocused || hasValue ? 'input-label--active' : ''}`}
          >
            {placeholder}
            {required && <span className="input-label--required">*</span>}
          </label>
        )}
      </div>
      {error && (
        <div className="input-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
