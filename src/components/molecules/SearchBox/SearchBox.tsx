import React, { useState, useEffect } from 'react';
import { Input } from '../../atoms/Input';
import { Icon } from '../../atoms/Icon';
import { Button } from '../../atoms/Button';
import './SearchBox.css';

interface SearchBoxProps {
  placeholder?: string;
  value?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  showClearButton?: boolean;
  className?: string;
  testId?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = 'Search cards...',
  value = '',
  onSearch,
  onClear,
  debounceMs = 300,
  showClearButton = true,
  className = '',
  testId,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(newValue);
      }
    }, debounceMs);

    setDebounceTimer(timer);
  };

  const handleClear = () => {
    setInternalValue('');
    
    // Clear debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Immediately trigger search with empty value
    if (onSearch) {
      onSearch('');
    }
    
    if (onClear) {
      onClear();
    }
  };

  const hasValue = internalValue.length > 0;

  return (
    <div className={`search-box ${className}`.trim()} data-testid={testId}>
      <div className="search-box__input-wrapper">
        <div className="search-box__icon">
          <Icon name="search" size="sm" color="muted" />
        </div>
        
        <Input
          type="search"
          placeholder={placeholder}
          value={internalValue}
          onChange={handleInputChange}
          className="search-box__input"
        />
        
        {hasValue && showClearButton && (
          <div className="search-box__clear">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="search-box__clear-btn"
              testId={`${testId}-clear`}
            >
              <Icon name="close" size="sm" color="muted" />
            </Button>
          </div>
        )}
      </div>
      
      {hasValue && (
        <div className="search-box__results-count" role="status" aria-live="polite">
          <Icon name="search" size="xs" color="muted" />
          <span>Searching for &quot;{internalValue}&quot;</span>
        </div>
      )}
    </div>
  );
};
