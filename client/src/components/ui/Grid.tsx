import React, { forwardRef } from 'react';
import MuiGrid, { GridProps as MuiGridProps } from '@mui/material/Grid';

/**
 * Grid wrapper component that provides proper TypeScript types for the MUI Grid component
 * Includes support for responsive breakpoints (xs, sm, md, lg, xl)
 */

// Extend MUI Grid props with our custom props
type ResponsiveProp = boolean | 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type GridProps = Omit<MuiGridProps, 'item'> & {
  item?: boolean;
  // Responsive breakpoint props
  xs?: ResponsiveProp;
  sm?: ResponsiveProp;
  md?: ResponsiveProp;
  lg?: ResponsiveProp;
  xl?: ResponsiveProp;
  // Add any additional custom props here
};

// Create a generic Grid component with proper TypeScript types
const Grid = forwardRef<HTMLDivElement, GridProps>((props, ref) => {
  // All props are passed through to MUI Grid
  return <MuiGrid ref={ref} {...props} />;
});

// Set display name for better debugging in React DevTools
Grid.displayName = 'Grid';

// Add display name for the component to help with debugging
const GridWithDisplayName = Object.assign(Grid, { displayName: 'Grid' });

export default GridWithDisplayName;
