import { 
  InterviewType, 
  InterviewQuestion 
} from '../types/interview';

export function getMockInterviewQuestions(
  type: InterviewType,
  role: string = 'Software Engineer',
  company?: string
): InterviewQuestion[] {
  const companyPrefix = company ? ` at ${company}` : '';

  switch (type) {
    case 'Coding':
      return [
        {
          id: 'code-1',
          number: 1,
          format: 'coding',
          category: 'Array & Two Pointers',
          difficulty: 'Medium',
          title: 'Longest Subarray with Sum Equal to K',
          prompt: `Given an integer array \`nums\` and an integer \`k\`, return the maximum length of a subarray that sums to \`k\`. If there isn't one, return 0.`,
          contextOrScenario: `A critical caching and telemetry ingestion engine${companyPrefix} requires sliding time-series windows where target packet metrics hit exact thresholds.`,
          constraints: [
            '1 <= nums.length <= 10^5',
            '-10^4 <= nums[i] <= 10^4',
            '-10^9 <= k <= 10^9',
            'Optimal time complexity: O(n)',
            'Optimal space complexity: O(n) with Hash Map'
          ],
          sampleInputOutput: [
            {
              input: 'nums = [1, -1, 5, -2, 3], k = 3',
              output: '4',
              explanation: 'The subarray [1, -1, 5, -2] sums to 3 and has a length of 4.'
            },
            {
              input: 'nums = [-2, -1, 2, 1], k = 1',
              output: '2',
              explanation: 'The subarray [-1, 2] sums to 1 and has a length of 2.'
            }
          ],
          initialCode: `function maxSubArrayLen(nums: number[], k: number): number {
  // Implement your O(N) prefix sum + hash map solution
  const map = new Map<number, number>();
  map.set(0, -1);
  let maxLen = 0;
  let prefixSum = 0;

  for (let i = 0; i < nums.length; i++) {
    prefixSum += nums[i];
    
    if (map.has(prefixSum - k)) {
      maxLen = Math.max(maxLen, i - (map.get(prefixSum - k)!));
    }
    
    if (!map.has(prefixSum)) {
      map.set(prefixSum, i);
    }
  }

  return maxLen;
}`,
          language: 'typescript',
          testCases: [
            { id: 'tc-1', input: '[1, -1, 5, -2, 3], 3', expectedOutput: '4', description: 'Standard mixed positive and negative integers' },
            { id: 'tc-2', input: '[-2, -1, 2, 1], 1', expectedOutput: '2', description: 'Subarray from non-zero index' },
            { id: 'tc-3', input: '[1, 2, 3], 6', expectedOutput: '3', description: 'Entire array is the sum' },
            { id: 'tc-4', input: '[1, 2, 3], 7', expectedOutput: '0', description: 'No valid subarray exists' }
          ],
          hint: 'Think about storing the cumulative prefix sum in a hash map and checking if (currentPrefix - k) has been observed previously.'
        },
        {
          id: 'code-2',
          number: 2,
          format: 'coding',
          category: 'Tree & Recursion',
          difficulty: 'Medium',
          title: 'Lowest Common Ancestor in Binary Tree',
          prompt: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes \`p\` and \`q\` in the tree.`,
          contextOrScenario: `Used in distributed permission hierarchies and lineage graphs to identify the closest common security barrier or root controller.`,
          constraints: [
            'The number of nodes in the tree is in the range [2, 10^5].',
            '-10^9 <= Node.val <= 10^9',
            'All Node.val are unique.',
            'p != q and both p and q exist in the tree.'
          ],
          sampleInputOutput: [
            {
              input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1',
              output: '3',
              explanation: 'The LCA of nodes 5 and 1 is node 3.'
            },
            {
              input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4',
              output: '5',
              explanation: 'The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself.'
            }
          ],
          initialCode: `class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val===undefined ? 0 : val);
    this.left = (left===undefined ? null : left);
    this.right = (right===undefined ? null : right);
  }
}

function lowestCommonAncestor(root: TreeNode | null, p: TreeNode, q: TreeNode): TreeNode | null {
  if (!root || root === p || root === q) {
    return root;
  }

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) {
    return root;
  }

  return left ? left : right;
}`,
          language: 'typescript',
          testCases: [
            { id: 'tc-1', input: 'root, node(5), node(1)', expectedOutput: 'node(3)', description: 'LCA across root boundaries' },
            { id: 'tc-2', input: 'root, node(5), node(4)', expectedOutput: 'node(5)', description: 'LCA where node is ancestor of the other' }
          ],
          hint: 'Recursively search left and right subtrees. If both return non-null, root is the LCA.'
        },
        {
          id: 'code-3',
          number: 3,
          format: 'coding',
          category: 'Dynamic Programming',
          difficulty: 'Hard',
          title: 'Longest Increasing Subsequence',
          prompt: `Given an integer array \`nums\`, return the length of the longest strictly increasing subsequence. Optimize to O(N log N) using binary search.`,
          constraints: [
            '1 <= nums.length <= 2500',
            '-10^4 <= nums[i] <= 10^4'
          ],
          sampleInputOutput: [
            {
              input: 'nums = [10,9,2,5,3,7,101,18]',
              output: '4',
              explanation: 'The longest increasing subsequence is [2,3,7,101], therefore the length is 4.'
            }
          ],
          initialCode: `function lengthOfLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  const tails: number[] = [];

  for (const num of nums) {
    let left = 0;
    let right = tails.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    if (left === tails.length) {
      tails.push(num);
    } else {
      tails[left] = num;
    }
  }

  return tails.length;
}`,
          language: 'typescript',
          testCases: [
            { id: 'tc-1', input: '[10,9,2,5,3,7,101,18]', expectedOutput: '4', description: 'Standard sequence with jumps' },
            { id: 'tc-2', input: '[0,1,0,3,2,3]', expectedOutput: '4', description: 'Duplicates and non-strict increases' },
            { id: 'tc-3', input: '[7,7,7,7,7,7,7]', expectedOutput: '1', description: 'Identical elements' }
          ],
          hint: 'Maintain an array `tails` representing the smallest tail of all increasing subsequences of various lengths.'
        },
        {
          id: 'code-4',
          number: 4,
          format: 'coding',
          category: 'String & Sliding Window',
          difficulty: 'Medium',
          title: 'Longest Substring Without Repeating Characters',
          prompt: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
          constraints: [
            '0 <= s.length <= 5 * 10^4',
            's consists of English letters, digits, symbols and spaces.'
          ],
          sampleInputOutput: [
            { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
            { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length 1.' }
          ],
          initialCode: `function lengthOfLongestSubstring(s: string): number {
  const charIndexMap = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (charIndexMap.has(char) && charIndexMap.get(char)! >= left) {
      left = charIndexMap.get(char)! + 1;
    }
    charIndexMap.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}`,
          language: 'typescript',
          testCases: [
            { id: 'tc-1', input: '"abcabcbb"', expectedOutput: '3', description: 'Repeating characters in cycles' },
            { id: 'tc-2', input: '"bbbbb"', expectedOutput: '1', description: 'All characters identical' },
            { id: 'tc-3', input: '"pwwkew"', expectedOutput: '3', description: 'Valid substring within longer sequence' }
          ],
          hint: 'Use sliding window with two pointers and track last seen character indices in a map.'
        }
      ];

    case 'Aptitude':
      return [
        {
          id: 'apt-1',
          number: 1,
          format: 'mcq',
          category: 'Time & Work',
          difficulty: 'Medium',
          title: 'Work Rate and Pipeline Capacity',
          prompt: 'If 12 engineers can complete a deployment pipeline sprint in 14 days working 8 hours a day, how many days will 8 engineers take to complete the same pipeline working 7 hours a day?',
          contextOrScenario: 'Standard engineering capacity estimation problem for team delivery velocity.',
          mcqOptions: [
            { id: 'opt-a', text: '21 days' },
            { id: 'opt-b', text: '24 days' },
            { id: 'opt-c', text: '28 days' },
            { id: 'opt-d', text: '18 days' }
          ],
          correctOptionId: 'opt-b',
          explanation: 'Total man-hours = 12 * 14 * 8 = 1344 hours. Required days for 8 engineers working 7 hours/day = 1344 / (8 * 7) = 1344 / 56 = 24 days.'
        },
        {
          id: 'apt-2',
          number: 2,
          format: 'mcq',
          category: 'Probability & Permutations',
          difficulty: 'Medium',
          title: 'Network Packet Collision Probability',
          prompt: 'A network router randomly sends 3 data packets into 4 available parallel channels. What is the probability that all 3 packets are sent to different channels?',
          contextOrScenario: 'Evaluates probability distribution in load balancer hashing and slot routing.',
          mcqOptions: [
            { id: 'opt-a', text: '3/8 (37.5%)' },
            { id: 'opt-b', text: '1/4 (25.0%)' },
            { id: 'opt-c', text: '5/16 (31.25%)' },
            { id: 'opt-d', text: '9/16 (56.25%)' }
          ],
          correctOptionId: 'opt-a',
          explanation: 'Total ways to assign 3 packets into 4 channels = 4^3 = 64. Favorable ways (all distinct) = 4 * 3 * 2 = 24. Probability = 24/64 = 3/8 = 37.5%.'
        },
        {
          id: 'apt-3',
          number: 3,
          format: 'mcq',
          category: 'Logical Deduction',
          difficulty: 'Easy',
          title: 'Microservice Dependency Order',
          prompt: 'Service A must boot before Service B. Service C boots after Service B but before Service D. Service E boots before Service A. Which service boots exactly third in sequence?',
          contextOrScenario: 'Topological dependency reasoning during cloud orchestration.',
          mcqOptions: [
            { id: 'opt-a', text: 'Service A' },
            { id: 'opt-b', text: 'Service B' },
            { id: 'opt-c', text: 'Service C' },
            { id: 'opt-d', text: 'Service E' }
          ],
          correctOptionId: 'opt-b',
          explanation: 'Sequence: E -> A -> B -> C -> D. The third service in order is Service B.'
        },
        {
          id: 'apt-4',
          number: 4,
          format: 'mcq',
          category: 'Data Interpretation',
          difficulty: 'Medium',
          title: 'Server Latency Percentiles',
          prompt: 'A database queries 200,000 requests. 95% of queries execute in under 15ms, 99% execute in under 45ms, and the remaining 1% take between 45ms and 300ms. How many total queries took more than 15ms?',
          contextOrScenario: 'Interpreting P95/P99 latency Service Level Objectives (SLOs).',
          mcqOptions: [
            { id: 'opt-a', text: '2,000 queries' },
            { id: 'opt-b', text: '10,000 queries' },
            { id: 'opt-c', text: '8,000 queries' },
            { id: 'opt-d', text: '5,000 queries' }
          ],
          correctOptionId: 'opt-b',
          explanation: 'If 95% are under 15ms, then 5% took >= 15ms. 5% of 200,000 = 0.05 * 200,000 = 10,000 queries.'
        },
        {
          id: 'apt-5',
          number: 5,
          format: 'mcq',
          category: 'Quantitative Arithmetic',
          difficulty: 'Easy',
          title: 'Storage Growth & Exponential Scaling',
          prompt: 'A log storage cluster starts at 50 TB and doubles in size every 6 months. How many years will it take for the storage requirement to reach 800 TB?',
          contextOrScenario: 'Capacity planning and cost forecasting for cloud storage.',
          mcqOptions: [
            { id: 'opt-a', text: '1.5 years' },
            { id: 'opt-b', text: '2.0 years' },
            { id: 'opt-c', text: '2.5 years' },
            { id: 'opt-d', text: '3.0 years' }
          ],
          correctOptionId: 'opt-b',
          explanation: 'Growth: 50 -> 100 (6 mo) -> 200 (12 mo) -> 400 (18 mo) -> 800 (24 mo). 24 months = 2.0 years.'
        }
      ];

    case 'Behavioral':
      return [
        {
          id: 'beh-1',
          number: 1,
          format: 'behavioral',
          category: 'Conflict Resolution & Disagreement',
          difficulty: 'Medium',
          title: 'Navigating Technical Disagreements & Trade-offs',
          prompt: `Describe a situation where you had a strong technical disagreement with a teammate or senior engineer regarding architecture, tooling, or timeline. How did you resolve it, and what was the outcome?`,
          contextOrScenario: `Interviews at Tier-1 companies${companyPrefix} look for high agency, empathy, data-driven decisions, and the ability to disagree and commit.`,
          starPrompts: {
            situation: 'What was the specific technical dispute and project context?',
            task: 'What was your responsibility and what risks did the disagreement introduce?',
            action: 'How did you communicate, benchmark, or prototype to find objective consensus?',
            result: 'What was the quantifiable project result and what did the team learn?'
          }
        },
        {
          id: 'beh-2',
          number: 2,
          format: 'behavioral',
          category: 'Ownership & Delivery Under Pressure',
          difficulty: 'Medium',
          title: 'Delivering High-Stakes Milestones Under Ambiguity',
          prompt: `Tell me about a time when you were assigned a project with ambiguous requirements, shifting deadlines, or unexpected roadblocks. How did you organize your priorities and drive delivery?`,
          starPrompts: {
            situation: 'What was the ambiguous project and why were requirements unclear?',
            task: 'What was your core deliverable and target business objective?',
            action: 'How did you break down the scope, communicate with stakeholders, and mitigate blockers?',
            result: 'Did you hit the timeline? What was the business impact or adoption metric?'
          }
        },
        {
          id: 'beh-3',
          number: 3,
          format: 'behavioral',
          category: 'Failure & Retrospective',
          difficulty: 'Hard',
          title: 'A Critical Bug in Production & Post-Mortem',
          prompt: `Give an example of a mistake, outage, or bad architectural choice you personally made in production. How did you remediate it and what safeguards did you put in place?`,
          starPrompts: {
            situation: 'What was the failure, incident, or design flaw?',
            task: 'What was the immediate containment responsibility?',
            action: 'How did you fix the root cause and implement CI/CD or monitoring safeguards?',
            result: 'What did the post-mortem reveal and how did it improve system reliability long-term?'
          }
        },
        {
          id: 'beh-4',
          number: 4,
          format: 'behavioral',
          category: 'Mentorship & Culture Alignment',
          difficulty: 'Medium',
          title: 'Mentoring or Elevating Team Engineering Standards',
          prompt: `Tell me about a time you helped onboard a junior engineer, introduced a new best practice, or elevated testing/code review standards across your team.`,
          starPrompts: {
            situation: 'What was the gap in team documentation, knowledge, or review standards?',
            task: 'Why was improving this critical for team velocity?',
            action: 'What workshops, linting rules, documentation, or paired sessions did you run?',
            result: 'How did code quality or deployment frequency improve?'
          }
        }
      ];

    case 'System Design':
      return [
        {
          id: 'sys-1',
          number: 1,
          format: 'system_design',
          category: 'Distributed Systems & URL Shortener',
          difficulty: 'Medium',
          title: 'Design a Distributed URL Shortening Service (TinyURL)',
          prompt: `Design a scalable URL shortening service handling 100 Million new URLs created per month and 10 Billion redirections per month with <10ms P99 latency.`,
          contextOrScenario: `Tests capacity estimations, Base62 encoding, Redis caching, and database partitioning strategy${companyPrefix}.`,
          systemDesignPrompts: {
            requirements: 'Functional & Non-functional requirements (Availability vs Consistency, Read-heavy ratio 100:1).',
            architecture: 'High Level Architecture: DNS -> CDN -> Load Balancer -> API Cluster -> Cache -> Database.',
            dataModel: 'Schema (Base62 hash, original_url, created_at, user_id) & Database Choice (NoSQL Key-Value vs PostgreSQL).',
            bottlenecks: 'Cache eviction (LRU), hot keys, multi-region replication, and analytics telemetry stream.'
          }
        },
        {
          id: 'sys-2',
          number: 2,
          format: 'system_design',
          category: 'Real-Time Messaging & WebSockets',
          difficulty: 'Hard',
          title: 'Design a Real-Time Collaborative Chat System (Slack/WhatsApp)',
          prompt: `Design a global real-time chat service supporting 50 Million DAU, 1-on-1 direct messages, group chats of up to 1,000 members, presence status (online/offline), and offline push notifications.`,
          systemDesignPrompts: {
            requirements: 'Low latency delivery (<100ms), guaranteed message ordering, offline sync, media attachments.',
            architecture: 'WebSocket Gateway cluster, ZooKeeper/Redis Pub-Sub connection state, Message Service, Notification Service.',
            dataModel: 'Cassandra/ScyllaDB wide-column schema for time-series message streams partitioned by channel_id.',
            bottlenecks: 'Large group fan-out handling, presence status thundering herd, and connection state recovery.'
          }
        },
        {
          id: 'sys-3',
          number: 3,
          format: 'system_design',
          category: 'Rate Limiting & API Gateway',
          difficulty: 'Medium',
          title: 'Design a Distributed API Rate Limiter',
          prompt: `Design a distributed rate limiter to protect backend services from abusive traffic and DDoS attacks, enforcing tiers (e.g., 100 req/min per IP, 5000 req/min per API Key).`,
          systemDesignPrompts: {
            requirements: 'Extremely low overhead (<2ms), high accuracy, distributed consensus across multi-cluster zones.',
            architecture: 'API Gateway middleware, Redis Token Bucket / Sliding Window Log with Lua scripts for atomic updates.',
            dataModel: 'In-memory sorted sets (ZSET) or sliding window counters with TTL expiration.',
            bottlenecks: 'Race conditions during parallel bursts, Redis cluster replication lag, and client retry backoff policies.'
          }
        }
      ];

    case 'Mixed':
      return [
        {
          id: 'mix-1',
          number: 1,
          format: 'technical',
          category: 'Frontend & Architecture',
          difficulty: 'Medium',
          title: 'React Concurrent Rendering & Virtualization',
          prompt: `How does React 18 Fiber architecture handle concurrent transitions (useTransition, useDeferredValue)? How would you architect a 100,000 row real-time data table without locking the browser UI thread?`,
          technicalPrompts: {
            coreConcept: 'Explain time-slicing, priority lanes in React 18, and virtualization windowing.',
            tradeoffs: 'Trade-offs between DOM virtualization vs pagination vs server-side streaming.',
            practicalExample: 'Describe an implementation using `react-window` or custom `useVirtualizer` with web workers.'
          }
        },
        {
          id: 'mix-2',
          number: 2,
          format: 'coding',
          category: 'Algorithms & Data Structures',
          difficulty: 'Medium',
          title: 'LRU Cache Implementation',
          prompt: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and O(1) put operations.`,
          initialCode: `class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}`,
          language: 'typescript',
          testCases: [
            { id: 'tc-1', input: 'put(1,1), put(2,2), get(1), put(3,3), get(2)', expectedOutput: 'get(1)->1, get(2)->-1', description: 'Evicts key 2 after capacity hit' }
          ]
        },
        {
          id: 'mix-3',
          number: 3,
          format: 'system_design',
          category: 'Distributed Caching',
          difficulty: 'Medium',
          title: 'Cache Invalidation & Thundering Herd Prevention',
          prompt: `Describe how you handle Cache Stampede (Thundering Herd) when a high-traffic cache key expires. Compare Mutex locking, Probabilistic Early Expiration (XFetch), and background refresh.`,
          systemDesignPrompts: {
            requirements: 'Zero backend database spikes when hot keys expire simultaneously.',
            architecture: 'Redis distributed locks (Redlock) vs asynchronous worker refresh queue.',
            dataModel: 'Key TTL + delta timestamp metadata inside cached JSON envelope.',
            bottlenecks: 'Lock contention overhead vs serving slightly stale data during refresh.'
          }
        },
        {
          id: 'mix-4',
          number: 4,
          format: 'behavioral',
          category: 'STAR Project Leadership',
          difficulty: 'Medium',
          title: 'Cross-Team System Migration',
          prompt: `Describe an end-to-end technical migration (e.g. database change, monolith to microservices, framework upgrade) you spearheaded. How did you minimize downtime and ensure zero data loss?`,
          starPrompts: {
            situation: 'What legacy system was being migrated and what were the business risks?',
            task: 'What was your specific architecture and execution roadmap?',
            action: 'How did you use dark launching, dual writes, and canary verification?',
            result: 'What was the measurable latency improvement and post-migration stability?'
          }
        }
      ];

    case 'Technical':
    default:
      return [
        {
          id: 'tech-1',
          number: 1,
          format: 'technical',
          category: 'Frontend Performance & React',
          difficulty: 'Medium',
          title: 'Optimizing Heavy React Re-renders and State Layouts',
          prompt: `In a large-scale enterprise dashboard with live WebSocket feeds, how do you diagnose and prevent cascading component re-renders? Discuss React 18 concurrency, selector memoization, and DOM ref management.`,
          technicalPrompts: {
            coreConcept: 'Explain React reconciliation, shallow prop comparison, and selector subscriptions (e.g. Zustand, Redux).',
            tradeoffs: 'When is useMemo/useCallback beneficial vs premature optimization overhead?',
            practicalExample: 'Explain profiling using React DevTools Flamegraph and splitting contexts into fine-grained slices.'
          }
        },
        {
          id: 'tech-2',
          number: 2,
          format: 'technical',
          category: 'TypeScript & Type System',
          difficulty: 'Medium',
          title: 'Advanced TypeScript Generics & Type Narrowing',
          prompt: `How do conditional types (\`T extends U ? X : Y\`), mapped types, and custom type guards (\`value is T\`) ensure type safety across full-stack API boundaries? Provide an architectural design.`,
          technicalPrompts: {
            coreConcept: 'Discriminant unions, template literal types, and inference with `infer`.',
            tradeoffs: 'Compile-time type checking vs runtime validation schemas (Zod/Valibot).',
            practicalExample: 'Designing a strongly-typed API client wrapper handling success, error payloads, and pagination.'
          }
        },
        {
          id: 'tech-3',
          number: 3,
          format: 'technical',
          category: 'Database & SQL Query Optimization',
          difficulty: 'Medium',
          title: 'PostgreSQL Indexing & Execution Plans',
          prompt: `A query on a table with 15 million rows is taking 1,800ms. How do you analyze the output of \`EXPLAIN (ANALYZE, BUFFERS)\`? Compare B-Tree, GIN, and Partial Indexes.`,
          technicalPrompts: {
            coreConcept: 'Seq Scan vs Index Scan vs Bitmap Heap Scan and page buffer cache reads.',
            tradeoffs: 'Write amplification and memory footprint of composite indexes vs read query acceleration.',
            practicalExample: 'Creating a composite index with covering columns (\`INCLUDE\`) to achieve an Index-Only Scan.'
          }
        },
        {
          id: 'tech-4',
          number: 4,
          format: 'technical',
          category: 'Asynchronous Architecture & Node.js Event Loop',
          difficulty: 'Hard',
          title: 'Node.js Event Loop & Microtask Orchestration',
          prompt: `Explain the phases of the Node.js libuv event loop (Timers, Pending I/O, Poll, Check, Close). What is the difference between \`process.nextTick()\` and \`setImmediate()\`?`,
          technicalPrompts: {
            coreConcept: 'Microtask queue priority (Promises vs nextTick) vs macrotask execution.',
            tradeoffs: 'Starving I/O poll phase with recursive nextTick calls vs deferred execution.',
            practicalExample: 'Handling CPU-bound hashing or image parsing without blocking the main event loop.'
          }
        },
        {
          id: 'tech-5',
          number: 5,
          format: 'technical',
          category: 'Web Security & Authentication',
          difficulty: 'Medium',
          title: 'Modern Auth Security (JWT, HttpOnly, OAuth2, CSRF)',
          prompt: `Compare storing JWTs in LocalStorage vs HttpOnly SameSite cookies. How do you protect a modern Single Page Application from XSS and CSRF token leakage?`,
          technicalPrompts: {
            coreConcept: 'Cookie attributes (HttpOnly, Secure, SameSite=Strict/Lax) vs LocalStorage script vulnerability.',
            tradeoffs: 'Stateless JWT verification vs server-side revocation lists / token blacklisting.',
            practicalExample: 'Short-lived access token in memory + HttpOnly rotating refresh token in cookie with double submit CSRF.'
          }
        }
      ];
  }
}
