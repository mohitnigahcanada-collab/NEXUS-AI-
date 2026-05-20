// Nexus AI - Advanced Retry System with Exponential Backoff
// Industry patterns: AWS SDK, Google Cloud Client, Stripe API

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  totalLatency: number;
}

// Default configuration (AWS SDK-inspired)
const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000, // Start with 1 second
  maxDelayMs: 32000, // Max 32 seconds
  timeoutMs: 30000, // 30 second timeout per attempt
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Retry on these HTTP codes
  retryableErrors: [
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "NetworkError",
    "TimeoutError",
  ],
};

/**
 * Calculate exponential backoff with jitter (AWS-style)
 * Jitter prevents thundering herd problem
 */
function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  // Check HTTP status codes
  if (error.status && config.retryableStatuses.includes(error.status)) {
    return true;
  }

  // Check error codes/messages
  const errorString = String(error.code || error.message || error);
  return config.retryableErrors.some((retryable) => errorString.includes(retryable));
}

/**
 * Sleep with cancellation support
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Aborted"));
      return;
    }

    const timeout = setTimeout(resolve, ms);
    
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new Error("Aborted"));
    });
  });
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  signal?: AbortSignal
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: any;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      // Check if cancelled
      if (signal?.aborted) {
        throw new Error("Request cancelled");
      }

      // Create timeout signal for this attempt
      const attemptController = new AbortController();
      const timeoutId = setTimeout(() => attemptController.abort(), finalConfig.timeoutMs);

      try {
        const result = await fn();
        clearTimeout(timeoutId);
        
        return {
          success: true,
          data: result,
          attempts: attempt + 1,
          totalLatency: Date.now() - startTime,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err: any) {
      lastError = err;

      // Log attempt failure
      console.warn(`[Retry] Attempt ${attempt + 1}/${finalConfig.maxRetries + 1} failed:`, err.message || err);

      // Don't retry if not retryable or out of retries
      if (!isRetryableError(err, finalConfig) || attempt >= finalConfig.maxRetries) {
        return {
          success: false,
          error: err.message || String(err),
          attempts: attempt + 1,
          totalLatency: Date.now() - startTime,
        };
      }

      // Calculate backoff and wait
      const backoffMs = calculateBackoff(attempt, finalConfig.baseDelayMs, finalConfig.maxDelayMs);
      console.log(`[Retry] Backing off for ${backoffMs}ms before retry ${attempt + 2}...`);
      
      try {
        await sleep(backoffMs, signal);
      } catch {
        // Cancelled during backoff
        return {
          success: false,
          error: "Request cancelled during retry backoff",
          attempts: attempt + 1,
          totalLatency: Date.now() - startTime,
        };
      }
    }
  }

  // Should never reach here
  return {
    success: false,
    error: lastError?.message || "Unknown error",
    attempts: finalConfig.maxRetries + 1,
    totalLatency: Date.now() - startTime,
  };
}

/**
 * Retry HTTP fetch with exponential backoff
 */
export async function retryFetch(
  url: string,
  options: RequestInit = {},
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<Response>> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, options);
      
      // Check if response status is retryable
      if (!response.ok && config.retryableStatuses?.includes(response.status)) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        throw error;
      }
      
      return response;
    },
    config
  );
}

/**
 * Rate limit queue for 429 responses
 * Implements token bucket algorithm
 */
class RateLimitQueue {
  private queue: Array<{ fn: () => Promise<any>; resolve: (val: any) => void; reject: (err: any) => void }> = [];
  private processing = false;
  private tokens = 10; // Start with 10 tokens
  private maxTokens = 10;
  private refillRate = 1; // 1 token per second
  private lastRefill = Date.now();

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // Refill tokens based on time passed
      const now = Date.now();
      const timePassed = (now - this.lastRefill) / 1000;
      this.tokens = Math.min(this.maxTokens, this.tokens + timePassed * this.refillRate);
      this.lastRefill = now;

      // Wait if no tokens available
      if (this.tokens < 1) {
        const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
        await sleep(waitTime);
        continue;
      }

      // Process next request
      const item = this.queue.shift();
      if (!item) break;

      this.tokens -= 1;

      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (err) {
        item.reject(err);
      }
    }

    this.processing = false;
  }
}

// Global rate limit queues per provider
const rateLimitQueues = new Map<string, RateLimitQueue>();

export function getRateLimitQueue(providerName: string): RateLimitQueue {
  if (!rateLimitQueues.has(providerName)) {
    rateLimitQueues.set(providerName, new RateLimitQueue());
  }
  return rateLimitQueues.get(providerName)!;
}
