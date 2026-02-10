"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/shared/AnimateIn";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Users, Layers } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function AssetsPage() {
  const scenes = useQuery(api.dashboard.listAllScenes, {});
  const characters = useQuery(api.dashboard.listAllCharacters, {});

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-6 py-6 md:py-10 space-y-6">
      <AnimateIn variant="fade-up">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Asset Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All your scenes and characters across every project.
          </p>
        </div>
      </AnimateIn>

      <AnimateIn variant="fade-up" delay={0.05}>
        <Tabs defaultValue="scenes">
          <TabsList>
            <TabsTrigger value="scenes" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Scenes
              {scenes && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">
                  {scenes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Characters
              {characters && (
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">
                  {characters.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenes" className="mt-4">
            {scenes === undefined ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : scenes.length === 0 ? (
              <EmptyState
                icon={Image}
                title="No scenes yet"
                description="Generate parallax scenes in your projects to see them here."
              />
            ) : (
              <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scenes.map((scene) => (
                  <StaggerItem key={scene._id}>
                    <Link
                      href={`/project/${scene.projectId}`}
                      className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
                    >
                      <div className="relative h-32 w-full bg-muted/30">
                        {scene.previewUrl ? (
                          <img
                            src={scene.previewUrl}
                            alt={scene.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Layers className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <h3 className="text-sm font-semibold line-clamp-1">
                          {scene.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {scene.projectName}
                          </Badge>
                          <StatusBadge status={scene.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{scene.layerCount} layers</span>
                          <span>
                            {formatDistanceToNow(scene._creationTime, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </TabsContent>

          <TabsContent value="characters" className="mt-4">
            {characters === undefined ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : characters.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No characters yet"
                description="Create characters in your projects to see them here."
              />
            ) : (
              <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {characters.map((char) => (
                  <StaggerItem key={char._id}>
                    <Link
                      href={`/project/${char.projectId}`}
                      className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
                    >
                      <div className="relative h-32 w-full bg-muted/30">
                        {char.thumbnailUrl ? (
                          <img
                            src={char.thumbnailUrl}
                            alt={char.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <h3 className="text-sm font-semibold line-clamp-1">
                          {char.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {char.projectName}
                          </Badge>
                          {char.animalType && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal capitalize"
                            >
                              {char.animalType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(char._creationTime, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </TabsContent>
        </Tabs>
      </AnimateIn>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    completed: { label: "Done", className: "bg-moss/15 text-moss border-moss/20" },
    processing: { label: "Processing", className: "bg-primary/15 text-primary border-primary/20" },
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
    failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/20" },
  };

  const c = config[status] ?? config.pending;
  return (
    <Badge variant="outline" className={`text-[10px] ${c.className}`}>
      {c.label}
    </Badge>
  );
}
