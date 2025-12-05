"use client";

import React, { useState, useEffect, ComponentType } from 'react';

/**
 * Client-only wrapper that prevents a component from rendering until after mount
 * This ensures the component and its dependencies are only evaluated on the client
 */
export function ClientOnly<T extends object>({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

