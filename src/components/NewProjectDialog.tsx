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
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}

const NewProjectDialog = ({ open, onOpenChange, onCreated }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!description.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await api.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const projectTitle = title.trim() || description.slice(0, 60);

      const { data, error } = await api.projects.insert({
        title: projectTitle,
        description: description.trim(),
      });

      if (error) throw error;

      setTitle("");
      setDescription("");
      onCreated(data.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gradient-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">New Blueprint</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Input your project vision. Our AI engine will engineer a comprehensive technical blueprint from the ground up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground">Project Title (optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome App"
              className="bg-background/50 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground">Project Idea *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Build a real-time collaborative task manager with team workspaces, Kanban boards, and analytics dashboard..."
              rows={5}
              className="bg-background/50 font-mono text-sm resize-none"
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={loading || !description.trim()}
            className="w-full font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Generate Blueprint →"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;
