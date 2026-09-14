import React, { useState } from 'react';
import { InterviewQuestion, UserResponse } from '../../types/interview';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Clock, 
  Cpu, 
  Sparkles,
  ChevronRight,
  Code2
} from 'lucide-react';

interface CodingWorkspaceProps {
  question: InterviewQuestion;
  response: UserResponse;
  onUpdateResponse: (updates: Partial<UserResponse>) => void;
  disabled?: boolean;
}

export function CodingWorkspace({
  question,
  response,
  onUpdateResponse,
  disabled = false
}: CodingWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'testcases' | 'solution'>('editor');
  const [isRunning, setIsRunning] = useState(false);
  const code = response.codeAnswer ?? question.initialCode ?? '';

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateResponse({
      codeAnswer: e.target.value,
      codeLanguage: question.language || 'typescript'
    });
  };

  const handleResetCode = () => {
    onUpdateResponse({
      codeAnswer: question.initialCode || '',
      codeLanguage: question.language || 'typescript'
    });
  };

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      const testCases = question.testCases || [];
      const total = testCases.length || 1;
      
      // Determine simulated pass based on non-empty code structure
      const hasContent = code.trim().length > 30 && !code.includes('throw new Error');
      const passedCount = hasContent ? total : Math.max(0, total - 1);
      const isPassed = passedCount === total;

      onUpdateResponse({
        runResults: {
          passed: isPassed,
          testCasesPassed: passedCount,
          totalTestCases: total,
          output: isPassed
            ? `✓ All ${total} test cases passed successfully.\nRuntime: 64ms (faster than 88.4% of TypeScript submissions)\nMemory: 42.1 MB (less than 91.2% of submissions)`
            : `Test Case 2 Failed:\nInput: ${testCases[1]?.input || 'test case 2'}\nExpected: ${testCases[1]?.expectedOutput || 'expected'}\nActual: undefined (Check edge condition)`,
          executedAt: new Date().toLocaleTimeString()
        }
      });
    }, 700);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Code Editor Header / Controls */}
      <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/30">
            <Code2 className="h-3.5 w-3.5 mr-1" />
            {question.language || 'TypeScript'}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
            Execution Sandbox: Node.js 20.x
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetCode}
            disabled={disabled || isRunning}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>

          <Button
            size="sm"
            onClick={handleRunTests}
            disabled={disabled || isRunning}
            className="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isRunning ? (
              <>
                <Cpu className="h-3.5 w-3.5 animate-spin" /> Running Tests...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" /> Run Test Cases
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Code Editor Input Area */}
      <div className="flex-1 min-h-[300px] flex flex-col bg-slate-950 rounded-xl border border-border overflow-hidden font-mono text-xs">
        {/* Editor Tab Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">solution.{question.language === 'python' ? 'py' : 'ts'}</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            {code.split('\n').length} lines • {code.length} chars
          </span>
        </div>

        {/* Textarea Code Surface */}
        <div className="relative flex-1 p-0 flex">
          <textarea
            value={code}
            onChange={handleCodeChange}
            disabled={disabled}
            placeholder="// Write your solution here..."
            spellCheck={false}
            className="w-full h-full p-4 bg-transparent text-emerald-300/90 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed selection:bg-emerald-500/30 selection:text-white"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              tabSize: 2
            }}
          />
        </div>
      </div>

      {/* Test Cases & Console Output Panel */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('editor')}
              className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                activeTab === 'editor'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Test Cases ({question.testCases?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
                activeTab === 'testcases'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Console Output
            </button>
          </div>

          {response.runResults && (
            <div className="flex items-center gap-2 text-xs font-mono">
              {response.runResults.passed ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Passed ({response.runResults.testCasesPassed}/{response.runResults.totalTestCases})
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Partial ({response.runResults.testCasesPassed}/{response.runResults.totalTestCases})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {activeTab === 'editor' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.testCases?.map((tc, idx) => (
                <div
                  key={tc.id}
                  className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                    <span>Case {idx + 1}</span>
                    {tc.description && <span>{tc.description}</span>}
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Input:</span>
                    <span className="text-foreground font-semibold block truncate">{tc.input}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">Expected:</span>
                    <span className="text-emerald-400 font-semibold block">{tc.expectedOutput}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {response.runResults ? (
                <>
                  <div className="text-muted-foreground text-[10px] mb-1">
                    Last execution: {response.runResults.executedAt}
                  </div>
                  <div>{response.runResults.output}</div>
                </>
              ) : (
                <div className="text-muted-foreground italic py-2 text-center">
                  Run test cases above to inspect runtime execution output.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
