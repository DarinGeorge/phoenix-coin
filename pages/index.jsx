import React from 'react';
import {SolanaProvider} from '../context/solana';
import Home from './Home';

export default function index() {
  return (
    <SolanaProvider>
      <Home />
    </SolanaProvider>
  );
}
