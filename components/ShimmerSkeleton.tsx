import React from 'react';

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col">
      {/* Flash / Shimmer Image placeholder */}
      <div className="w-full h-52 shimmer"></div>
      
      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="h-4 w-28 rounded-md shimmer"></div>
          <div className="h-6 w-4/5 rounded-md shimmer"></div>
          <div className="h-4 w-3/5 rounded-md shimmer"></div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-7 w-32 rounded-md shimmer"></div>
          <div className="h-9 w-24 rounded-lg shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <PropertyCardSkeleton key={idx} />
      ))}
    </div>
  );
}
