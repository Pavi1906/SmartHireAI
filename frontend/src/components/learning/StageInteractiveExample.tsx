import React, { useState } from 'react';
import { LearningModuleData, InteractiveSimulationStep } from '../../types/learning';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  PlayCircle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Server,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Cpu,
  Database
} from 'lucide-react';

interface StageInteractiveExampleProps {
  module: LearningModuleData;
  isCompleted: boolean;
  onCompleteStage: () => void;
}

export function StageInteractiveExample({
  module,
  isCompleted,
  onCompleteStage
}: StageInteractiveExampleProps) {
  const example = module.interactiveExample;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>(
    isCompleted ? example.steps.map(s => s.id) : []
  );

  // Simulation states
  const [circuitState, setCircuitState] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [latencyMs, setLatencyMs] = useState(15);
  const [trafficLogs, setTrafficLogs] = useState<string[]>([
    '[INIT] Service mesh initialized in healthy state. All circuits CLOSED.'
  ]);
  const [activeTab, setActiveTab] = useState<'simulation' | 'metrics'>('simulation');

  const handleStepAction = (step: InteractiveSimulationStep) => {
    if (!completedStepIds.includes(step.id)) {
      setCompletedStepIds(prev => [...prev, step.id]);
    }

    if (step.id === 'step-1') {
      setCircuitState('CLOSED');
      setLatencyMs(15);
      setTrafficLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 10,000 req/s routed -> Gateway (2ms) -> Auth (5ms) -> Payment (8ms) [200 OK]`,
        ...prev
      ]);
    } else if (step.id === 'step-2') {
      setCircuitState('OPEN');
      setLatencyMs(3200);
      setTrafficLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ALERT: Payment Service failure rate 85% > 50% threshold. Circuit TRIPPED to OPEN!`,
        `[${new Date().toLocaleTimeString()}] Upstream threads protected. Fast-fail active.`,
        ...prev
      ]);
    } else if (step.id === 'step-3') {
      setCircuitState('HALF_OPEN');
      setLatencyMs(2);
      setTrafficLogs(prev => [
        `[${new Date().toLocaleTimeString()}] Fallback response served in 1.8ms (Cached token + Asynchronous queue).`,
        `[${new Date().toLocaleTimeString()}] Canary health probe sent in HALF_OPEN state.`,
        ...prev
      ]);
    }

    if (currentStepIndex < example.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const allStepsCompleted = completedStepIds.length >= example.steps.length || isCompleted;

  const handleReset = () => {
    setCompletedStepIds([]);
    setCurrentStepIndex(0);
    setCircuitState('CLOSED');
    setLatencyMs(15);
    setTrafficLogs(['[RESET] Simulation reset to initial state.']);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-secondary/30 rounded-xl p-5 border border-border/60">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-primary border-primary/30 text-xs">
            Interactive Architecture Sandbox
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
            <RefreshCw className="h-3 w-3" /> Reset Sim
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {example.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {example.description}
        </p>
        <div className="mt-3 bg-secondary/50 rounded-lg p-3 text-xs border border-border/40 font-mono text-muted-foreground">
          <strong>Scenario:</strong> {example.scenario}
        </div>
      </div>

      {/* Interactive Simulation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls & Steps Guide */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-4">
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-primary" /> Guided Actions
              </h4>

              <div className="space-y-3">
                {example.steps.map((step, idx) => {
                  const isDone = completedStepIds.includes(step.id);
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border text-xs transition-all ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : isCurrent 
                          ? 'bg-primary/10 border-primary/40' 
                          : 'bg-secondary/20 border-border/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 font-semibold">
                        <span className="flex items-center gap-1.5">
                          {isDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                          )}
                          Step {idx + 1}
                        </span>
                        {isDone && <span className="text-emerald-400 text-[10px]">Completed</span>}
                      </div>
                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        {step.instruction}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleStepAction(step)}
                        variant={isDone ? 'outline' : 'default'}
                        className="w-full text-xs h-8"
                      >
                        {step.label}
                      </Button>
                      {isDone && (
                        <p className="mt-2 text-[11px] text-emerald-300/90 font-mono">
                          ✓ {step.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Simulation Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border overflow-hidden flex flex-col min-h-[380px]">
            {/* Simulation Canvas Topbar */}
            <div className="bg-secondary/60 p-3 px-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-foreground">
                  LIVE SIMULATION TOPOLOGY
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-mono">Circuit State:</span>
                <Badge
                  className={`font-mono text-[10px] ${
                    circuitState === 'CLOSED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : circuitState === 'OPEN'
                      ? 'bg-destructive/20 text-destructive border-destructive/40'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}
                >
                  {circuitState}
                </Badge>
              </div>
            </div>

            {/* Visual Topology Diagram */}
            <CardContent className="p-6 flex-1 flex flex-col justify-center bg-black/40">
              <div className="grid grid-cols-3 gap-4 items-center relative">
                {/* Node 1: API Gateway */}
                <div className="bg-secondary/40 border border-border p-4 rounded-xl flex flex-col items-center text-center space-y-2 relative">
                  <Server className="h-8 w-8 text-primary" />
                  <div className="text-xs font-bold">API Gateway</div>
                  <div className="text-[10px] text-muted-foreground font-mono">Latency: 2ms</div>
                  <Badge variant="outline" className="text-[9px] bg-background">Ingress: 10k req/s</Badge>
                </div>

                {/* Connector Line 1 */}
                <div className="flex flex-col items-center justify-center">
                  <div className={`h-0.5 w-full transition-colors ${circuitState === 'OPEN' ? 'bg-destructive' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-mono text-muted-foreground mt-1">
                    {circuitState === 'OPEN' ? 'Fast Fail (2ms)' : 'gRPC / HTTP2'}
                  </span>
                </div>

                {/* Node 2: Downstream Payment Service */}
                <div className={`border p-4 rounded-xl flex flex-col items-center text-center space-y-2 transition-all ${
                  circuitState === 'OPEN'
                    ? 'bg-destructive/10 border-destructive/50'
                    : 'bg-secondary/40 border-border'
                }`}>
                  {circuitState === 'OPEN' ? (
                    <ShieldAlert className="h-8 w-8 text-destructive animate-bounce" />
                  ) : (
                    <ShieldCheck className="h-8 w-8 text-emerald-400" />
                  )}
                  <div className="text-xs font-bold">Downstream Service</div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Latency: {latencyMs}ms
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      circuitState === 'OPEN' ? 'text-destructive border-destructive/40' : 'text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {circuitState === 'OPEN' ? 'Tripped (Isolated)' : 'Health: 100%'}
                  </Badge>
                </div>
              </div>

              {/* Realtime Simulation Event Log */}
              <div className="mt-6 bg-black/90 rounded-lg p-3 border border-border/60 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
                <div className="text-muted-foreground text-[10px] border-b border-border/40 pb-1 flex items-center justify-between">
                  <span>SYSTEM METRIC STREAM</span>
                  <span>{trafficLogs.length} events logged</span>
                </div>
                {trafficLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes('ALERT') || log.includes('TRIPPED')
                        ? 'text-destructive'
                        : log.includes('Fallback')
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stage Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Stage 2 of 5 • Interactive Example ({completedStepIds.length}/{example.steps.length} tasks completed)
        </div>
        <Button
          onClick={onCompleteStage}
          disabled={!allStepsCompleted}
          className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-2 h-10 px-5"
        >
          {isCompleted ? 'Next: Coding Practice' : 'Complete Simulation & Continue'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
