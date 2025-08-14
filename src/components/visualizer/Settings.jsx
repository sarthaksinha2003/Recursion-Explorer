import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Monitor, Moon, Sun, Download, Eye, Zap } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

const Settings = ({ 
  speed, 
  setSpeed, 
  viewMode, 
  setViewMode,
  autoPlay,
  setAutoPlay 
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const exportAsPNG = () => {
    if (window.exportTreeAsPNG) {
      window.exportTreeAsPNG();
    }
  };
  
  const exportAsSVG = () => {
    if (window.exportTreeAsSVG) {
      window.exportTreeAsSVG();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full h-10">
          <SettingsIcon className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings & Preferences</DialogTitle>
          <DialogDescription>
            Customize your visualization experience
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Execution Speed</CardTitle>
                <CardDescription>
                  Control how fast the visualization plays
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Speed: {speed}x</Label>
                    <span className="text-sm text-muted-foreground">
                      {speed <= 0.5 ? "Very Slow" : speed <= 1 ? "Slow" : speed <= 2 ? "Normal" : speed <= 4 ? "Fast" : "Very Fast"}
                    </span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                    min={0.25}
                    max={8}
                    step={0.25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.25x</span>
                    <span>8x</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">View Mode</CardTitle>
                <CardDescription>
                  Choose between tree view and stack-focused view
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={viewMode} onValueChange={(value) => setViewMode(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tree" id="tree" />
                    <Label htmlFor="tree" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Tree View (Default)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stack" id="stack" />
                    <Label htmlFor="stack" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Stack-Focused View
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Play</CardTitle>
                <CardDescription>
                  Automatically start visualization when code is run
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-play" 
                    checked={autoPlay}
                    onCheckedChange={setAutoPlay}
                  />
                  <Label htmlFor="auto-play">Start visualization automatically</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme</CardTitle>
                <CardDescription>
                  Choose your preferred color scheme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex flex-col gap-2 h-auto p-4"
                  >
                    <Sun className="h-6 w-6" />
                    <span>Light</span>
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex flex-col gap-2 h-auto p-4"
                  >
                    <Moon className="h-6 w-6" />
                    <span>Dark</span>
                  </Button>
                  <Button 
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex flex-col gap-2 h-auto p-4"
                  >
                    <Monitor className="h-6 w-6" />
                    <span>System</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Visualization</CardTitle>
                <CardDescription>
                  Save your execution tree as an image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={exportAsPNG} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export as PNG
                  </Button>
                  <Button onClick={exportAsSVG} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export as SVG
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  PNG format is best for sharing and presentations. SVG format is scalable and editable.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;