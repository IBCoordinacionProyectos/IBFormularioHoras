import React from 'react';
import { Skeleton } from '../../ui/skeleton';
import { Card, CardContent, CardHeader } from '../../ui/card';

export const ActivityListSkeleton: React.FC = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start justify-between rounded-lg border p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
