"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ArrowLeft, Layers, Download, Sparkles, Loader2, Trash2, CheckSquare, Square, AlertCircle, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ParallaxDownloadDialog } from "@/components/parallax/ParallaxDownloadDialog";
import { GenerationProgress } from "@/components/parallax/GenerationProgress";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.get, { id: projectId });
  const scenes = useQuery(api.parallaxScenes.listByProjectWithPreviews, { projectId });
  const deleteScene = useMutation(api.parallaxScenes.deleteScene);
  const retryScene = useAction(api.generate.retryScene);

  const [scenesToDelete, setScenesToDelete] = useState<Set<Id<"parallaxScenes">>>(new Set());
  const [retryingScenes, setRetryingScenes] = useState<Set<Id<"parallaxScenes">>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedSceneForDownload, setSelectedSceneForDownload] = useState<{
    id: Id<"parallaxScenes">;
    name: string;
  } | null>(null);

  if (project === undefined || scenes === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This project does not exist or you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-4 md:py-8 px-2 md:px-4 space-y-6 md:space-y-8">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} size="sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      {/* Project Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
          <Link href={`/project/${projectId}/parallax`}>
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              New Scene
            </Button>
          </Link>
        </div>
      </div>

      {/* Parallax Scenes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Parallax Scenes</h2>
            <p className="text-sm text-muted-foreground">
              {scenes.length} {scenes.length === 1 ? "scene" : "scenes"}
            </p>
          </div>
          {scenes.length > 0 && (
            <div className="flex items-center gap-2">
              {scenesToDelete.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await Promise.all(
                        Array.from(scenesToDelete).map((id) =>
                          deleteScene({ id })
                        )
                      );
                      toast.success(
                        `Deleted ${scenesToDelete.size} scene${scenesToDelete.size !== 1 ? "s" : ""}`
                      );
                      setScenesToDelete(new Set());
                    } catch (error) {
                      console.error("Delete error:", error);
                      toast.error("Failed to delete some scenes");
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="gap-1.5"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete Selected ({scenesToDelete.size})
                </Button>
              )}
              {scenesToDelete.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScenesToDelete(new Set())}
                >
                  Cancel
                </Button>
              )}
              {scenesToDelete.size === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setScenesToDelete(new Set(scenes.map((s) => s._id)))
                  }
                  className="text-muted-foreground"
                >
                  Select All
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Show progress for any in-progress scenes */}
        {scenes.filter((s) => (s.status === "pending" || s.status === "processing") && s.jobId).length > 0 && (
          <div className="space-y-3 mb-4">
            {scenes
              .filter((s) => (s.status === "pending" || s.status === "processing") && s.jobId)
              .map((scene) => (
                <div key={`progress-${scene._id}`}>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">{scene.name}</p>
                  <GenerationProgress
                    jobId={scene.jobId!}
                    layerCount={scene.layerCount}
                  />
                </div>
              ))}
          </div>
        )}

        {scenes.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No scenes yet"
            description="Create your first parallax scene by uploading a text file or describing a scene"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene) => (
              <Card
                key={scene._id}
                className={cn(
                  "border-border/60 transition-all hover:shadow-md h-full",
                  scenesToDelete.has(scene._id)
                    ? "border-red-500/50 bg-red-500/5"
                    : "hover:border-primary/50"
                )}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      className="shrink-0"
                      onClick={() => {
                        setScenesToDelete((prev) => {
                          const next = new Set(prev);
                          if (next.has(scene._id)) {
                            next.delete(scene._id);
                          } else {
                            next.add(scene._id);
                          }
                          return next;
                        });
                      }}
                    >
                      {scenesToDelete.has(scene._id) ? (
                        <CheckSquare className="h-4 w-4 text-red-500" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-red-500 h-7 w-7 p-0"
                      disabled={isDeleting}
                      onClick={async () => {
                        try {
                          await deleteScene({ id: scene._id });
                          toast.success(`Deleted "${scene.name}"`);
                          setScenesToDelete((prev) => {
                            const next = new Set(prev);
                            next.delete(scene._id);
                            return next;
                          });
                        } catch (error) {
                          console.error("Delete error:", error);
                          toast.error("Failed to delete scene");
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className={cn(
                    "aspect-video rounded-lg flex items-center justify-center overflow-hidden",
                    scene.status === "failed" ? "bg-red-500/10" : "bg-muted"
                  )}>
                    {scene.status === "completed" && scene.previewUrl ? (
                      <img
                        src={scene.previewUrl}
                        alt={scene.name}
                        className="w-full h-full object-cover"
                      />
                    ) : scene.status === "pending" || scene.status === "processing" ? (
                      <div className="flex flex-col items-center gap-1">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Generating...</span>
                      </div>
                    ) : scene.status === "failed" ? (
                      <div className="flex flex-col items-center gap-2 p-3 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <span className="text-xs text-red-500 font-medium">Generation Failed</span>
                        {scene.error && (
                          <p className="text-xs text-red-400/80 line-clamp-2">{scene.error}</p>
                        )}
                      </div>
                    ) : (
                      <Layers className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">{scene.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {scene.layerCount} layers
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        scene.status === "completed" ? "default"
                        : scene.status === "failed" ? "destructive"
                        : "secondary"
                      }
                      className="text-xs"
                    >
                      {scene.status}
                    </Badge>
                    {scene.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => {
                          setSelectedSceneForDownload({
                            id: scene._id,
                            name: scene.name,
                          });
                          setDownloadDialogOpen(true);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {scene.status === "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto gap-1.5 text-xs"
                        disabled={retryingScenes.has(scene._id)}
                        onClick={async () => {
                          setRetryingScenes((prev) => new Set(prev).add(scene._id));
                          try {
                            await retryScene({ sceneId: scene._id });
                            toast.success(`Retrying "${scene.name}"...`);
                          } catch (error) {
                            console.error("Retry error:", error);
                            toast.error("Failed to retry. Check your credits.");
                          } finally {
                            setRetryingScenes((prev) => {
                              const next = new Set(prev);
                              next.delete(scene._id);
                              return next;
                            });
                          }
                        }}
                      >
                        {retryingScenes.has(scene._id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCw className="h-3.5 w-3.5" />
                        )}
                        Retry
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Download Dialog */}
      <ParallaxDownloadDialog
        sceneId={selectedSceneForDownload?.id || null}
        sceneName={selectedSceneForDownload?.name || ""}
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
      />
    </div>
  );
}
