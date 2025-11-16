import React from 'react';
import { Loader2, Leaf } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-50 via-green-50 to-amber-50 dark:from-slate-900 dark:via-green-950 dark:to-amber-950 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <Leaf className="w-16 h-16 text-primary animate-pulse" />
          <Loader2 className="w-16 h-16 text-primary animate-spin absolute inset-0" strokeWidth={1} />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Loading Garden</h2>
        <p className="text-muted-foreground">Preparing your 3D environment...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;