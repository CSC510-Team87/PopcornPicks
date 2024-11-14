// src/test-utils.tsx
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { NextUIProvider } from "@nextui-org/react";

// Create interface for wrapper props
interface WrapperProps {
  children: React.ReactNode;
}

// Set up providers
function Wrapper({ children }: WrapperProps) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
}

// Custom render method
function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { render };