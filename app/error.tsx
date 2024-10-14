// app/error.tsx

'use client';

import { useEffect } from 'react';
import ErrorDisplay from '@/components/ErrorDisplay';

export default function Error({
  error,
}: {
  error: Error;
}) {
  useEffect(() => {
    console.error('An error occurred:', error);
  }, [error]);

  return (
    <div>
      <ErrorDisplay message="Something went wrong!" />
    </div>
  );
}