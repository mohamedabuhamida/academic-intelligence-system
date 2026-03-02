import { useState, useEffect } from 'react';
import { AIStatus, AIStatusData } from '@/types';

export function useAIStatus() {
  const [status, setStatus] = useState<AIStatus>('online');
  const [tokensUsed, setTokensUsed] = useState(12450);
  const [tokensLimit] = useState(50000);
  const [model] = useState('GPT-4 Academic');

  useEffect(() => {
    // Simulate AI processing states
    const interval = setInterval(() => {
      const random = Math.random();
      if (random < 0.7) {
        setStatus('online');
      } else if (random < 0.9) {
        setStatus('processing');
      } else {
        setStatus('idle');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { status, tokensUsed, tokensLimit, model };
}