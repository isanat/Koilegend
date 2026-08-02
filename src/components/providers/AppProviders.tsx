'use client';

import React from 'react';
import { Web3GameStateProvider } from '@/context/Web3GameStateContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <Web3GameStateProvider>{children}</Web3GameStateProvider>;
}
