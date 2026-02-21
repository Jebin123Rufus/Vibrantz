import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Terminal, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BlueprintView from "@/components/BlueprintView";

interface Blueprint {
  projectAnalysis?: {
    objective: string;
    type: string;
    complexity: string;
    domains: string[];
  };
  skillTree?: Array<{
    category: string;
    skills: Array<{ name: string; subskills: string[] }>;
  }>;
  knowledgeChecklist?: Array<{
    module: string;
    items: string[];
  }>;
  moduleArchitecture?: Array<{
    name: string;
    purpose: string;
    dependencies: string[];
    inputs: string[];
    outputs: string[];
  }>;
  executionRoadmap?: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  folderStructure?: string;
  taskBreakdown?: Array<{
    module: string;
    tasks: string[];
  }>;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await api.projects.get(id);
      if (error) throw error;
      setProject(data);
      if (data.blueprint) {
        setBlueprint(data.blueprint as Blueprint);
      } else if (data.status === "generating") {
        generateBlueprint(data.description);
      }
    } catch (e) {
      toast({ title: "Project not found", variant: "destructive" });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    api.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else fetchProject();
    });
  }, [fetchProject, navigate]);

  const generateBlueprint = async (description: string) => {
    if (!id) return;
    setGenerating(true);
    setStreamText("");

    try {
      const resp = await api.ai.generateStream(description, id);

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setStreamText(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Parse the complete JSON
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let rawJson = jsonMatch[0];
        
        // Remove markdown backticks if included
        rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();

        try {
          const blueprintData = JSON.parse(rawJson);
          setBlueprint(blueprintData);
          await api.projects.update(id, { blueprint: blueprintData, status: "complete" });
          setProject((prev: any) => ({ ...prev, status: "complete", blueprint: blueprintData }));
        } catch (parseError: any) {
          console.error("Standard parse failed, trying sanitized parse", parseError);
          try {
            // Find raw newlines inside double quotes and escape them
            const cleanedJson = rawJson.replace(/"([^"]*)"/g, (match, p1) => {
              return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
            });
            const blueprintData = JSON.parse(cleanedJson);
            setBlueprint(blueprintData);
            await api.projects.update(id, { blueprint: blueprintData, status: "complete" });
            setProject((prev: any) => ({ ...prev, status: "complete", blueprint: blueprintData }));
          } catch (finalError) {
            throw new Error(`Failed to parse AI response: ${parseError.message}`);
          }
        }
      } else {
        throw new Error("No architectural blueprint found in AI response");
      }
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
      await api.projects.update(id, { status: "error" });
      setProject((prev: any) => ({ ...prev, status: "error" }));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-foreground text-sm truncate max-w-xs">
                {project?.title}
              </span>
            </div>
          </div>
          {project?.status === "error" && (
            <Button
              size="sm"
              variant="outline"
              className="font-mono text-xs"
              onClick={() => generateBlueprint(project.description)}
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {generating ? (
          <div className="max-w-3xl mx-auto">
            <div className="gradient-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-warning/60 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">Generating blueprint...</span>
              </div>
              <div className="p-6">
                <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                  {streamText || "Analyzing project idea..."}
                </pre>
              </div>
            </div>
          </div>
        ) : blueprint ? (
          <BlueprintView blueprint={blueprint} />
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-mono">No blueprint data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
