import { useState } from "react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ArrowRight, Sparkles, Database, Code, Shield, Plus, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface WorkflowStep {
  title: string;
  brief: string;
}

interface TechStackItem {
  module: string;
  tech: string;
  reason: string;
  isCustom?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}

const NewProjectDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("miniproject");
  const [duration, setDuration] = useState("");
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [techStack, setTechStack] = useState<TechStackItem[]>([]);
  const [isEditingWorkflow, setIsEditingWorkflow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTech, setLoadingTech] = useState(false);
  const { toast } = useToast();

  const handleSuggestWorkflow = async () => {
    if (!description.trim()) {
      toast({ title: "Required Field", description: "Please provide a project description." });
      return;
    }
    setLoading(true);
    try {
      const data = await api.ai.suggestWorkflow({
        description,
        level,
        duration
      });
      setWorkflow(data.workflow);
      setStep(2);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to suggest workflow";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestTechStack = async () => {
    setLoadingTech(true);
    try {
      const data = await api.ai.suggestTechStack({
        description,
        workflow,
        level
      });
      setTechStack(data.techStack);
      setStep(3);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to suggest tech stack";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoadingTech(false);
    }
  };

  const handleCreate = async () => {
    if (workflow.length === 0 || techStack.length === 0) return;
    setLoading(true);

    try {
      const { data: { user } } = await api.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const projectTitle = title.trim() || description.slice(0, 60);

      const { data, error } = await api.projects.insert({
        title: projectTitle,
        projectIdea: description.trim(),
        description: description.trim(),
        level,
        duration,
        workflow: workflow,
        techStack: techStack
      });

      if (error) throw error;

      // Reset form
      setTitle("");
      setDescription("");
      setLevel("miniproject");
      setDuration("");
      setWorkflow([]);
      setTechStack([]);
      setStep(1);
      setIsEditingWorkflow(false);
      
      onCreated(data.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) {
        setStep(1); // Reset step on close
        setIsEditingWorkflow(false);
      }
      onOpenChange(o);
    }}>
      <DialogContent className="gradient-card border-border max-w-2xl overflow-y-auto max-h-[90vh] scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground flex items-center gap-2">
            {step === 1 ? "Blueprint Requirements" : step === 2 ? "Execution Strategy" : step === 3 ? "Technology Stack" : "Ready for Launch"}
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Step {step}/4</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 1 
              ? "Define the core parameters of your vision."
              : step === 2 
              ? "Review the approach and steps for your project."
              : step === 3
              ? "The recommended technology modules for your architecture."
              : "Confirm everything and generate your final roadmap."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">Project Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome App"
                  className="bg-background/50 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground">Completion Duration</Label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2 weeks, 3 months"
                  className="bg-background/50 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">Project Description *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe features, target audience, and core functionality in detail..."
                rows={6}
                className="bg-background/50 font-mono text-sm resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="font-mono text-xs text-muted-foreground">Project Level</Label>
              <RadioGroup value={level} onValueChange={setLevel} className="grid grid-cols-2 gap-2">
                <Label
                  htmlFor="miniproject"
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${level === 'miniproject' ? 'border-primary bg-primary/10' : 'border-border bg-background/50'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Mini Project</span>
                    <span className="text-[10px] text-muted-foreground">Quick prototype</span>
                  </div>
                  <RadioGroupItem value="miniproject" id="miniproject" className="sr-only" />
                </Label>
                <Label
                  htmlFor="resume"
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${level === 'resume' ? 'border-primary bg-primary/10' : 'border-border bg-background/50'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Resume Project</span>
                    <span className="text-[10px] text-muted-foreground">Portfolio worthy</span>
                  </div>
                  <RadioGroupItem value="resume" id="resume" className="sr-only" />
                </Label>
                <Label
                  htmlFor="production"
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${level === 'production' ? 'border-primary bg-primary/10' : 'border-border bg-background/50'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Production Level</span>
                    <span className="text-[10px] text-muted-foreground">Ready for deployment</span>
                  </div>
                  <RadioGroupItem value="production" id="production" className="sr-only" />
                </Label>
                <Label
                  htmlFor="scalable"
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${level === 'scalable' ? 'border-primary bg-primary/10' : 'border-border bg-background/50'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Startup Scalable</span>
                    <span className="text-[10px] text-muted-foreground">High scalability focus</span>
                  </div>
                  <RadioGroupItem value="scalable" id="scalable" className="sr-only" />
                </Label>
              </RadioGroup>
            </div>

            <Button
              onClick={handleSuggestWorkflow}
              disabled={loading || !description.trim()}
              className="w-full font-mono mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Concept...
                </>
              ) : (
                <>
                  Suggest Workflow <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        ) : step === 2 ? (
          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <Label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Project Approach</Label>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-mono" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back
                </Button>
              </div>

              <div className="space-y-3 mt-2 animate-fade-up">
                {Array.isArray(workflow) ? (
                  workflow.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start group relative">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full border border-primary/50 flex items-center justify-center text-[10px] font-mono font-bold bg-primary/5 text-primary group-hover:scale-110 transition-transform z-10">
                          {idx + 1}
                        </div>
                        {idx < workflow.length - 1 && (
                          <div className="w-px h-full bg-gradient-to-b from-primary/50 to-transparent absolute top-7 bottom-0" />
                        )}
                      </div>
                      <div className="flex-1 p-3 rounded-lg border border-border bg-black/40 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-300">
                        <h4 className="text-xs font-bold font-mono text-primary mb-1">{item?.title || "Step " + (idx + 1)}</h4>
                        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">{item?.brief || (typeof item === 'string' ? item : "")}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-border text-center text-[10px] font-mono text-muted-foreground">
                    No approach steps suggested. Please try again.
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSuggestTechStack}
              disabled={loadingTech || workflow.length === 0}
              className="w-full font-mono"
            >
              {loadingTech ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Tech...
                </>
              ) : (
                <>
                  Analyze Technology Stack <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        ) : step === 3 ? (
          <div className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <Label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Recommended Architecture</Label>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-mono" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-3 h-3 mr-1" /> Adjust Approach
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {techStack.map((item, idx) => (
                  <HoverCard key={idx}>
                    <HoverCardTrigger asChild>
                      <div className="p-4 rounded-xl border border-border bg-black/40 hover:border-primary/50 transition-all group relative">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-primary/70 uppercase tracking-tighter">
                            {item.module}
                          </span>
                          <div className="flex gap-1">
                            {item.isCustom && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1 rounded">Custom</span>}
                            <Info className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="text-sm font-bold font-mono text-foreground flex items-center gap-2">
                          <Code className="w-4 h-4 text-primary/40" />
                          <input 
                            value={item.tech}
                            onChange={(e) => {
                              const newStack = [...techStack];
                              newStack[idx].tech = e.target.value;
                              newStack[idx].isCustom = true;
                              setTechStack(newStack);
                            }}
                            className="bg-transparent border-none p-0 text-sm font-bold font-mono text-foreground focus:ring-0 w-full"
                            placeholder="Enter Technology"
                          />
                        </div>
                        
                        <div className="mt-2 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newStack = [...techStack];
                              newStack[idx].tech = "";
                              newStack[idx].reason = "User specified custom technology";
                              newStack[idx].isCustom = true;
                              setTechStack(newStack);
                            }}
                          >
                            Use Custom
                          </Button>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive/20 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTechStack(techStack.filter((_, i) => i !== idx));
                          }}
                        >
                          <Plus className="w-3 h-3 rotate-45" />
                        </Button>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 gradient-card border-primary/20">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-primary font-mono flex items-center gap-2">
                          <Shield className="w-3 h-3" /> Engineering Rationale
                        </h4>
                        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                          {item.reason}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
                
                <div 
                  onClick={() => {
                    setTechStack([...techStack, { module: "Custom Module", tech: "", reason: "User defined choice", isCustom: true }]);
                  }}
                  className="p-4 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all cursor-pointer bg-black/10 group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Add Custom Choice</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(4)}
              disabled={techStack.length === 0}
              className="w-full font-mono"
            >
              Confirm Architecture & Proceed <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-bold font-mono text-foreground">Final Roadmap Generation</h3>
              <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                Your project architecture is ready. We will now generate a comprehensive roadmap including:
              </p>
              <ul className="text-xs text-muted-foreground font-mono text-left space-y-2 max-w-xs mx-auto">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Detailed Task Breakdown</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Folder Structure</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Knowledge Checklist</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /> Skill Tree for Developers</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 font-mono" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="flex-[2] font-mono"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Launch Architect <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )
        }
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;
