// Nexus AI - Task Detector (< 1ms, no LLM call)
// Determines best model based on prompt keywords

type TaskCategory = "code" | "reasoning" | "fast" | "general" | "free";

const CODE_SIGNALS = /\b(code|debug|fix|error|function|class|import|export|const|let|var|async|await|typescript|python|rust|react|vue|angular|component|api|endpoint|database|sql|git|deploy|docker|build|compile|test|refactor|bug|stack\s*trace|syntax|regex|algorithm|data\s*structure)\b/i;

const REASONING_SIGNALS = /\b(think|analyze|compare|explain\s*why|step\s*by\s*step|reason|evaluate|assess|critique|review|deep\s*dive|pros\s*and\s*cons|trade-?offs|implications|consequences|strategy|plan|architecture|design|research)\b/i;

const FAST_SIGNALS = /\b(quick|short|brief|one\s*word|yes\s*or\s*no|simple|tldr|summarize\s*in|just\s*tell|what\s*is|who\s*is|when\s*did|define|translate|convert)\b/i;

export function detectTask(messages: Array<{ role: string; content: string }>): TaskCategory {
  // Use the last user message for detection
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) return "general";

  const content = lastUserMsg.content;

  // Priority order: code > reasoning > fast > general
  if (CODE_SIGNALS.test(content)) return "code";
  if (REASONING_SIGNALS.test(content)) return "reasoning";
  if (FAST_SIGNALS.test(content)) return "fast";

  // Default: check message length
  if (content.length < 50) return "fast";
  if (content.length > 500) return "reasoning";

  return "general";
}

export function taskToModel(task: TaskCategory): string {
  switch (task) {
    case "code": return "nexus-code";
    case "reasoning": return "nexus-pro";
    case "fast": return "nexus-flash";
    case "general": return "nexus-air";
    case "free": return "nexus-lite";
  }
}

export function autoRoute(messages: Array<{ role: string; content: string }>): string {
  const task = detectTask(messages);
  return taskToModel(task);
}
