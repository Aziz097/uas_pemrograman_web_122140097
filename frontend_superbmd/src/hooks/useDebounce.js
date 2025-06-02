import { useState, useEffect } from 'react';

// Custom hook for debouncing a value
export function useDebounce(value, delay) {
    // State to store debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Update debounced value after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancel the timeout if value changes (also on unmount)
        // This is how we prevent the value from being updated too frequently
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Only re-call effect if value or delay changes

    return debouncedValue;
}