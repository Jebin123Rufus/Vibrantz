import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Terminal, Layers, GitBranch, Zap, ArrowRight, Code2 } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Structural Intelligence",
    description: "Deep-linking system modules with automated dependency and data flow mapping.",
  },
  {
    icon: GitBranch,
    title: "Mastery Pathways",
    description: "High-fidelity skill trees designed to bridge the gap from concept to expertise.",
  },
  {
    icon: Code2,
    title: "Architectural Scaffolding",
    description: "Project structures optimized for modern tech stacks and rapid deployment.",
  },
  {
    icon: Zap,
    title: "Velocity Roadmaps",
    description: "Surgically optimized build orders for peak development efficiency.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground">Vibrantz.AI</span>
          </div>
          <Button variant="outline" size="sm" className="font-mono text-xs" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-primary">Engineered by Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-mono leading-tight text-foreground mb-6">
              Turn Vision Into{" "}
              <span className="text-primary glow-text">Executable</span>{" "}
              Reality
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              The intelligent technical foundation for your next breakthrough. Generate multi-dimensional blueprints, skill maps, and surgical execution roadmaps.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="font-mono text-sm glow-primary"
                onClick={() => navigate("/auth")}
              >
                Start Building <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-mono text-sm"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See How It Works
              </Button>
            </div>
          </div>

          {/* Terminal preview */}
          <div className="max-w-2xl mx-auto mt-16 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="gradient-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="text-xs font-mono text-muted-foreground ml-2">vibrantz.ai</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="text-muted-foreground">
                  <span className="text-primary">$</span> describe your project idea...
                </div>
                <div className="text-foreground">
                  &gt; "Build a task management app with team collaboration"
                </div>
                <div className="text-muted-foreground mt-4">
                  <span className="text-success">✓</span> Project Analysis complete
                </div>
                <div className="text-muted-foreground">
                  <span className="text-success">✓</span> Skill Tree generated (23 skills)
                </div>
                <div className="text-muted-foreground">
                  <span className="text-success">✓</span> Module Architecture designed (8 modules)
                </div>
                <div className="text-muted-foreground">
                  <span className="text-success">✓</span> Execution Roadmap built (12 steps)
                </div>
                <div className="text-primary">
                  <span className="terminal-cursor">█</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-foreground mb-4">
            Precision Engineering, Automated
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Vibrantz.AI deconstructs complex ideas into actionable technical architectures in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="gradient-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-mono text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="gradient-card border border-border rounded-2xl p-12 text-center max-w-3xl mx-auto glow-primary">
          <h2 className="text-2xl md:text-3xl font-bold font-mono text-foreground mb-4">
            Architect Your Future
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Stop debating implementation details. Start building with industrial-grade AI blueprints.
          </p>
          <Button size="lg" className="font-mono glow-primary" onClick={() => navigate("/auth")}>
            Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">Vibrantz.AI</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Built with AI</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
