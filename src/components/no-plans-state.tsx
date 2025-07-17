
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";

export const NoPlansState = () => (
    <Card className="text-center py-12">
        <CardHeader>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">No Plans Found</CardTitle>
            <CardDescription>You haven&apos;t generated any supplement plans yet.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild>
                <Link href="/advisor">Get Your First AI Recommendation</Link>
            </Button>
        </CardContent>
    </Card>
);
