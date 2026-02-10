"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layers,
  ArrowLeft,
  Sparkles,
  Upload,
  Type,
  Monitor,
  Smartphone,
  RotateCw,
  Download,
  Loader2,
  ImageIcon,
  FileText,
  CheckSquare,
  Square,
  Trash2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { DEVICE_PRESETS, generateLayerMetadata } from "@/lib/devicePresets";
import { useCredits } from "@/hooks/useCredits";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ParallaxDownloadDialog } from "@/components/parallax/ParallaxDownloadDialog";
import { GenerationProgress } from "@/components/parallax/GenerationProgress";

type GenerationMode = "text-file" | "text-to-layers" | "upload-split";
type Orientation = "portrait" | "landscape";

interface ParsedScene {
  name: string;
  description: string;
}

export default function ParallaxGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // State
  const [mode, setMode] = useState<GenerationMode>("text-file");
  const [selectedDevice, setSelectedDevice] = useState("iphone-standard");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [layerCount, setLayerCount] = useState(4);
  const [scenePrompt, setScenePrompt] = useState("");
  const [sceneName, setSceneName] = useState("My Scene");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSceneId, setGeneratedSceneId] = useState<Id<"parallaxScenes"> | null>(null);
  const [activeJobId, setActiveJobId] = useState<Id<"jobs"> | null>(null);
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);

  // Text file mode state
  const [uploadedTextFile, setUploadedTextFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedScenes, setParsedScenes] = useState<ParsedScene[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<Set<number>>(new Set());
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string>("");

  // Scene management state
  const [scenesToDelete, setScenesToDelete] = useState<Set<Id<"parallaxScenes">>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Download dialog state
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedSceneForDownload, setSelectedSceneForDownload] = useState<{
    id: Id<"parallaxScenes">;
    name: string;
  } | null>(null);

  // Style customization state
  const [selectedStyle, setSelectedStyle] = useState<"pixel-art" | "realistic" | "cartoon" | "watercolor" | "custom">("pixel-art");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);

  // Queries and mutations
  const { credits, isLoading: creditsLoading } = useCredits();
  const scenes = useQuery(api.parallaxScenes.listByProjectWithPreviews, {
    projectId: projectId as Id<"projects">,
  });
  const createScene = useMutation(api.parallaxScenes.create);
  const startParallaxGeneration = useAction(api.generate.startParallaxGeneration);
  const generateParallax = useAction(api.generate.parallaxGeneration);
  const generateParallaxFromImage = useAction(api.generate.parallaxFromImage);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const createTextDocument = useMutation(api.textDocuments.create);
  const parseTextToScenes = useAction(api.generate.parseTextToScenes);
  const batchParallaxGeneration = useAction(api.generate.batchParallaxGeneration);
  const deleteScene = useMutation(api.parallaxScenes.deleteScene);
  const deleteAllScenes = useMutation(api.parallaxScenes.deleteAllByProject);

  // Get current device dimensions
  const currentDevice = DEVICE_PRESETS.find((d) => d.id === selectedDevice);
  const deviceWidth =
    selectedDevice === "custom"
      ? customWidth
      : orientation === currentDevice?.orientation
      ? currentDevice?.width || 1920
      : currentDevice?.height || 1080;
  const deviceHeight =
    selectedDevice === "custom"
      ? customHeight
      : orientation === currentDevice?.orientation
      ? currentDevice?.height || 1080
      : currentDevice?.width || 1920;

  // Calculate credit cost
  const selectedSceneCount = mode === "text-file" ? selectedScenes.size : 1;
  const creditCost = mode === "upload-split" ? 1 : layerCount * selectedSceneCount;
  const hasEnoughCredits = credits >= creditCost;

  // Handle image file upload
  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedImage(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
  });

  // Handle text file upload
  const onTextFileDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedTextFile(acceptedFiles[0]);
      setParsedScenes([]);
      setSelectedScenes(new Set());
    }
  }, []);

  const { getRootProps: getTextRootProps, getInputProps: getTextInputProps, isDragActive: isTextDragActive } = useDropzone({
    onDrop: onTextFileDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  // Handle reference image upload for style matching
  const onReferenceImageDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setReferenceImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setReferenceImagePreview(previewUrl);
    }
  }, []);

  const { getRootProps: getReferenceRootProps, getInputProps: getReferenceInputProps, isDragActive: isReferenceDragActive } = useDropzone({
    onDrop: onReferenceImageDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
  });

  // Parse uploaded text file
  const handleParseTextFile = async () => {
    if (!uploadedTextFile) return;

    setIsParsing(true);
    try {
      // Upload the file to Convex storage
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": uploadedTextFile.type || "text/plain" },
        body: uploadedTextFile,
      });
      const { storageId } = await result.json();

      // Create text document record
      const textDocId = await createTextDocument({
        projectId: projectId as Id<"projects">,
        fileName: uploadedTextFile.name,
        fileId: storageId,
      });

      // Parse the text into scenes
      const scenes = await parseTextToScenes({
        textDocumentId: textDocId,
        fileStorageId: storageId,
      });

      setParsedScenes(scenes as ParsedScene[]);
      // Select all scenes by default
      setSelectedScenes(new Set((scenes as ParsedScene[]).map((_, i) => i)));
      toast.success(`Found ${(scenes as ParsedScene[]).length} scenes in your file`);
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to parse text file. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  // Toggle scene selection
  const toggleScene = (index: number) => {
    setSelectedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Select/deselect all scenes
  const toggleAllScenes = () => {
    if (selectedScenes.size === parsedScenes.length) {
      setSelectedScenes(new Set());
    } else {
      setSelectedScenes(new Set(parsedScenes.map((_, i) => i)));
    }
  };

  // Handle batch generation from text file
  const handleBatchGenerate = async () => {
    if (selectedScenes.size === 0) {
      toast.error("Please select at least one scene");
      return;
    }
    if (!hasEnoughCredits) {
      toast.error("Insufficient credits");
      return;
    }

    setIsBatchGenerating(true);
    setBatchProgress(`Generating ${selectedScenes.size} scenes...`);

    try {
      // Upload file again if needed (for the batch action)
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": uploadedTextFile!.type || "text/plain" },
        body: uploadedTextFile,
      });
      const { storageId } = await result.json();

      const textDocId = await createTextDocument({
        projectId: projectId as Id<"projects">,
        fileName: uploadedTextFile!.name,
        fileId: storageId,
      });

      const scenesToGenerate = parsedScenes.filter((_, i) => selectedScenes.has(i));

      const batchResult = await batchParallaxGeneration({
        textDocumentId: textDocId,
        projectId: projectId as Id<"projects">,
        scenes: scenesToGenerate,
        layerCount,
        deviceWidth,
        deviceHeight,
        orientation,
        artStyle: selectedStyle,
      });

      // Show detailed results
      if (batchResult.failedCount === 0) {
        toast.success(`✓ All ${batchResult.completedCount} scenes generated successfully!`);
      } else if (batchResult.completedCount > 0) {
        toast.success(
          `✓ ${batchResult.completedCount} scenes generated. ${batchResult.failedCount} failed.`,
          { duration: 5000 }
        );
      } else {
        toast.error("All scenes failed to generate. Please try again.");
      }

      // Show details of failed scenes if any
      if (batchResult.failedScenes && batchResult.failedScenes.length > 0) {
        console.error("Failed scenes:", batchResult.failedScenes);
      }

      setBatchProgress("");
    } catch (error) {
      console.error("Batch generation error:", error);
      toast.error("Batch generation failed. Please try again.");
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // Handle single scene generation
  const handleGenerate = async () => {
    if (mode === "text-to-layers" && !scenePrompt.trim()) {
      toast.error("Please enter a scene description");
      return;
    }
    if (mode === "upload-split" && !uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }
    if (!hasEnoughCredits) {
      toast.error("Insufficient credits");
      return;
    }

    setIsGenerating(true);

    try {
      // Create scene record
      const sceneId = await createScene({
        projectId: projectId as Id<"projects">,
        name: sceneName || "Untitled Scene",
        layerCount,
        scenePrompt: mode === "text-to-layers" ? scenePrompt : undefined,
      });

      setGeneratedSceneId(sceneId);

      if (mode === "text-to-layers") {
        // Non-blocking: returns immediately with jobId, generation runs in background
        const { jobId } = await startParallaxGeneration({
          sceneId,
          layerCount,
          scenePrompt,
          artStyle: selectedStyle,
          deviceWidth,
          deviceHeight,
        });
        setActiveJobId(jobId as Id<"jobs">);
        // Don't set isGenerating=false here - the progress component handles that
      } else {
        // Image-based generation (still blocking for now - upload needs to complete first)
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": uploadedImage!.type },
          body: uploadedImage,
        });
        const { storageId } = await result.json();

        await generateParallaxFromImage({
          sceneId,
          imageStorageId: storageId,
          layerCount,
          deviceWidth,
          deviceHeight,
        });
        toast.success("Parallax layers generated from your image!");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate parallax scene. Please try again.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-4 md:py-8 px-2 md:px-4">
      <Button
        variant="ghost"
        onClick={() => router.push(`/project/${projectId}`)}
        size="sm"
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Project
      </Button>

      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <div className="bg-sky/10 p-2.5 md:p-3 rounded-xl">
          <Layers className="h-6 w-6 md:h-8 md:w-8 text-sky" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Parallax Scene Generator</h1>
          <p className="text-sm text-muted-foreground">
            Create layered backgrounds with depth and motion
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generation Mode */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Generation Mode</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={mode} onValueChange={(v) => setMode(v as GenerationMode)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text-file" className="gap-1.5 text-xs md:text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Text File</span>
                  </TabsTrigger>
                  <TabsTrigger value="text-to-layers" className="gap-1.5 text-xs md:text-sm">
                    <Type className="h-4 w-4" />
                    <span className="hidden sm:inline">Single Scene</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload-split" className="gap-1.5 text-xs md:text-sm">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload & Split</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text-file" className="mt-4 space-y-4">
                  {/* Text file dropzone */}
                  <div
                    {...getTextRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      isTextDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input {...getTextInputProps()} />
                    {uploadedTextFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-green-500" />
                        <p className="font-medium">{uploadedTextFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <p className="font-medium">
                          {isTextDragActive
                            ? "Drop your text file here"
                            : "Drag & drop a text file or click to browse"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          .txt, .md, or .json — AI will parse your content into scenes
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Parse button */}
                  {uploadedTextFile && parsedScenes.length === 0 && (
                    <Button
                      onClick={handleParseTextFile}
                      disabled={isParsing}
                      className="w-full"
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Parsing scenes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Parse into Scenes
                        </>
                      )}
                    </Button>
                  )}

                  {/* Parsed scenes review */}
                  {parsedScenes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Parsed Scenes ({selectedScenes.size}/{parsedScenes.length} selected)
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleAllScenes}
                          className="text-xs"
                        >
                          {selectedScenes.size === parsedScenes.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {parsedScenes.map((scene, index) => (
                          <div
                            key={index}
                            onClick={() => toggleScene(index)}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                              selectedScenes.has(index)
                                ? "border-primary/50 bg-primary/5"
                                : "border-border hover:border-primary/30"
                            )}
                          >
                            <div className="mt-0.5">
                              {selectedScenes.has(index) ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{scene.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {scene.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="text-to-layers" className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="sceneName">Scene Name</Label>
                    <Input
                      id="sceneName"
                      value={sceneName}
                      onChange={(e) => setSceneName(e.target.value)}
                      placeholder="Enter a name for your scene"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prompt">Scene Description</Label>
                    <Textarea
                      id="prompt"
                      value={scenePrompt}
                      onChange={(e) => setScenePrompt(e.target.value)}
                      placeholder="Describe your parallax scene... e.g., 'A mystical forest at sunset with ancient trees, floating particles, and a winding path'"
                      className="mt-2 min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Each layer will be generated based on your description with appropriate depth
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="upload-split" className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="sceneNameUpload">Scene Name</Label>
                    <Input
                      id="sceneNameUpload"
                      value={sceneName}
                      onChange={(e) => setSceneName(e.target.value)}
                      placeholder="Enter a name for your scene"
                      className="mt-2"
                    />
                  </div>
                  <div
                    {...getImageRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      isImageDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input {...getImageInputProps()} />
                    {uploadedImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-12 w-12 text-green-500" />
                        <p className="font-medium">{uploadedImage.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <p className="font-medium">
                          {isImageDragActive
                            ? "Drop your image here"
                            : "Drag & drop an image or click to browse"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, or WebP - The image will be split into depth layers
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Output Settings */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Output Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Target Device</Label>
                  <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVICE_PRESETS.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          <div className="flex items-center gap-2">
                            {device.orientation === "portrait" ? (
                              <Smartphone className="h-4 w-4" />
                            ) : (
                              <Monitor className="h-4 w-4" />
                            )}
                            {device.label}
                            {device.id !== "custom" && (
                              <span className="text-xs text-muted-foreground">
                                ({device.width}×{device.height})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Orientation</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={orientation === "portrait" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrientation("portrait")}
                      className="flex-1 gap-2"
                    >
                      <Smartphone className="h-4 w-4" />
                      Portrait
                    </Button>
                    <Button
                      variant={orientation === "landscape" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrientation("landscape")}
                      className="flex-1 gap-2"
                    >
                      <RotateCw className="h-4 w-4" />
                      Landscape
                    </Button>
                  </div>
                </div>
              </div>

              {selectedDevice === "custom" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="customWidth">Width (px)</Label>
                    <Input
                      id="customWidth"
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 1920)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customHeight">Height (px)</Label>
                    <Input
                      id="customHeight"
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 1080)}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Output: {deviceWidth} × {deviceHeight} pixels
              </div>

              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">Art Style</Label>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button
                    variant={selectedStyle === "pixel-art" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStyle("pixel-art")}
                    className="justify-start"
                  >
                    Pixel Art
                  </Button>
                  <Button
                    variant={selectedStyle === "realistic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStyle("realistic")}
                    className="justify-start"
                  >
                    Realistic
                  </Button>
                  <Button
                    variant={selectedStyle === "cartoon" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStyle("cartoon")}
                    className="justify-start"
                  >
                    Cartoon
                  </Button>
                  <Button
                    variant={selectedStyle === "watercolor" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStyle("watercolor")}
                    className="justify-start"
                  >
                    Watercolor
                  </Button>
                  <Button
                    variant={selectedStyle === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStyle("custom")}
                    className="col-span-2 justify-start"
                  >
                    Custom Reference
                  </Button>
                </div>

                {selectedStyle === "custom" && (
                  <div className="mt-3">
                    <div
                      {...getReferenceRootProps()}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                        isReferenceDragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <input {...getReferenceInputProps()} />
                      {referenceImagePreview ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={referenceImagePreview}
                            alt="Reference"
                            className="h-20 w-20 object-cover rounded"
                          />
                          <p className="text-xs text-muted-foreground">
                            Click or drag to replace
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-xs font-medium">
                            {isReferenceDragActive
                              ? "Drop reference image"
                              : "Upload style reference"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            AI will match this style
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">Number of Layers</Label>
                <div className="flex items-center gap-4 mt-3">
                  <Slider
                    value={[layerCount]}
                    onValueChange={([value]) => setLayerCount(value)}
                    min={3}
                    max={8}
                    step={1}
                    className="flex-1"
                  />
                  <span className="font-mono text-lg w-8 text-center">{layerCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {generateLayerMetadata(layerCount, deviceWidth, deviceHeight, orientation).map(
                  (layer) => (
                    <div
                      key={layer.index}
                      className="p-2 rounded bg-muted/50 text-center"
                    >
                      <div className="font-medium capitalize">{layer.name}</div>
                      <div className="text-muted-foreground">
                        {layer.scrollDuration === 0
                          ? "Static"
                          : `${(layer.scrollDuration / 1000).toFixed(1)}s`}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Generate Panel */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-medium">
                    {mode === "text-file"
                      ? "Text File"
                      : mode === "text-to-layers"
                      ? "Single Scene"
                      : "Upload & Split"}
                  </span>
                </div>
                {mode === "text-file" && parsedScenes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scenes:</span>
                    <span className="font-medium">
                      {selectedScenes.size} of {parsedScenes.length}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layers:</span>
                  <span className="font-medium">{layerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device:</span>
                  <span className="font-medium">
                    {currentDevice?.label || "Custom"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium">
                    {deviceWidth}×{deviceHeight}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Credit Cost:</span>
                  <Badge variant="secondary" className="font-mono">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {creditCost} credits
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span
                    className={cn(
                      "font-medium",
                      hasEnoughCredits ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {creditsLoading ? "..." : credits} credits
                  </span>
                </div>
              </div>

              {mode === "text-file" ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBatchGenerate}
                  disabled={
                    isBatchGenerating ||
                    !hasEnoughCredits ||
                    creditsLoading ||
                    selectedScenes.size === 0
                  }
                >
                  {isBatchGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {batchProgress || "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate {selectedScenes.size} Scene{selectedScenes.size !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    !hasEnoughCredits ||
                    creditsLoading ||
                    (mode === "text-to-layers" && !scenePrompt.trim()) ||
                    (mode === "upload-split" && !uploadedImage)
                  }
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Scene
                    </>
                  )}
                </Button>
              )}

              {!hasEnoughCredits && (
                <p className="text-xs text-red-500 text-center">
                  You need {creditCost - credits} more credits
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generation Progress */}
      {activeJobId && (
        <div className="mt-6">
          <GenerationProgress
            jobId={activeJobId}
            layerCount={layerCount}
            onComplete={() => {
              toast.success("Parallax scene generated successfully!");
              setActiveJobId(null);
              setIsGenerating(false);
            }}
            onError={(error) => {
              toast.error(`Generation failed: ${error}`);
              setActiveJobId(null);
              setIsGenerating(false);
            }}
            onCancel={() => {
              toast("Generation cancelled. Credits refunded.");
              setActiveJobId(null);
              setIsGenerating(false);
            }}
            onRetry={() => {
              setActiveJobId(null);
              setIsGenerating(false);
              // Re-trigger generation with same settings
              handleGenerate();
            }}
          />
        </div>
      )}

      {/* Existing Scenes - Full Width */}
      {scenes && scenes.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Your Scenes ({scenes.length})
              </CardTitle>
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
                    className="text-xs gap-1.5"
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
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                )}
                {scenesToDelete.size === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setScenesToDelete(
                        new Set(scenes.map((s) => s._id))
                      )
                    }
                    className="text-xs text-muted-foreground"
                  >
                    Select All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scenes.map((scene) => (
                <div
                  key={scene._id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded transition-colors",
                    scenesToDelete.has(scene._id)
                      ? "bg-red-500/10 border border-red-500/30"
                      : "bg-muted/50"
                  )}
                >
                  {/* Selection checkbox */}
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

                  {/* Preview thumbnail */}
                  <div className="h-10 w-16 rounded bg-muted/80 flex items-center justify-center overflow-hidden shrink-0">
                    {scene.previewUrl ? (
                      <img
                        src={scene.previewUrl}
                        alt={scene.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : scene.status === "pending" || scene.status === "processing" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Layers className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{scene.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {scene.layerCount} layers
                      {scene.status === "processing" && " · Generating..."}
                      {scene.status === "pending" && " · Queued"}
                      {scene.status === "completed" && " · Complete"}
                      {scene.status === "failed" && " · Failed"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {scene.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-red-500"
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
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
