import { 
  LearningModuleData, 
  UserModuleProgress, 
  LearningRoadmapSummary,
  ModuleCategory,
  TestCase
} from '../types/learning';

// Comprehensive, production-grade learning module definitions
export const CURATED_LEARNING_MODULES: LearningModuleData[] = [
  {
    id: 'system-design-microservices',
    title: 'Microservices & Distributed Systems',
    slug: 'system-design-microservices',
    description: 'Master asynchronous messaging, service discovery, distributed transactions (Saga), and API gateway patterns for high-concurrency systems.',
    category: 'System Architecture',
    skill: 'System Design',
    relatedSkills: ['Microservices', 'Distributed Systems', 'API Gateway', 'Kafka'],
    priority: 'Critical',
    difficulty: 'Advanced',
    estimatedEffort: '3.5 hours',
    durationMinutes: 210,
    expectedImpact: '+18% Tier-1 Tech Alignment',
    targetCompanies: ['Google', 'Amazon', 'Uber', 'Netflix'],
    prerequisites: ['Basic Backend Architecture', 'REST APIs'],
    learningObjectives: [
      'Understand synchronous vs asynchronous service communication patterns',
      'Implement circuit breaking and resilient retries using Envoy/Resilience4j concepts',
      'Design event-driven data flows with Kafka and Event Sourcing',
      'Solve distributed transaction challenges using the Saga pattern'
    ],
    lesson: {
      overview: 'Modern cloud platforms require modular, independently deployable services that can scale horizontally without cascading failures.',
      sections: [
        {
          title: '1. Monolith to Microservices Transition',
          content: 'A monolithic architecture couples UI, business logic, and database access into a single deployable unit. While simple to develop initially, it introduces deployment bottlenecks and single points of failure. Microservices decompose this into discrete bounded contexts communicating via lightweight protocols (gRPC, HTTP/2, Kafka).',
          codeSnippet: {
            language: 'typescript',
            caption: 'API Gateway Reverse Proxy Route Definition',
            code: `// Express/Node API Gateway routing with circuit breaker
import { createProxyMiddleware } from 'http-proxy-middleware';

const userServiceProxy = createProxyMiddleware({
  target: 'http://user-service:8001',
  changeOrigin: true,
  pathRewrite: { '^/api/v1/users': '/users' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('x-correlation-id', req.headers['x-request-id'] || 'req-' + Date.now());
  }
});`
          },
          keyTakeaway: 'Always establish clear bounded contexts before decomposing a monolith to prevent distributed monolith anti-patterns.'
        },
        {
          title: '2. Resilience: Circuit Breakers & Backpressure',
          content: 'When downstream services fail or slow down, calling services can exhaust their thread pool waiting for replies. A Circuit Breaker monitors failure rates and trips open after a threshold, instantly failing fast and serving fallback responses rather than overwhelming downstream services.',
          codeSnippet: {
            language: 'typescript',
            caption: 'Circuit Breaker State Machine Logic',
            code: `enum CircuitState { CLOSED, OPEN, HALF_OPEN }

class SimpleCircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastStateChange = Date.now();

  async execute<T>(action: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastStateChange > 10000) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        return fallback();
      }
    }
    try {
      const result = await action();
      this.reset();
      return result;
    } catch (err) {
      this.recordFailure();
      return fallback();
    }
  }
  private reset() { this.failureCount = 0; this.state = CircuitState.CLOSED; }
  private recordFailure() {
    this.failureCount++;
    if (this.failureCount >= 3) {
      this.state = CircuitState.OPEN;
      this.lastStateChange = Date.now();
    }
  }
}`
          },
          keyTakeaway: 'Circuit breakers prevent cascading outages across distributed microservices clusters.'
        },
        {
          title: '3. Data Consistency: The Saga Pattern',
          content: 'Two-Phase Commit (2PC) does not scale across microservices due to distributed locks. The Saga pattern manages transactions as a sequence of local transactions with compensating actions if a downstream step fails.',
          keyTakeaway: 'Use choreography for simple workflows; use orchestration (e.g., Temporal, AWS Step Functions) for complex multi-step enterprise workflows.'
        }
      ],
      summary: 'You have mastered microservices decomposition, circuit breaker resilience, and distributed transaction management using Sagas.'
    },
    interactiveExample: {
      title: 'Interactive Microservices Circuit Breaker Simulation',
      description: 'Simulate high-traffic load, inject network latency into the Payment Service, and observe how the Circuit Breaker trips to protect upstream services.',
      scenario: 'High traffic event: 10,000 requests/sec arriving at the API Gateway. The downstream Payment Gateway begins failing with 504 Gateway Timeouts.',
      simulationType: 'architecture_flow',
      steps: [
        {
          id: 'step-1',
          instruction: 'Step 1: Inspect normal request routing. Click "Send Normal Traffic" to observe healthy 200 OK responses traversing Gateway -> Auth -> Payment.',
          actionType: 'click',
          label: 'Send Normal Traffic',
          explanation: 'All services are in CLOSED (healthy) circuit state with 15ms latency.'
        },
        {
          id: 'step-2',
          instruction: 'Step 2: Inject 3000ms latency and 80% error rate on the Payment Service to trigger downstream failure.',
          actionType: 'toggle',
          label: 'Inject Payment Service Latency',
          explanation: 'Payment service error threshold exceeds 50%. The Circuit Breaker transitions to OPEN.'
        },
        {
          id: 'step-3',
          instruction: 'Step 3: Verify Fast-Fail Fallback. Click "Verify Fallback" to ensure requests receive cached or queued confirmation without locking Gateway threads.',
          actionType: 'click',
          label: 'Verify Fallback Activation',
          explanation: 'Gateway responds in 2ms with fallback receipt while background probe enters HALF_OPEN.'
        }
      ]
    },
    codingPractice: {
      title: 'Implement an In-Memory Rate Limiter (Token Bucket)',
      difficulty: 'Advanced',
      timeLimit: '20 mins',
      description: 'Implement a TokenBucket class that limits requests based on a capacity and refill rate (tokens per second). The `allowRequest(tokensRequired)` method must return `true` if sufficient tokens exist and decrement the count, or `false` otherwise.',
      constraints: [
        'Capacity must be a positive integer >= 1',
        'Refill rate is expressed in tokens per second',
        'Time precision must handle fractional refills based on elapsed milliseconds'
      ],
      examples: [
        {
          input: 'capacity = 5, refillRate = 1/sec; 5 rapid calls',
          output: 'true, true, true, true, true, false (6th call blocked)',
          explanation: 'Initial bucket has 5 tokens. After consuming all 5, the next call is denied until 1 second has elapsed.'
        }
      ],
      starterCode: {
        typescript: `class TokenBucket {
  private capacity: number;
  private refillRate: number; // tokens per second
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  public allowRequest(tokensRequired: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }
}`,
        javascript: `class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  allowRequest(tokensRequired = 1) {
    this.refill();
    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }

  refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }
}`,
        python: `import time

class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = float(capacity)
        self.last_refill = time.time()

    def allow_request(self, tokens_required: int = 1) -> bool:
        self._refill()
        if self.tokens >= tokens_required:
            self.tokens -= tokens_required
            return True
        return False

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(float(self.capacity), self.tokens + elapsed * self.refill_rate)
        self.last_refill = now`
      },
      solutionCode: {
        javascript: `class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }
  allowRequest(tokensRequired = 1) {
    this.refill();
    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
  refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRate);
    this.lastRefillTimestamp = now;
  }
}`,
        typescript: `class TokenBucket {
  private capacity: number;
  private refillRate: number;
  private tokens: number;
  private lastRefillTimestamp: number;
  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }
  public allowRequest(tokensRequired: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefillTimestamp) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefillTimestamp = now;
  }
}`,
        python: `import time\nclass TokenBucket:\n    def __init__(self, capacity, refill_rate):\n        self.capacity = capacity\n        self.refill_rate = refill_rate\n        self.tokens = float(capacity)\n        self.last = time.time()\n    def allow_request(self, n=1):\n        now = time.time()\n        self.tokens = min(float(self.capacity), self.tokens + (now - self.last) * self.refill_rate)\n        self.last = now\n        if self.tokens >= n:\n            self.tokens -= n\n            return True\n        return False`
      },
      testCases: [
        {
          id: 'tc-1',
          input: 'Bucket(capacity=3, rate=1). Request 3 tokens immediately',
          expectedOutput: 'true, true, true',
          description: 'Initial burst capacity consumption'
        },
        {
          id: 'tc-2',
          input: 'Bucket(capacity=3, rate=1). Request 4th token with zero delay',
          expectedOutput: 'false',
          description: 'Rate limit rejection when bucket is empty'
        },
        {
          id: 'tc-3',
          input: 'Bucket(capacity=5, rate=2). Request 10 tokens in single call',
          expectedOutput: 'false',
          description: 'Atomic rejection when required tokens exceed total bucket capacity'
        }
      ]
    },
    knowledgeCheck: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'kc-1',
          question: 'What is the primary danger of using synchronous HTTP REST calls across deep chains of microservices (e.g., Service A -> B -> C -> D)?',
          options: [
            'Network serialization overhead makes JSON payloads invalid',
            'Cascading thread exhaustion and compounding latency leading to cluster-wide outages',
            'REST APIs cannot be monitored with Prometheus',
            'HTTP/2 does not support status codes above 400'
          ],
          correctIndex: 1,
          explanation: 'Synchronous blocking calls tie up connection and thread pools at every layer, creating a single point of cascading failure.'
        },
        {
          id: 'kc-2',
          question: 'In the Circuit Breaker pattern, what occurs during the HALF_OPEN state?',
          options: [
            'All traffic is rejected and redirected to cold storage',
            'A limited number of trial probe requests are allowed through to test downstream health',
            'The circuit breaker drops all TCP connections and restarts the node',
            'The gateway switches permanently to a backup database replica'
          ],
          correctIndex: 1,
          explanation: 'HALF_OPEN allows a few canary requests through. If they succeed, the circuit resets to CLOSED; if they fail, it trips back to OPEN.'
        },
        {
          id: 'kc-3',
          question: 'Why is Two-Phase Commit (2PC) generally discouraged in large-scale cloud microservices?',
          options: [
            'It violates the relational ACID model',
            'It holds distributed locks across services, destroying availability and horizontal throughput',
            'SQL databases do not support transaction rollback',
            '2PC can only be used with XML RPC'
          ],
          correctIndex: 1,
          explanation: 'Distributed locks held during 2PC create extreme latency amplification and availability degradation when network partitions occur.'
        },
        {
          id: 'kc-4',
          question: 'Which pattern ensures data consistency across microservices through compensating actions when a multi-step workflow fails?',
          options: [
            'Strangler Fig Pattern',
            'Saga Pattern',
            'Bulkhead Pattern',
            'Sidecar Pattern'
          ],
          correctIndex: 1,
          explanation: 'The Saga pattern executes a series of local transactions and triggers explicit compensating transactions if any step in the flow fails.'
        }
      ]
    },
    finalAssessment: {
      passingScorePercent: 80,
      questions: [
        {
          id: 'fa-1',
          scenario: 'You are designing the checkout service for an e-commerce platform handling 50,000 orders/minute during Black Friday. The order process involves Inventory Reservation, Payment Processing, and Email Notification.',
          question: 'Which architecture ensures the highest availability and responsiveness for the user during peak load?',
          options: [
            'Synchronous HTTP calls to Inventory, Payment, and Email in a single database transaction',
            'Synchronous Payment verification followed by asynchronous event publishing (Kafka) for Inventory confirmation and Email delivery',
            'Batching all orders into a single CSV file processed every hour',
            'Direct RPC calls with infinite retry loops and zero timeout limits'
          ],
          correctIndex: 1,
          explanation: 'Critical path operations (payment auth) should be fast and minimal, with non-blocking downstream processes decoupled via asynchronous event streams.',
          domainScoreWeight: 25
        },
        {
          id: 'fa-2',
          scenario: 'A microservice is experiencing sporadic 503 errors because a shared Redis cache is undergoing a failover.',
          question: 'Which resilience pattern prevents application threads from piling up during this cache downtime?',
          options: [
            'Exponential backoff with jitter and a Circuit Breaker fallback to database with rate limiting',
            'Increasing thread pool size to 100,000 threads',
            'Disabling database indexing',
            'Restarting the web application every 30 seconds'
          ],
          correctIndex: 0,
          explanation: 'Exponential backoff with jitter avoids thundering herd problems, while the circuit breaker safely falls back without overwhelming downstream databases.',
          domainScoreWeight: 25
        },
        {
          id: 'fa-3',
          scenario: 'Two microservices need to share state about User Subscriptions, but must maintain strict independent database schemas (Database-per-Service).',
          question: 'How should the Billing Service stay updated with User profile changes from the User Service?',
          options: [
            'Direct SQL JOIN between the User database and Billing database over raw TCP',
            'Publishing "UserUpdated" domain events to a message bus that Billing Service subscribes to and stores locally',
            'Having the User Service directly write to the Billing Service tables',
            'Storing user data in a global shared text file on NFS'
          ],
          correctIndex: 1,
          explanation: 'Event-driven data replication preserves bounded contexts and service autonomy while providing local read performance.',
          domainScoreWeight: 25
        },
        {
          id: 'fa-4',
          scenario: 'Your team is splitting a legacy monolithic billing system into modern microservices without causing any customer downtime.',
          question: 'Which incremental migration strategy is recommended by industry standards?',
          options: [
            'Big Bang rewrite over 2 years with no releases until 100% feature parity',
            'Strangler Fig pattern: Incrementally routing specific API endpoints through an API Gateway to new microservices while the legacy monolith handles the remainder',
            'Deleting the monolith source code and starting fresh in production',
            'Copying all code into a single AWS Lambda function'
          ],
          correctIndex: 1,
          explanation: 'The Strangler Fig pattern allows zero-downtime, low-risk incremental migration behind an API gateway facade.',
          domainScoreWeight: 25
        }
      ]
    }
  },
  {
    id: 'docker-kubernetes-devops',
    title: 'Docker & Kubernetes Cloud DevOps',
    slug: 'docker-kubernetes-devops',
    description: 'Learn containerization best practices, multi-stage Docker builds, Kubernetes Pod orchestration, Deployments, Services, and Helm deployments.',
    category: 'Cloud & DevOps',
    skill: 'Docker',
    relatedSkills: ['Kubernetes', 'CI/CD', 'AWS', 'Container Security'],
    priority: 'Critical',
    difficulty: 'Intermediate',
    estimatedEffort: '3.0 hours',
    durationMinutes: 180,
    expectedImpact: '+20% DevOps Readiness',
    targetCompanies: ['Google', 'Microsoft', 'Stripe', 'Datadog'],
    prerequisites: ['Basic Linux CLI', 'Node.js or Python runtime knowledge'],
    learningObjectives: [
      'Write optimized, secure multi-stage Dockerfiles reducing image size by 70%+',
      'Configure Kubernetes Deployments with liveness and readiness health probes',
      'Manage ConfigMaps, Secrets, and ClusterIP / Ingress networking',
      'Implement Rolling Updates with zero downtime'
    ],
    lesson: {
      overview: 'Containers encapsulate applications and their dependencies, while Kubernetes provides declarative automated orchestration, autoscaling, and self-healing in production.',
      sections: [
        {
          title: '1. Production Multi-Stage Docker Builds',
          content: 'A naive Docker build copies compilers, package managers, and build tools into the final runtime image, inflating image size and exposing CVE vulnerabilities. Multi-stage builds compile artifacts in a builder stage and copy only the runtime binaries into a minimal distroless or alpine base.',
          codeSnippet: {
            language: 'dockerfile',
            caption: 'Production Multi-Stage Dockerfile for Node/TypeScript',
            code: `# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]`
          },
          keyTakeaway: 'Never run container processes as root; use non-root users (e.g., USER node) and distroless base images for security.'
        },
        {
          title: '2. Kubernetes Pod Lifecycle: Probes & Self-Healing',
          content: 'Kubernetes uses Liveness Probes to detect deadlocks (restarts the Pod if failed) and Readiness Probes to verify when a Pod is ready to accept user traffic (removes from Service endpoints if failing).',
          codeSnippet: {
            language: 'yaml',
            caption: 'Kubernetes Deployment with Health Probes & Resource Limits',
            code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
      - name: app
        image: payment-service:v1.2.0
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5`
          },
          keyTakeaway: 'Always configure both Liveness and Readiness probes to prevent serving 502 Bad Gateway errors during rollouts.'
        }
      ],
      summary: 'You understand multi-stage container optimization, Kubernetes declarative manifests, and zero-downtime rolling update mechanics.'
    },
    interactiveExample: {
      title: 'Interactive Kubernetes Rolling Update Simulator',
      description: 'Observe a 3-replica Pod cluster transition from v1.0.0 to v2.0.0 without dropping active traffic.',
      scenario: 'Deploying v2.0.0 with rolling update strategy (maxSurge: 1, maxUnavailable: 0).',
      simulationType: 'docker_pipeline',
      steps: [
        {
          id: 'step-1',
          instruction: 'Step 1: Check baseline cluster state (3 Pods running v1.0.0). Click "Trigger Rollout v2.0.0".',
          actionType: 'click',
          label: 'Trigger Rollout v2.0.0',
          explanation: 'Kubernetes schedules Pod 4 (v2.0.0) as a surge pod while keeping all 3 v1.0.0 pods healthy.'
        },
        {
          id: 'step-2',
          instruction: 'Step 2: Simulate Readiness Probe passing on Pod 4. Click "Validate Readiness Probe".',
          actionType: 'click',
          label: 'Validate Readiness Probe',
          explanation: 'Pod 4 begins receiving traffic. Kubernetes safely sends SIGTERM to Pod 1 (v1.0.0).'
        },
        {
          id: 'step-3',
          instruction: 'Step 3: Complete progressive replacement of remaining pods until all 3 replicas run v2.0.0.',
          actionType: 'click',
          label: 'Complete Rollout',
          explanation: 'Rollout complete with zero dropped packets and 100% continuous uptime.'
        }
      ]
    },
    codingPractice: {
      title: 'Docker Image Layer Optimization Parser',
      difficulty: 'Intermediate',
      timeLimit: '15 mins',
      description: 'Write a function `optimizeInstructionOrder(instructions)` that analyzes a list of Dockerfile instructions and returns them ordered to maximize layer caching efficiency (e.g., placing rarely changing dependency manifests before frequently changing source code).',
      constraints: [
        'Instructions must preserve valid build semantics (FROM first, CMD/ENTRYPOINT last)',
        'COPY package*.json and npm install must come before COPY . .'
      ],
      examples: [
        {
          input: '["FROM node", "COPY . .", "RUN npm install", "CMD start"]',
          output: '["FROM node", "COPY package*.json ./", "RUN npm install", "COPY . .", "CMD start"]',
          explanation: 'Splitting the copy step enables Docker layer cache reuse across source code changes.'
        }
      ],
      starterCode: {
        typescript: `export function optimizeDockerfileLayers(instructions: string[]): string[] {
  // Return optimized instruction array respecting layer caching
  const base = instructions.filter(i => i.startsWith('FROM'));
  const env = instructions.filter(i => i.startsWith('WORKDIR') || i.startsWith('ENV'));
  const deps = instructions.filter(i => i.includes('package') || i.includes('install') || i.includes('ci'));
  const src = instructions.filter(i => i.startsWith('COPY .') || i.startsWith('RUN npm run build'));
  const cmd = instructions.filter(i => i.startsWith('CMD') || i.startsWith('EXPOSE') || i.startsWith('USER'));

  return [...base, ...env, ...deps, ...src, ...cmd];
}`,
        javascript: `function optimizeDockerfileLayers(instructions) {
  const base = instructions.filter(i => i.startsWith('FROM'));
  const env = instructions.filter(i => i.startsWith('WORKDIR') || i.startsWith('ENV'));
  const deps = instructions.filter(i => i.includes('package') || i.includes('install') || i.includes('ci'));
  const src = instructions.filter(i => i.startsWith('COPY .') || i.startsWith('RUN npm run build'));
  const cmd = instructions.filter(i => i.startsWith('CMD') || i.startsWith('EXPOSE') || i.startsWith('USER'));

  return [...base, ...env, ...deps, ...src, ...cmd];
}`,
        python: `def optimize_dockerfile_layers(instructions):
    base = [i for i in instructions if i.startswith('FROM')]
    env = [i for i in instructions if i.startswith('WORKDIR') or i.startswith('ENV')]
    deps = [i for i in instructions if 'package' in i or 'install' in i or 'ci' in i]
    src = [i for i in instructions if i.startswith('COPY .') or 'build' in i]
    cmd = [i for i in instructions if i.startswith('CMD') or i.startswith('EXPOSE') or i.startswith('USER')]
    return base + env + deps + src + cmd`
      },
      solutionCode: {
        javascript: `function optimizeDockerfileLayers(instructions) {
  const base = instructions.filter(i => i.startsWith('FROM'));
  const env = instructions.filter(i => i.startsWith('WORKDIR') || i.startsWith('ENV'));
  const deps = instructions.filter(i => i.includes('package') || i.includes('install') || i.includes('ci'));
  const src = instructions.filter(i => i.startsWith('COPY .') || i.startsWith('RUN npm run build'));
  const cmd = instructions.filter(i => i.startsWith('CMD') || i.startsWith('EXPOSE') || i.startsWith('USER'));
  return [...base, ...env, ...deps, ...src, ...cmd];
}`,
        typescript: `export function optimizeDockerfileLayers(instructions: string[]): string[] {
  const base = instructions.filter(i => i.startsWith('FROM'));
  const env = instructions.filter(i => i.startsWith('WORKDIR') || i.startsWith('ENV'));
  const deps = instructions.filter(i => i.includes('package') || i.includes('install') || i.includes('ci'));
  const src = instructions.filter(i => i.startsWith('COPY .') || i.startsWith('RUN npm run build'));
  const cmd = instructions.filter(i => i.startsWith('CMD') || i.startsWith('EXPOSE') || i.startsWith('USER'));
  return [...base, ...env, ...deps, ...src, ...cmd];
}`,
        python: `def optimize_dockerfile_layers(instructions):\n    return [i for i in instructions if i.startswith('FROM')] + [i for i in instructions if not i.startswith('FROM') and not i.startswith('CMD')] + [i for i in instructions if i.startswith('CMD')]`
      },
      testCases: [
        {
          id: 'tc-1',
          input: '["FROM alpine", "COPY . .", "RUN npm ci", "CMD start"]',
          expectedOutput: 'FROM first, dependencies cached before source code',
          description: 'Validates dependency layer ordering'
        },
        {
          id: 'tc-2',
          input: '["CMD node dist", "FROM node:20", "WORKDIR /app"]',
          expectedOutput: 'FROM node:20, WORKDIR /app, CMD node dist',
          description: 'Validates base image positioning'
        }
      ]
    },
    knowledgeCheck: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'kc-1',
          question: 'Why should package.json and lockfiles be copied BEFORE the application source code in a Dockerfile?',
          options: [
            'Docker refuses to compile JavaScript without package.json in the root folder',
            'To leverage Docker layer caching so npm install only runs when dependencies change',
            'To reduce memory consumption during container runtime',
            'Because Dockerfiles execute commands in alphabetical order'
          ],
          correctIndex: 1,
          explanation: 'Docker caches image layers. By copying package manifests first, npm install will be skipped on build if dependencies have not changed.'
        },
        {
          id: 'kc-2',
          question: 'What is the main difference between a Kubernetes Liveness probe and a Readiness probe?',
          options: [
            'Liveness probes verify CPU usage; Readiness probes verify disk space',
            'Liveness probes restart failed Pods; Readiness probes remove unready Pods from Service load balancer endpoints without restarting them',
            'Readiness probes only run on worker nodes; Liveness probes run on master nodes',
            'There is no difference; they are aliases for the same health check'
          ],
          correctIndex: 1,
          explanation: 'Readiness controls whether a pod gets traffic; Liveness controls whether a deadlocked pod is killed and recreated.'
        },
        {
          id: 'kc-3',
          question: 'Which Kubernetes resource is used to expose an internal deployment to external HTTP/HTTPS traffic with URL routing and TLS termination?',
          options: [
            'ClusterIP Service',
            'Ingress Controller / Ingress Resource',
            'DaemonSet',
            'PersistentVolumeClaim'
          ],
          correctIndex: 1,
          explanation: 'Ingress manages external HTTP/S routing rules, SSL termination, and path-based routing to internal cluster services.'
        }
      ]
    },
    finalAssessment: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'fa-1',
          scenario: 'During a production deployment, newly created Pods take 45 seconds to warm up their internal database caches. Users are receiving 502 Bad Gateway errors for 45 seconds after each release.',
          question: 'How should the deployment manifest be fixed?',
          options: [
            'Increase initialDelaySeconds on the Liveness probe to 1000s',
            'Configure a Readiness probe that tests cache warmup and set maxUnavailable: 0 in the rolling update strategy',
            'Delete the Service object and recreate it manually',
            'Remove resource limits from the container'
          ],
          correctIndex: 1,
          explanation: 'The Readiness probe prevents Kubernetes from routing traffic to new pods until their cache warmup completes, and maxUnavailable: 0 guarantees existing healthy pods stay active.',
          domainScoreWeight: 34
        },
        {
          id: 'fa-2',
          scenario: 'A Node.js API container experiences a fatal Out-Of-Memory (OOM) error and is terminated by the Linux kernel with exit code 137.',
          question: 'Which Kubernetes configuration caused this termination?',
          options: [
            'The container exceeded its memory limit defined in the pod spec',
            'The ConfigMap expired',
            'The container had too many open file descriptors on disk',
            'The replica count was set to 0'
          ],
          correctIndex: 0,
          explanation: 'When a container attempts to allocate memory beyond its configured spec.resources.limits.memory, the kernel OOM killer terminates it with signal 9 (exit code 137).',
          domainScoreWeight: 33
        },
        {
          id: 'fa-3',
          scenario: 'You need to securely provide database passwords and API keys to a microservice pod in production.',
          question: 'What is the recommended Kubernetes security practice?',
          options: [
            'Hardcode credentials into the Dockerfile ENV instructions',
            'Store them in a Git repository inside a plain text config.json',
            'Use Kubernetes Secret objects mounted as environment variables or secret volumes, backed by an external secrets manager (AWS Secrets Manager / HashiCorp Vault)',
            'Pass credentials via URL query parameters in HTTP GET requests'
          ],
          correctIndex: 2,
          explanation: 'Secrets should be decoupled from container images and Git repositories, mounted dynamically via Kubernetes Secrets or external secret operators.',
          domainScoreWeight: 33
        }
      ]
    }
  },
  {
    id: 'advanced-react-performance',
    title: 'Advanced React Architecture & Performance',
    slug: 'advanced-react-performance',
    description: 'Master custom hook composition, fiber reconciliation internals, memoization strategies, code splitting, and web vitals optimization.',
    category: 'Frontend Engineering',
    skill: 'React',
    relatedSkills: ['TypeScript', 'State Management', 'Web Vitals', 'Next.js'],
    priority: 'High',
    difficulty: 'Advanced',
    estimatedEffort: '2.5 hours',
    durationMinutes: 150,
    expectedImpact: '+15% Frontend Mastery',
    targetCompanies: ['Meta', 'Airbnb', 'Stripe', 'Vercel'],
    prerequisites: ['React Fundamentals', 'JavaScript ES6+'],
    learningObjectives: [
      'Understand React Fiber render vs commit phases and reconciliation mechanics',
      'Optimize re-renders using useMemo, useCallback, and React.memo without premature optimization anti-patterns',
      'Implement code splitting with React.lazy and Suspense boundaries',
      'Diagnose and fix layout shifts (CLS) and long tasks (INP)'
    ],
    lesson: {
      overview: 'High-performance React applications balance responsive UI interactivity with clean state architecture.',
      sections: [
        {
          title: '1. React Fiber & The Two-Phase Render Lifecycle',
          content: 'React split rendering into the Render Phase (pure calculation, interruptible) and the Commit Phase (DOM mutations, synchronous). Understanding this distinction prevents writing side effects inside component render functions.',
          codeSnippet: {
            language: 'typescript',
            caption: 'Custom useDebounce Hook with Abort Signal',
            code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}`
          },
          keyTakeaway: 'Keep render functions pure. Never invoke async network requests or DOM writes during render evaluation.'
        },
        {
          title: '2. Avoiding Re-render Waterfalls',
          content: 'Passing unstable object literals or inline functions down to memoized children breaks memoization comparison. Use primitive selectors or stable callbacks to preserve reference identity.',
          keyTakeaway: 'Always measure with React DevTools Profiler before wrapping components in React.memo.'
        }
      ],
      summary: 'You have mastered React reconciliation, memoization trade-offs, and Suspense patterns.'
    },
    interactiveExample: {
      title: 'Interactive React Render Tree Profiler',
      description: 'Interact with a nested parent-child component tree and compare un-memoized re-renders vs optimized memoization.',
      scenario: 'Parent counter updates while a heavy list of 1,000 items is rendered below.',
      simulationType: 'react_render_tree',
      steps: [
        {
          id: 'step-1',
          instruction: 'Step 1: Click "Increment Counter (Un-optimized)" and observe how all 1000 child rows re-render.',
          actionType: 'click',
          label: 'Increment Counter (Un-optimized)',
          explanation: '1000 child components re-rendered unnecessarily (Render time: 42ms).'
        },
        {
          id: 'step-2',
          instruction: 'Step 2: Enable React.memo and useCallback wrapper.',
          actionType: 'toggle',
          label: 'Enable React.memo & useCallback',
          explanation: 'Memoization enabled. Child row props now pass shallow equality check.'
        },
        {
          id: 'step-3',
          instruction: 'Step 3: Click "Increment Counter (Optimized)" to verify only the header re-renders.',
          actionType: 'click',
          label: 'Increment Counter (Optimized)',
          explanation: '0 child re-renders. Render execution dropped from 42ms to 0.8ms.'
        }
      ]
    },
    codingPractice: {
      title: 'Write a Custom usePrevious Hook',
      difficulty: 'Intermediate',
      timeLimit: '10 mins',
      description: 'Implement a generic custom hook `usePrevious<T>(value: T): T | undefined` that returns the previous value of the provided state on the preceding render.',
      constraints: [
        'Must use React useRef and useEffect',
        'Must return undefined on the initial render'
      ],
      examples: [
        {
          input: 'Render 1: value = "A" -> returns undefined. Render 2: value = "B" -> returns "A"',
          output: 'undefined, then "A"',
          explanation: 'Ref updates in useEffect after render returns current value.'
        }
      ],
      starterCode: {
        typescript: `import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}`,
        javascript: `import { useRef, useEffect } from 'react';

export function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}`,
        python: `# React custom hooks are implemented in TypeScript/JavaScript`
      },
      solutionCode: {
        javascript: `import { useRef, useEffect } from 'react';
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}`,
        typescript: `import { useRef, useEffect } from 'react';
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
}`,
        python: `# N/A`
      },
      testCases: [
        {
          id: 'tc-1',
          input: 'Initial render with count=0',
          expectedOutput: 'undefined',
          description: 'First render has no preceding state'
        },
        {
          id: 'tc-2',
          input: 'Second render with count=1',
          expectedOutput: '0',
          description: 'Returns previous render value'
        }
      ]
    },
    knowledgeCheck: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'kc-1',
          question: 'Why should you NOT use Math.random() as the "key" prop in a React mapped array list?',
          options: [
            'React keys must be integers only',
            'Generating a new key on every render forces React to destroy and recreate the entire DOM subtree, losing focus and state',
            'Math.random() is deprecated in modern browsers',
            'Keys cannot exceed 8 characters'
          ],
          correctIndex: 1,
          explanation: 'Unstable keys force unmounting and remounting of elements on every render, destroying component state and devastating performance.'
        },
        {
          id: 'kc-2',
          question: 'When does code inside useEffect run relative to browser paint?',
          options: [
            'Synchronously before the browser paints the screen',
            'Asynchronously after the browser finishes layout and paint',
            'During the JavaScript compiler parsing phase',
            'Only when a user clicks a button'
          ],
          correctIndex: 1,
          explanation: 'useEffect runs asynchronously after layout and paint to avoid blocking screen updates. (useLayoutEffect runs synchronously before paint).'
        }
      ]
    },
    finalAssessment: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'fa-1',
          scenario: 'A dashboard renders a real-time crypto price table with 500 rows updating twice every second. Typing in an unrelated search bar input feels sluggish and laggy.',
          question: 'Which modern React pattern resolves the typing responsiveness issue?',
          options: [
            'useTransition or useDeferredValue to mark table filter updates as non-blocking transition updates while keeping input state immediate',
            'Wrap the input in a while(true) loop',
            'Remove all CSS styling from the table',
            'Move the search bar into an iframe'
          ],
          correctIndex: 0,
          explanation: 'useTransition prioritizes urgent interactions (typing in input) over heavy rendering work (500 row table updates).'
        },
        {
          id: 'fa-2',
          scenario: 'A complex web app bundle is 4.8MB, causing a 6.2-second First Contentful Paint on mobile 4G networks.',
          question: 'What is the most impactful architectural optimization to implement first?',
          options: [
            'Route-based code splitting using React.lazy and Suspense boundaries so users only download the bundle for their active view',
            'Inlining all images into base64 strings inside index.html',
            'Disabling HTTPS encryption',
            'Converting all components into class components'
          ],
          correctIndex: 0,
          explanation: 'Route-level code splitting reduces initial bundle size significantly by lazy-loading non-critical route chunks on demand.'
        }
      ]
    }
  },
  {
    id: 'dsa-dynamic-programming',
    title: 'Data Structures & Dynamic Programming',
    slug: 'dsa-dynamic-programming',
    description: 'Master memoization, tabulation, state space formulation, interval DP, and graph shortest-path algorithms for Tier-1 coding interviews.',
    category: 'Data Structures & Algorithms',
    skill: 'Algorithms',
    relatedSkills: ['Data Structures', 'Problem Solving', 'Python', 'C++'],
    priority: 'Critical',
    difficulty: 'Advanced',
    estimatedEffort: '4.0 hours',
    durationMinutes: 240,
    expectedImpact: '+22% Technical Interview Probability',
    targetCompanies: ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft'],
    prerequisites: ['Recursion & Big-O Notation', 'Arrays & Hash Maps'],
    learningObjectives: [
      'Identify overlapping subproblems and optimal substructure in algorithmic problems',
      'Formulate state transitions for 1D and 2D dynamic programming matrices',
      'Convert Top-Down memoized recursion into Bottom-Up space-optimized tabulation',
      'Solve 0/1 Knapsack, Longest Common Subsequence, and Coin Change variants'
    ],
    lesson: {
      overview: 'Dynamic Programming breaks complex exponential problems into polynomial subproblems by storing already calculated states.',
      sections: [
        {
          title: '1. The DP Framework: State, Base Case, and Transition',
          content: 'Every dynamic programming solution consists of: (1) Defining what dp[i] represents, (2) Identifying the recurrence relation dp[i] = f(dp[i-1], dp[i-2]...), and (3) Initializing base cases.',
          codeSnippet: {
            language: 'typescript',
            caption: 'Coin Change (Bottom-Up Tabulation)',
            code: `function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // 0 coins needed for amount 0

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`
          },
          keyTakeaway: 'Always analyze space complexity. If dp[i] only depends on dp[i-1], reduce space from O(N) to O(1).'
        }
      ],
      summary: 'You have mastered DP state formulation, top-down vs bottom-up trade-offs, and space optimization.'
    },
    interactiveExample: {
      title: 'Interactive Coin Change DP Table Visualizer',
      description: 'Step through the calculation of Coin Change for amount = 6 using coins [1, 2, 5].',
      scenario: 'Computing minimum coins for amounts 0 through 6.',
      simulationType: 'algorithm_trace',
      steps: [
        {
          id: 'step-1',
          instruction: 'Step 1: Initialize base case dp[0] = 0. Click "Initialize Base Case".',
          actionType: 'click',
          label: 'Initialize Base Case',
          explanation: 'dp array initialized: [0, inf, inf, inf, inf, inf, inf].'
        },
        {
          id: 'step-2',
          instruction: 'Step 2: Process coin 1 across all amounts.',
          actionType: 'click',
          label: 'Evaluate Coin 1',
          explanation: 'Using coin 1: dp[1]=1, dp[2]=2, dp[3]=3, dp[4]=4, dp[5]=5, dp[6]=6.'
        },
        {
          id: 'step-3',
          instruction: 'Step 3: Process coin 5 for amount 6 (dp[6] = min(6, dp[6-5] + 1) = min(6, 1+1) = 2).',
          actionType: 'click',
          label: 'Evaluate Coin 5 (Optimal)',
          explanation: 'Optimal result found: 2 coins (1x5 + 1x1 = 6).'
        }
      ]
    },
    codingPractice: {
      title: 'Climbing Stairs (Min Cost Climbing Stairs)',
      difficulty: 'Intermediate',
      timeLimit: '15 mins',
      description: 'You are given an integer array `cost` where `cost[i]` is the cost of `i-th` step on a staircase. Once you pay the cost, you can either climb one or two steps. You can either start from index 0, or index 1. Return the minimum cost to reach the top of the floor (index `cost.length`).',
      constraints: [
        '2 <= cost.length <= 1000',
        '0 <= cost[i] <= 999'
      ],
      examples: [
        {
          input: 'cost = [10, 15, 20]',
          output: '15',
          explanation: 'Start at index 1, pay 15 and climb two steps to reach the top.'
        }
      ],
      starterCode: {
        typescript: `export function minCostClimbingStairs(cost: number[]): number {
  let prev2 = cost[0];
  let prev1 = cost[1];

  for (let i = 2; i < cost.length; i++) {
    const current = cost[i] + Math.min(prev1, prev2);
    prev2 = prev1;
    prev1 = current;
  }

  return Math.min(prev1, prev2);
}`,
        javascript: `function minCostClimbingStairs(cost) {
  let prev2 = cost[0];
  let prev1 = cost[1];

  for (let i = 2; i < cost.length; i++) {
    const current = cost[i] + Math.min(prev1, prev2);
    prev2 = prev1;
    prev1 = current;
  }

  return Math.min(prev1, prev2);
}`,
        python: `def min_cost_climbing_stairs(cost: list[int]) -> int:
    prev2, prev1 = cost[0], cost[1]
    for i in range(2, len(cost)):
        curr = cost[i] + min(prev1, prev2)
        prev2 = prev1
        prev1 = curr
    return min(prev1, prev2)`
      },
      solutionCode: {
        javascript: `function minCostClimbingStairs(cost) {
  let prev2 = cost[0];
  let prev1 = cost[1];
  for (let i = 2; i < cost.length; i++) {
    const current = cost[i] + Math.min(prev1, prev2);
    prev2 = prev1;
    prev1 = current;
  }
  return Math.min(prev1, prev2);
}`,
        typescript: `export function minCostClimbingStairs(cost: number[]): number {
  let prev2 = cost[0];
  let prev1 = cost[1];
  for (let i = 2; i < cost.length; i++) {
    const current = cost[i] + Math.min(prev1, prev2);
    prev2 = prev1;
    prev1 = current;
  }
  return Math.min(prev1, prev2);
}`,
        python: `def min_cost_climbing_stairs(cost):\n    p2, p1 = cost[0], cost[1]\n    for i in range(2, len(cost)):\n        c = cost[i] + min(p1, p2)\n        p2, p1 = p1, c\n    return min(p1, p2)`
      },
      testCases: [
        {
          id: 'tc-1',
          input: 'cost = [10, 15, 20]',
          expectedOutput: '15',
          description: 'Basic stair traversal'
        },
        {
          id: 'tc-2',
          input: 'cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]',
          expectedOutput: '6',
          description: 'Multi-step optimal detour avoiding high penalties'
        }
      ]
    },
    knowledgeCheck: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'kc-1',
          question: 'What two properties must a problem have to be solvable via Dynamic Programming?',
          options: [
            'Prime numbers and continuous functions',
            'Overlapping subproblems and optimal substructure',
            'Sorted inputs and non-negative values',
            'Single-thread execution and constant memory'
          ],
          correctIndex: 1,
          explanation: 'Overlapping subproblems allow caching; optimal substructure ensures global optimal solutions can be constructed from optimal subproblem solutions.'
        },
        {
          id: 'kc-2',
          question: 'What is the time complexity of the classic 0/1 Knapsack problem with N items and Capacity W?',
          options: [
            'O(N log N)',
            'O(N * W) (Pseudo-polynomial)',
            'O(2^N)',
            'O(N + W)'
          ],
          correctIndex: 1,
          explanation: 'The DP matrix table is of size N x W, requiring O(N * W) time and space.'
        }
      ]
    },
    finalAssessment: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'fa-1',
          scenario: 'You are asked to compute the Longest Common Subsequence between two strings of length N and M in an interview.',
          question: 'How should you optimize space complexity if only the length of the LCS is required?',
          options: [
            'Keep only the current and previous rows of the DP table, reducing space from O(N*M) to O(min(N, M))',
            'Use a recursive function with no base cases',
            'Convert strings to integers and perform bitwise XOR',
            'Store results in a single boolean variable'
          ],
          correctIndex: 0,
          explanation: 'Because dp[i][j] only relies on row i and row i-1, you can maintain just 2 rows, optimizing space to O(min(N, M)).'
        }
      ]
    }
  },
  {
    id: 'database-indexing-optimization',
    title: 'PostgreSQL Indexing & Query Optimization',
    slug: 'database-indexing-optimization',
    description: 'Deep dive into B-Tree vs GIN indexes, EXPLAIN ANALYZE execution plans, connection pooling, and locking strategies.',
    category: 'Database & Storage',
    skill: 'Database Optimization',
    relatedSkills: ['PostgreSQL', 'SQL', 'Redis', 'Performance Tuning'],
    priority: 'Medium',
    difficulty: 'Intermediate',
    estimatedEffort: '2.5 hours',
    durationMinutes: 150,
    expectedImpact: '+16% Backend Database Proficiency',
    targetCompanies: ['Uber', 'Stripe', 'Airbnb', 'DoorDash'],
    prerequisites: ['Basic SQL Queries', 'Relational Schema Design'],
    learningObjectives: [
      'Read and interpret EXPLAIN (ANALYZE, BUFFERS) query plans',
      'Create composite indexes respecting left-to-right prefix rules',
      'Optimize slow sequential scans into fast index index-only scans',
      'Implement transaction isolation levels to prevent deadlocks'
    ],
    lesson: {
      overview: 'Database indexing is the single highest-leverage lever for optimizing backend API latency and reducing server compute costs.',
      sections: [
        {
          title: '1. B-Tree Indexes & Composite Index Rules',
          content: 'A B-Tree index stores sorted pointers to table pages. A composite index on (tenant_id, created_at, status) can accelerate queries filtering by (tenant_id) or (tenant_id, created_at), but CANNOT accelerate a query filtering only on (status).',
          codeSnippet: {
            language: 'sql',
            caption: 'Creating Partial and Composite Indexes in PostgreSQL',
            code: `-- Composite Index for multi-column filtering and sorting
CREATE INDEX idx_orders_tenant_created 
ON orders (tenant_id, created_at DESC) 
WHERE status = 'ACTIVE';`
          },
          keyTakeaway: 'Always place high-cardinality equality filter columns first in composite indexes, followed by range/sort columns.'
        }
      ],
      summary: 'You understand execution plans, B-Tree internals, and partial indexing strategies.'
    },
    interactiveExample: {
      title: 'Interactive Query Plan Optimizer (EXPLAIN ANALYZE)',
      description: 'Analyze an expensive Sequential Scan on a 2,000,000 row table and add the optimal index to achieve an Index Scan.',
      scenario: 'Query: SELECT * FROM users WHERE email = "candidate@example.com" (Execution Time: 340ms, Cost: 48,000).',
      simulationType: 'database_index',
      steps: [
        {
          id: 'step-1',
          instruction: 'Step 1: Inspect baseline query plan with no index. Click "Run EXPLAIN ANALYZE".',
          actionType: 'click',
          label: 'Run EXPLAIN ANALYZE',
          explanation: 'Seq Scan on users (Cost: 48,000, Rows: 2,000,000, Time: 342ms).'
        },
        {
          id: 'step-2',
          instruction: 'Step 2: Add UNIQUE B-Tree Index on email column.',
          actionType: 'click',
          label: 'CREATE UNIQUE INDEX idx_users_email',
          explanation: 'Index built on users(email).'
        },
        {
          id: 'step-3',
          instruction: 'Step 3: Re-run query to observe Index-Only Scan.',
          actionType: 'click',
          label: 'Re-run Query Plan',
          explanation: 'Index Scan using idx_users_email (Cost: 8.2, Time: 0.12ms). Query speed increased by 2800x.'
        }
      ]
    },
    knowledgeCheck: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'kc-1',
          question: 'In PostgreSQL, what is an "Index-Only Scan"?',
          options: [
            'A query scan that returns no results',
            'A query execution where all requested columns exist inside the index leaf pages, eliminating the need to read the table heap',
            'A scan that only works for primary keys',
            'A deprecated query hint in MySQL'
          ],
          correctIndex: 1,
          explanation: 'Index-Only Scans read directly from the index structure without fetching row data from table storage pages (heap).'
        }
      ]
    },
    finalAssessment: {
      passingScorePercent: 75,
      questions: [
        {
          id: 'fa-1',
          scenario: 'A slow query: SELECT * FROM events WHERE org_id = 42 AND created_at > "2024-01-01" ORDER BY created_at DESC.',
          question: 'Which index definition provides the best performance?',
          options: [
            'CREATE INDEX idx_events ON events (org_id, created_at DESC)',
            'CREATE INDEX idx_events ON events (created_at)',
            'CREATE INDEX idx_events ON events (id)',
            'No index; use client-side filtering'
          ],
          correctIndex: 0,
          explanation: 'Placing equality column org_id first followed by range/order column created_at allows direct index traversal and eliminates sorting overhead.'
        }
      ]
    }
  }
];

// Helper: Retrieve user-scoped storage key
export function getUserLearningStorageKey(userId?: string): string {
  if (!userId) return 'smarthireai_guest_learning_progress';
  return `smarthireai_user_${userId}_learning_progress`;
}

// Helper: Load all module progress records for a user
export function loadUserLearningProgress(userId?: string): Record<string, UserModuleProgress> {
  try {
    const key = getUserLearningStorageKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load user learning progress:', e);
  }
  return {};
}

// Helper: Save progress for a specific module
export function saveUserModuleProgress(
  userId: string | undefined, 
  moduleId: string, 
  progress: Partial<UserModuleProgress>
): UserModuleProgress {
  const all = loadUserLearningProgress(userId);
  const existing = all[moduleId] || {
    moduleId,
    status: 'IN_PROGRESS',
    currentStage: 0,
    completedStages: [],
    stageProgress: {
      lessonCompleted: false,
      exampleCompleted: false,
      practiceCompleted: false,
      quizCompleted: false,
      assessmentCompleted: false,
    },
    lastAccessedAt: new Date().toISOString(),
    progressPercent: 0
  };

  const updated: UserModuleProgress = {
    ...existing,
    ...progress,
    lastAccessedAt: new Date().toISOString()
  };

  // Compute progress percentage based on 5 stages (each stage is 20%)
  const completedCount = updated.completedStages.length;
  updated.progressPercent = Math.min(100, completedCount * 20);

  if (updated.completedStages.includes(4) && updated.stageProgress.assessmentCompleted) {
    updated.status = 'COMPLETED';
    updated.progressPercent = 100;
    if (!updated.completedAt) {
      updated.completedAt = new Date().toISOString();
    }
  } else if (updated.completedStages.length > 0) {
    updated.status = 'IN_PROGRESS';
  }

  all[moduleId] = updated;

  try {
    const key = getUserLearningStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to persist user learning progress:', e);
  }

  return updated;
}

// Helper: Generate synthesized module recommendations tailored to activeResume
export function getTailoredRoadmapModules(
  activeResume: any | null,
  isDemoMode: boolean,
  userId?: string
): { modules: LearningModuleData[]; summary: LearningRoadmapSummary } {
  const userProgress = loadUserLearningProgress(userId);

  // If no resume and demo mode off, return empty
  if (!activeResume && !isDemoMode) {
    return {
      modules: [],
      summary: {
        totalModules: 0,
        completedModules: 0,
        inProgressModules: 0,
        notStartedModules: 0,
        overallProgressPercent: 0,
        estimatedHoursRemaining: 0,
        criticalGapsCovered: 0,
        targetRoleReadinessBoost: 0
      }
    };
  }

  // Determine user skills
  const resumeSkills: string[] = activeResume?.skills || activeResume?.parsedContent?.skills || [];
  const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());

  // Prioritize modules where skill is missing or is critical
  const modulesWithContext = CURATED_LEARNING_MODULES.map(module => {
    const hasSkill = resumeSkillsLower.some(s => 
      module.skill.toLowerCase().includes(s) || s.includes(module.skill.toLowerCase())
    );

    // Adjust priority based on resume gap
    const priority = !hasSkill ? (module.priority === 'Critical' ? 'Critical' : 'High') : module.priority;

    return {
      ...module,
      priority
    };
  });

  // Calculate summary metrics
  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;
  let totalPercentSum = 0;
  let hoursRemaining = 0;

  modulesWithContext.forEach(m => {
    const prog = userProgress[m.id];
    const status = prog?.status || 'NOT_STARTED';
    const percent = prog?.progressPercent || 0;

    totalPercentSum += percent;

    if (status === 'COMPLETED') {
      completedCount++;
    } else if (status === 'IN_PROGRESS') {
      inProgressCount++;
      const effortHours = m.durationMinutes / 60;
      hoursRemaining += effortHours * (1 - percent / 100);
    } else {
      notStartedCount++;
      hoursRemaining += m.durationMinutes / 60;
    }
  });

  const overallProgressPercent = modulesWithContext.length > 0 
    ? Math.round(totalPercentSum / modulesWithContext.length) 
    : 0;

  const summary: LearningRoadmapSummary = {
    totalModules: modulesWithContext.length,
    completedModules: completedCount,
    inProgressModules: inProgressCount,
    notStartedModules: notStartedCount,
    overallProgressPercent,
    estimatedHoursRemaining: Math.round(hoursRemaining * 10) / 10,
    criticalGapsCovered: completedCount,
    targetRoleReadinessBoost: Math.min(35, completedCount * 9)
  };

  return {
    modules: modulesWithContext,
    summary
  };
}
