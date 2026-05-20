// Integration tests - Test the gateway handles various scenarios
import { test, expect, describe } from "bun:test";
import { handleChatCompletion } from "../src/gateway";

describe("gateway integration", () => {
  test("rejects requests when budget exceeded", async () => {
    const { stats } = await import("../src/stats");
    const originalBudget = stats.getBudget();
    stats.setBudget(0); // $0 budget = always exceeded

    const response = await handleChatCompletion({
      model: "auto",
      messages: [{ role: "user", content: "Hello" }],
    });

    expect(response.status).toBe(429);
    const data = (await response.json()) as any;
    expect(data.error.type).toBe("budget_exceeded");

    // Restore
    stats.setBudget(originalBudget);
  });

  test("auto-routes coding question and gets valid response", async () => {
    const { stats } = await import("../src/stats");
    stats.setBudget(100);

    const response = await handleChatCompletion({
      model: "auto",
      messages: [{ role: "user", content: "What does const mean in TypeScript? One sentence." }],
    });

    // With real keys in .env, this should succeed
    expect(response.status).toBe(200);
    const data = (await response.json()) as any;
    expect(data.model).toStartWith("nexus-");
    expect(data.choices).toBeTruthy();
    expect(data.choices.length).toBeGreaterThan(0);
    expect(data.choices[0].message.content).toBeTruthy();
  });

  test("response model field is always branded (never shows real provider)", async () => {
    const response = await handleChatCompletion({
      model: "nexus-flash",
      messages: [{ role: "user", content: "Say ok" }],
    });

    if (response.status === 200) {
      const data = (await response.json()) as any;
      expect(data.model).toStartWith("nexus-");
      // Should never reveal groq, llama, gemini etc
      expect(data.model).not.toContain("llama");
      expect(data.model).not.toContain("groq");
      expect(data.model).not.toContain("gemini");
    }
  });

  test("streaming returns valid SSE format", async () => {
    const response = await handleChatCompletion({
      model: "nexus-flash",
      messages: [{ role: "user", content: "Say hi" }],
      stream: true,
    });

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");

    const text = await response.text();
    // SSE format: data: {...}\n\n
    expect(text).toContain("data:");
    expect(text).toContain("[DONE]");

    // Parse first data line - should have nexus model name
    const firstDataLine = text.split("\n").find((l) => l.startsWith("data: {"));
    if (firstDataLine) {
      const chunk = JSON.parse(firstDataLine.slice(6));
      expect(chunk.model).toStartWith("nexus-");
    }
  });

  test("streaming response never leaks real model name", async () => {
    const response = await handleChatCompletion({
      model: "nexus-air",
      messages: [{ role: "user", content: "Say hello" }],
      stream: true,
    });

    const text = await response.text();
    // Real model names should be rewritten
    const dataLines = text.split("\n").filter((l) => l.startsWith("data: {"));
    for (const line of dataLines) {
      const chunk = JSON.parse(line.slice(6));
      if (chunk.model) {
        expect(chunk.model).toStartWith("nexus-");
        expect(chunk.model).not.toContain("gemini");
        expect(chunk.model).not.toContain("llama");
      }
    }
  });

  test("handles non-existent model by auto-routing", async () => {
    const response = await handleChatCompletion({
      model: "gpt-4o-doesnt-exist",
      messages: [{ role: "user", content: "Say ok" }],
    });

    // Should auto-route to a real model and succeed
    expect(response.status).toBe(200);
    const data = (await response.json()) as any;
    expect(data.model).toStartWith("nexus-");
  });

  test("budget guard returns proper error format", async () => {
    const { stats } = await import("../src/stats");
    stats.setBudget(0);

    const response = await handleChatCompletion({
      model: "nexus-flash",
      messages: [{ role: "user", content: "test" }],
    });

    expect(response.status).toBe(429);
    const body = (await response.json()) as any;
    expect(body.error).toHaveProperty("message");
    expect(body.error).toHaveProperty("type");
    expect(body.error.type).toBe("budget_exceeded");

    stats.setBudget(50);
  });
});
