import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Layers, GitBranch, Route, ListTodo, BarChart3 } from "lucide-react";

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

  taskBreakdown?: Array<{
    module: string;
    tasks: string[];
  }>;
}

const BlueprintView = ({ blueprint }: { blueprint: Blueprint }) => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      {/* Project Analysis Header */}
      {blueprint.projectAnalysis && (
        <div className="gradient-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-mono text-foreground tracking-tighter uppercase">Blueprint Intelligence</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-xs font-mono text-muted-foreground block mb-1 uppercase tracking-widest">Target Objective</span>
              <p className="text-sm text-foreground">{blueprint.projectAnalysis.objective}</p>
            </div>
            <div>
              <span className="text-xs font-mono text-muted-foreground block mb-1">Type</span>
              <p className="text-sm text-foreground">{blueprint.projectAnalysis.type}</p>
            </div>
            <div>
              <span className="text-xs font-mono text-muted-foreground block mb-1">Complexity</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-mono ${
                blueprint.projectAnalysis.complexity === "advanced" ? "bg-destructive/10 text-destructive" :
                blueprint.projectAnalysis.complexity === "intermediate" ? "bg-warning/10 text-warning" :
                "bg-success/10 text-success"
              }`}>
                {blueprint.projectAnalysis.complexity} Efficiency
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-muted-foreground block mb-1">Domains</span>
              <div className="flex flex-wrap gap-1">
                {blueprint.projectAnalysis.domains?.map((d) => (
                  <span key={d} className="inline-flex px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start overflow-x-auto flex-nowrap h-12">
          <TabsTrigger value="skills" className="font-mono text-xs gap-1.5 uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5" /> Mastery Path
          </TabsTrigger>
          <TabsTrigger value="checklist" className="font-mono text-xs gap-1.5 uppercase tracking-wider">
            <CheckSquare className="w-3.5 h-3.5" /> Validation
          </TabsTrigger>
          <TabsTrigger value="modules" className="font-mono text-xs gap-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> System Architecture
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="font-mono text-xs gap-1.5 uppercase tracking-wider">
            <Route className="w-3.5 h-3.5" /> Velocity Strategy
          </TabsTrigger>

          <TabsTrigger value="tasks" className="font-mono text-xs gap-1.5 uppercase tracking-wider">
            <ListTodo className="w-3.5 h-3.5" /> Deployment Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-6">
          <div className="space-y-4">
            {blueprint.skillTree?.map((cat) => (
              <div key={cat.category} className="gradient-card border border-border rounded-xl p-5">
                <h3 className="font-bold font-mono text-foreground mb-3">{cat.category}</h3>
                <div className="space-y-2">
                  {cat.skills?.map((skill) => (
                    <div key={skill.name} className="ml-4">
                      <div className="flex items-center gap-2 text-sm text-foreground font-mono">
                        <span className="text-primary">├──</span> {skill.name}
                      </div>
                      {skill.subskills?.map((sub) => (
                        <div key={sub} className="ml-8 text-xs text-muted-foreground font-mono flex items-center gap-2">
                          <span className="text-border">│   ├──</span> {sub}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <div className="space-y-4">
            {blueprint.knowledgeChecklist?.map((mod) => (
              <div key={mod.module} className="gradient-card border border-border rounded-xl p-5">
                <h3 className="font-bold font-mono text-foreground mb-3">{mod.module}</h3>
                <div className="space-y-1.5">
                  {mod.items?.map((item, i) => (
                    <label key={i} className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground cursor-pointer group">
                      <input type="checkbox" className="mt-1 accent-primary" />
                      <span className="font-mono text-xs">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blueprint.moduleArchitecture?.map((mod) => (
              <div key={mod.name} className="gradient-card border border-border rounded-xl p-5">
                <h3 className="font-bold font-mono text-foreground mb-2">{mod.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{mod.purpose}</p>
                {mod.dependencies?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-mono text-muted-foreground">Dependencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mod.dependencies.map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          <div className="space-y-0">
            {blueprint.executionRoadmap?.map((step, i) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-mono text-primary font-bold">
                    {step.step}
                  </div>
                  {i < (blueprint.executionRoadmap?.length || 0) - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="font-bold font-mono text-foreground text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>



        <TabsContent value="tasks" className="mt-6">
          <div className="space-y-4">
            {blueprint.taskBreakdown?.map((mod) => (
              <div key={mod.module} className="gradient-card border border-border rounded-xl p-5">
                <h3 className="font-bold font-mono text-foreground mb-3">{mod.module}</h3>
                <div className="space-y-1.5">
                  {mod.tasks?.map((task, i) => (
                    <label key={i} className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                      <input type="checkbox" className="mt-1 accent-primary" />
                      <span className="font-mono text-xs">{task}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlueprintView;
