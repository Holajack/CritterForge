"use client";

import { useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Save, User } from "lucide-react";
import { GAME_VIEWS, STYLE_PACKS, FRAME_SIZES } from "@/lib/constants";
import { toast } from "sonner";

export default function SettingsPage() {
  const [defaultGameView, setDefaultGameView] = useState<string>("side-scroller");
  const [defaultStylePack, setDefaultStylePack] = useState<string>("cozy");
  const [defaultFrameSize, setDefaultFrameSize] = useState<string>("128");

  const handleSaveDefaults = () => {
    toast.success("Default settings saved");
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-7 w-7 text-forge" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account Management */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          Account
        </h2>
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <UserProfile
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "border-0 shadow-none",
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Default Project Settings */}
      <div>
        <h2 className="text-xl font-bold mb-4">Default Project Settings</h2>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">New Project Defaults</CardTitle>
            <CardDescription>
              These settings will be pre-selected when creating new projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game View */}
            <div className="space-y-2">
              <Label htmlFor="default-game-view" className="text-sm text-muted-foreground">
                Game View
              </Label>
              <Select value={defaultGameView} onValueChange={setDefaultGameView}>
                <SelectTrigger id="default-game-view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GAME_VIEWS.map((view) => (
                    <SelectItem key={view.id} value={view.id}>
                      {view.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style Pack */}
            <div className="space-y-2">
              <Label htmlFor="default-style-pack" className="text-sm text-muted-foreground">
                Style Pack
              </Label>
              <Select value={defaultStylePack} onValueChange={setDefaultStylePack}>
                <SelectTrigger id="default-style-pack">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_PACKS.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pack.color }}
                        />
                        {pack.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Frame Size */}
            <div className="space-y-2">
              <Label htmlFor="default-frame-size" className="text-sm text-muted-foreground">
                Frame Size
              </Label>
              <Select value={defaultFrameSize} onValueChange={setDefaultFrameSize}>
                <SelectTrigger id="default-frame-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRAME_SIZES.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      <span className="font-mono">{size.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveDefaults} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Defaults
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
