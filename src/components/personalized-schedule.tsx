
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PersonalizedScheduleProps = {
  name: string;
  scheduleText: string;
};

export const PersonalizedSchedule = ({ name, scheduleText }: PersonalizedScheduleProps) => {
  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="text-xl font-bold font-headline">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-muted-foreground whitespace-pre-wrap">
          {scheduleText}
        </div>
      </CardContent>
    </Card>
  );
};
