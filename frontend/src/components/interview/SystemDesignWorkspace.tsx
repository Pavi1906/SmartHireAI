import React from 'react';
import { InterviewQuestion, UserResponse } from '../../types/interview';
import { Settings2, Layers, Database, ShieldAlert, Cpu } from 'lucide-react';

interface SystemDesignWorkspaceProps {
  question: InterviewQuestion;
  response: UserResponse;
  onUpdateResponse: (updates: Partial<UserResponse>) => void;
  disabled?: boolean;
}

export function SystemDesignWorkspace({
  question,
  response,
  onUpdateResponse,
  disabled = false
}: SystemDesignWorkspaceProps) {
  const breakdown = response.systemDesignBreakdown || {
    requirements: '',
    architecture: '',
    dataModel: '',
    scaling: ''
  };

  const prompts = question.systemDesignPrompts || {
    requirements: 'Outline functional goals (APIs, operations) and non-functional requirements (throughput, latency, CAP).',
    architecture: 'Describe system components (Load Balancers, API gateways, workers, queues, cache layers).',
    dataModel: 'Detail data schemas, indexing strategy, and database choices (SQL vs NoSQL).',
    bottlenecks: 'Address single points of failure, partition strategies, cache stampede, and disaster recovery.'
  };

  const handleFieldChange = (field: keyof typeof breakdown, value: string) => {
    const updated = {
      ...breakdown,
      [field]: value
    };
    onUpdateResponse({
      systemDesignBreakdown: updated,
      textAnswer: `[REQUIREMENTS]\n${updated.requirements}\n\n[ARCHITECTURE]\n${updated.architecture}\n\n[DATA MODEL]\n${updated.dataModel}\n\n[SCALING & BOTTLENECKS]\n${updated.scaling}`
    });
  };

  return (
    <div className="space-y-6">
      {/* System Design Banner */}
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
        <Settings2 className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-foreground block">
            System Design & Distributed Architecture Workspace
          </span>
          <p className="text-muted-foreground leading-relaxed">
            Formulate your high-level architecture, capacity calculations, data partitioning models, and reliability trade-offs across structured sections.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Scoping & Requirements */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-rose-500/20 text-rose-400 font-mono text-xs font-bold flex items-center justify-center">
                1
              </span>
              <label className="text-xs font-bold text-foreground font-mono">
                Requirements & Capacity Scoping
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Scope & SLA</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prompts.requirements}
          </p>
          <textarea
            value={breakdown.requirements}
            onChange={(e) => handleFieldChange('requirements', e.target.value)}
            disabled={disabled}
            placeholder="Functional: generateShortUrl(), redirectToOriginalUrl(). Non-functional: 100M URLs/mo, 100:1 read/write ratio, <10ms P99 latency..."
            rows={3}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-400 leading-relaxed resize-y font-mono"
          />
        </div>

        {/* High-Level Architecture */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-rose-500/20 text-rose-400 font-mono text-xs font-bold flex items-center justify-center">
                2
              </span>
              <label className="text-xs font-bold text-foreground font-mono flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> High-Level Architecture & API Flow
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Component Topology</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prompts.architecture}
          </p>
          <textarea
            value={breakdown.architecture}
            onChange={(e) => handleFieldChange('architecture', e.target.value)}
            disabled={disabled}
            placeholder="Client -> Cloudflare CDN -> Round-Robin LB -> Stateless Go/Node API Workers -> Redis Cluster (LRU) -> Master/Replica DB..."
            rows={4}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-400 leading-relaxed resize-y font-mono"
          />
        </div>

        {/* Data Model & Storage */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-rose-500/20 text-rose-400 font-mono text-xs font-bold flex items-center justify-center">
                3
              </span>
              <label className="text-xs font-bold text-foreground font-mono flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" /> Data Model, Partitioning & Schema
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Storage Design</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prompts.dataModel}
          </p>
          <textarea
            value={breakdown.dataModel}
            onChange={(e) => handleFieldChange('dataModel', e.target.value)}
            disabled={disabled}
            placeholder="Primary Store: DynamoDB / Cassandra for horizontal scalability. Schema: short_hash (PK), original_url, user_id, created_at, expire_at..."
            rows={3}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-400 leading-relaxed resize-y font-mono"
          />
        </div>

        {/* Bottlenecks & Resilience */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                4
              </span>
              <label className="text-xs font-bold text-foreground font-mono flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" /> Scaling, Bottlenecks & Cache Eviction
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground">Resilience & Edge Cases</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prompts.bottlenecks}
          </p>
          <textarea
            value={breakdown.scaling}
            onChange={(e) => handleFieldChange('scaling', e.target.value)}
            disabled={disabled}
            placeholder="Mitigate Cache Stampede with probabilistic early expiration (XFetch). Use consistent hashing with virtual nodes for multi-region replication..."
            rows={3}
            className="w-full p-3 rounded-lg bg-secondary/30 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400 leading-relaxed resize-y font-mono"
          />
        </div>
      </div>
    </div>
  );
}
