import { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Terminal, 
  FolderTree, 
  ChevronDown,
  Info,
  Layout,
  Code2,
  Rocket,
  ShieldCheck,
  Zap,
  BookOpen,
  Trophy,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface Blueprint {
  projectAnalysis?: {
    objective: string;
    type: string;
    complexity: string;
  };
  roadmap?: any[];
  learningPath?: any[];
  executionRoadmap?: any[];
  folderStructure?: string;
  technicalOverview?: string;
}

const BlueprintView = ({ blueprint }: { blueprint: Blueprint }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]));

  // Extremely robust normalization logic
  const normalizedRoadmap = useMemo(() => {
    try {
      const rawRoadmap = blueprint.roadmap || blueprint.learningPath || blueprint.executionRoadmap || [];
      if (!Array.isArray(rawRoadmap)) return [];

      return rawRoadmap.map((phase: any, idx: number) => {
        const milestones = phase.milestones || phase.steps || [];
        return {
          phase: phase.phase || phase.module || `Phase ${idx + 1}`,
          description: phase.description || "Implementation phase",
          milestones: Array.isArray(milestones) ? milestones.map((m: any, mIdx: number) => ({
            id: m.id || `m-${idx}-${mIdx}`,
            title: m.title || m.stepTitle || "Untitled Milestone",
            concept: m.concept || m.objective || "Technical implementation",
            practicalExample: m.practicalExample || m.implementation || "Check implementation guides for details.",
            documentation: {
              tool: m.documentation?.tool || m.tools?.[0]?.name || "Standard Stack",
              rationale: m.documentation?.rationale || m.rationale || "Best practice for this architecture.",
              quickStart: m.documentation?.quickStart || m.tools?.[0]?.setup || "Ready to build"
            },
            guidedSteps: Array.isArray(m.guidedSteps || m.learningChecklist || m.tasks) 
              ? (m.guidedSteps || m.learningChecklist || m.tasks) 
              : ["Follow architectural patterns"],
            verification: m.verification || "Confirm all sub-tasks are complete."
          })) : []
        };
      });
    } catch (e) {
      console.error("Roadmap normalization failed", e);
      return [];
    }
  }, [blueprint]);

  const toggleStep = (id: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(id)) newCompleted.delete(id);
    else newCompleted.add(id);
    setCompletedSteps(newCompleted);
  };

  const togglePhase = (idx: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(idx)) newExpanded.delete(idx);
    else newExpanded.add(idx);
    setExpandedPhases(newExpanded);
  };

  const allMilestones = normalizedRoadmap.flatMap(p => p.milestones);
  const totalSteps = allMilestones.length;
  const progressPercent = totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;

  if (normalizedRoadmap.length === 0) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Roadmap Data Error</AlertTitle>
        <AlertDescription>
          The architectural blueprint was generated but the internal structure is unrecognized. 
          Please try refreshing the page or generating a new roadmap.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32 animate-fade-up">
      {/* Premium TryHackMe Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-success/20 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000" />
        <Card className="relative border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden rounded-3xl shadow-2xl">
          <div className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] uppercase px-3 py-1">
                  Verified Blueprint
                </Badge>
                <div className="flex items-center gap-1.5 text-warning bg-warning/5 px-3 py-1 rounded-full border border-warning/10">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    {blueprint.projectAnalysis?.complexity || "standard"} Tier
                  </span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-mono text-foreground tracking-tighter uppercase leading-none">
                {blueprint.projectAnalysis?.objective || "Architecture Roadmap"}
              </h1>
              <p className="text-muted-foreground text-sm font-mono max-w-xl leading-relaxed">
                This roadmap has been engineered based on your specific tech stack and workflow. 
                Complete each module to move from initialization to full production deployment.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3 bg-muted/30 p-8 rounded-[2rem] border border-border/50 min-w-[220px]">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Deployment Readiness</span>
              <div className="text-5xl font-bold font-mono text-primary tracking-tighter flex items-baseline">
                {Math.round(progressPercent)}<span className="text-sm text-muted-foreground ml-1">%</span>
              </div>
              <Progress value={progressPercent} className="w-full h-2 mt-2 bg-primary/10" />
              <p className="text-[10px] font-mono text-muted-foreground opacity-60">
                {completedSteps.size} / {totalSteps} MILESTONES
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* The Modular Path */}
      <div className="space-y-12">
        {normalizedRoadmap.map((phase, pIdx) => (
          <div key={pIdx} className="space-y-8">
            {/* Module/Phase Header */}
            <div 
              onClick={() => togglePhase(pIdx)}
              className={`flex items-center justify-between cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                expandedPhases.has(pIdx) 
                  ? "bg-primary/5 border-primary/30 shadow-lg" 
                  : "bg-muted/30 border-border/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg transition-all ${
                  expandedPhases.has(pIdx) ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : "bg-muted border border-border text-muted-foreground"
                }`}>
                  {pIdx + 1}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-mono text-foreground uppercase tracking-tight">{phase.phase}</h2>
                  <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest opacity-70">{phase.description}</p>
                </div>
              </div>
              <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform duration-500 ${expandedPhases.has(pIdx) ? "rotate-180 text-primary" : ""}`} />
            </div>

            {/* Tasks inside Phase */}
            {expandedPhases.has(pIdx) && (
              <div className="space-y-8 ml-6 md:ml-12 border-l-2 border-primary/10 pl-8 md:pl-12 relative">
                {phase.milestones.map((milestone, mIdx) => (
                  <Card key={milestone.id} className="relative border-border/50 bg-card hover:border-primary/40 transition-all rounded-3xl overflow-hidden group shadow-sm">
                    {/* Visual Connector Dot */}
                    <div className="absolute top-8 -left-[41px] md:-left-[57px] w-4 h-4 rounded-full bg-background border-4 border-primary group-hover:scale-125 transition-transform z-10" />
                    
                    {/* Task Content */}
                    <div className="p-8 md:p-10 space-y-10">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-border/50">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Task {mIdx + 1}</span>
                          <h3 className="text-2xl font-bold font-mono text-foreground uppercase">{milestone.title}</h3>
                        </div>
                        <Button
                          variant={completedSteps.has(milestone.id) ? "success" : "default"}
                          className="font-mono text-xs gap-2 px-6 h-9 rounded-full"
                          onClick={() => toggleStep(milestone.id)}
                        >
                          {completedSteps.has(milestone.id) ? (
                            <>Task Complete <CheckCircle2 className="w-4 h-4" /></>
                          ) : (
                            <>Complete Task <ArrowRight className="w-4 h-4" /></>
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-7 space-y-8">
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold font-mono uppercase text-primary flex items-center gap-2">
                              <BookOpen className="w-4 h-4" /> Theoretical Concept
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {milestone.concept}
                            </p>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold font-mono uppercase text-foreground flex items-center gap-2">
                              <Layout className="w-4 h-4 text-primary" /> Practical Implementation
                            </h4>
                            <div className="space-y-3">
                              {milestone.guidedSteps.map((step, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 text-xs font-mono text-muted-foreground leading-relaxed hover:border-primary/20 transition-colors">
                                  <span className="text-primary font-bold">{i + 1}.</span>
                                  {step}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                          <div className="p-6 rounded-3xl bg-muted/50 border border-border/50 space-y-5">
                            <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                              <Terminal className="w-4 h-4" /> Tool Insight
                            </h4>
                            <div className="space-y-4">
                              <Badge variant="secondary" className="font-mono text-[10px] px-3">{milestone.documentation.tool}</Badge>
                              <p className="text-[11px] text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                {milestone.documentation.rationale}
                              </p>
                              <div className="space-y-2 pt-2">
                                <span className="text-[9px] font-mono text-muted-foreground uppercase block">Initialization</span>
                                <code className="text-[10px] font-mono text-success block bg-background p-3 rounded-xl border border-border/50 overflow-x-auto">
                                  {milestone.documentation.quickStart}
                                </code>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
                            <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-primary flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4" /> Verification
                            </h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {milestone.verification}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Code Sample */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <span className="text-[10px] font-mono text-primary uppercase font-bold flex items-center gap-2">
                            <Code2 className="w-4 h-4" /> Practical Snippet
                          </span>
                        </div>
                        <div className="rounded-3xl bg-black/90 p-8 border border-white/10 shadow-2xl relative">
                          <div className="absolute top-4 right-4 text-[8px] font-mono text-white/20 uppercase tracking-widest">TSX / JSON</div>
                          <pre className="text-xs font-mono text-success/90 overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
                            {milestone.practicalExample}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Technical Annex */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-16 border-t border-border/50">
        <div className="space-y-4">
          <div className="flex items-center gap-3 font-mono text-xs text-primary uppercase font-bold tracking-widest">
            <FolderTree className="w-4 h-4" /> Project Hierarchy
          </div>
          <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 font-mono text-xs text-muted-foreground/80 overflow-x-auto">
            <pre className="leading-relaxed">{blueprint.folderStructure}</pre>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 font-mono text-xs text-primary uppercase font-bold tracking-widest">
            <Zap className="w-4 h-4" /> Architecture Brief
          </div>
          <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/50 font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {blueprint.technicalOverview}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintView;
