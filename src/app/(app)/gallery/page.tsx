"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Heart, Share2 } from "lucide-react";

export default function GalleryPage() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        {/* Icon */}
        <div className="relative">
          <div className="bg-moss/10 p-8 rounded-2xl">
            <Users className="h-16 w-16 text-moss" />
          </div>
          <div className="absolute -top-2 -right-2 bg-ember/10 p-2 rounded-full animate-bounce">
            <Sparkles className="h-6 w-6 text-ember" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Community Gallery</h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Coming in Phase 3
          </p>
        </div>

        {/* Description */}
        <Card className="max-w-2xl border-border/60">
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              The community gallery is currently in development. Soon you'll be able to share your
              scenes with the ParallaxForge community and discover amazing creations from other
              developers.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 text-sm mt-6">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Share2 className="h-5 w-5 text-sky" />
                <span className="font-medium">Share Creations</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Heart className="h-5 w-5 text-ember" />
                <span className="font-medium">Like & Favorite</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Users className="h-5 w-5 text-moss" />
                <span className="font-medium">Follow Creators</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Badge */}
        <Badge variant="outline" className="text-sm">
          Phase 3 • Community Features
        </Badge>
      </div>
    </div>
  );
}
