import React from 'react';
import { Skeleton } from '../ui/skeleton';

export const ActivityListSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        ))}
    </div>
);
