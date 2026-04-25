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
import { Loader2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}

const NewProjectDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [projectIdea, setProjectIdea] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("miniproject");
  const [duration, setDuration] = useState("");
  const [workflow, setWorkflow] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestWorkflow = async () => {
    if (!projectIdea.trim() || !description.trim()) {
      toast({ title: "Required Fields", description: "Please provide both a project idea and description." });
      return;
    }
    setLoading(true);
    try {
      const data = await api.ai.suggestWorkflow({
        projectIdea,
        description,
        level,
        duration
      });
      setWorkflow(data.workflow);
      setStep(2);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!workflow.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await api.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const projectTitle = title.trim() || projectIdea.slice(0, 60);

      const { data, error } = await api.projects.insert({
        title: projectTitle,
        projectIdea: projectIdea.trim(),
        description: description.trim(),
        level,
        duration,
        workflow: workflow.trim(),
      });

      if (error) throw error;

      // Reset form for next time
      setTitle("");
      setProjectIdea("");
      setDescription("");
      setLevel("miniproject");
      setDuration("");
      setWorkflow("");
      setStep(1);
      
      onCreated(data.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) {
        setStep(1); // Reset step on close
      }
      onOpenChange(o);
    }}>
      <DialogContent className="gradient-card border-border max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground flex items-center gap-2">
            {step === 1 ? "Blueprint Requirements" : "Workflow Architect"}
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Step {step}/2</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
<<<<<<< HEAD
            {step === 1 
              ? "Define the core parameters of your vision."
              : "Review and refine the suggested execution path."}
=======
            Input your project vision. Our AI engine will engineer a comprehensive technical blueprint from the ground up.
>>>>>>> 3f9aa9e5091b2182c71b0cd9ee9ec39d0b00ee0a
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
              <Label className="font-mono text-xs text-muted-foreground">Project Idea (Goal) *</Label>
              <Input
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="e.g. Building a college website"
                className="bg-background/50 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">Detailed Description *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe features, target audience, and core functionality in detail..."
                rows={4}
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
                  htmlFor="customer"
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${level === 'customer' ? 'border-primary bg-primary/10' : 'border-border bg-background/50'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">End Customer</span>
                    <span className="text-[10px] text-muted-foreground">Ready for production</span>
                  </div>
                  <RadioGroupItem value="customer" id="customer" className="sr-only" />
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
              disabled={loading || !projectIdea.trim() || !description.trim()}
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
        ) : (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="font-mono text-xs text-muted-foreground">Suggested Workflow (Modify if needed)</Label>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back to details
                </Button>
              </div>
              <Textarea
                value={workflow}
                onChange={(e) => setWorkflow(e.target.value)}
                placeholder="Workflow steps separated by > ..."
                rows={10}
                className="bg-background/50 font-mono text-sm resize-none leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground italic">
                Example: signup {'>'} user saved {'>'} dashboard {'>'} update profile
              </p>
            </div>

            <Button
              onClick={handleCreate}
              disabled={loading || !workflow.trim()}
              className="w-full font-mono"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building Infrastructure...
                </>
              ) : (
                <>
                  Generate Full Blueprint <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;
