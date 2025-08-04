'use client';
import React, { useState, useEffect } from 'react';

interface CounterProps {
  end: number | string;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

const Counter: React.FC<CounterProps> = ({ 
  end, 
  duration = 2000, 
  className = '',
  suffix = '',
  prefix = ''
}) => {
  const [count, setCount] = useState(0);
  const isPercentage = typeof end === 'string' && end.endsWith('%');
  const numericValue = isPercentage ? parseFloat(end) : Number(end);
  
  useEffect(() => {
    if (isNaN(numericValue)) return;
    
    // Calculate increment step based on duration (60fps)
    const frames = (duration / 1000) * 60;
    const increment = numericValue / frames;
    
    let currentCount = 0;
    const timer = setInterval(() => {
      currentCount += increment;
      
      if (currentCount >= numericValue) {
        const finalValue = isPercentage ? Math.round(numericValue) : Math.round(numericValue * 100) / 100;
        setCount(finalValue);
        clearInterval(timer);
      } else {
        const displayValue = isPercentage ? Math.round(currentCount) : Math.round(currentCount * 100) / 100;
        setCount(displayValue);
      }
    }, 1000 / 60); // 60fps
    
    return () => clearInterval(timer);
  }, [numericValue, duration, isPercentage]);
  
  // Format the displayed value
  const displayValue = isPercentage 
    ? `${count.toFixed(0)}%` 
    : count.toLocaleString() + (suffix || '');
  
  return (
    <span className={className}>
      {prefix}{displayValue}
    </span>
  );
};

export default Counter;
