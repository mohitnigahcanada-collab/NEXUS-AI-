// Tests for src/router.ts - Task detection and routing
import { test, expect, describe } from "bun:test";
import { detectTask, taskToModel, autoRoute } from "../src/router";

describe("detectTask", () => {
  test("detects code tasks from keywords", () => {
    const msgs = [{ role: "user", content: "Fix the bug in my React component" }];
    expect(detectTask(msgs)).toBe("code");
  });

  test("detects code from 'function' keyword", () => {
    const msgs = [{ role: "user", content: "Write a function that sorts an array" }];
    expect(detectTask(msgs)).toBe("code");
  });

  test("detects reasoning tasks", () => {
    const msgs = [{ role: "user", content: "Analyze the pros and cons of microservices" }];
    expect(detectTask(msgs)).toBe("reasoning");
  });

  test("detects fast tasks from 'quick' keyword", () => {
    const msgs = [{ role: "user", content: "Quick question - what is HTTP?" }];
    expect(detectTask(msgs)).toBe("fast");
  });

  test("detects fast tasks from short messages", () => {
    const msgs = [{ role: "user", content: "Hello there" }];
    expect(detectTask(msgs)).toBe("fast");
  });

  test("detects reasoning from long messages (>500 chars)", () => {
    const longMsg = "a".repeat(501);
    const msgs = [{ role: "user", content: longMsg }];
    expect(detectTask(msgs)).toBe("reasoning");
  });

  test("returns general for medium-length non-specific messages", () => {
    const msgs = [{ role: "user", content: "I want you to help me with a project that involves several different aspects and considerations that we need to discuss" }];
    expect(detectTask(msgs)).toBe("general");
  });

  test("uses last user message, not system or assistant", () => {
    const msgs = [
      { role: "system", content: "You are a code expert" },
      { role: "assistant", content: "I can help with code" },
      { role: "user", content: "What is 2+2?" },
    ];
    expect(detectTask(msgs)).toBe("fast");
  });

  test("returns general when no user message", () => {
    const msgs = [{ role: "system", content: "You are helpful" }];
    expect(detectTask(msgs)).toBe("general");
  });

  test("code takes priority over reasoning", () => {
    // "debug" is code, "analyze" is reasoning - code should win
    const msgs = [{ role: "user", content: "Debug and analyze this Python class" }];
    expect(detectTask(msgs)).toBe("code");
  });
});

describe("taskToModel", () => {
  test("maps code to nexus-code", () => {
    expect(taskToModel("code")).toBe("nexus-code");
  });

  test("maps reasoning to nexus-pro", () => {
    expect(taskToModel("reasoning")).toBe("nexus-pro");
  });

  test("maps fast to nexus-flash", () => {
    expect(taskToModel("fast")).toBe("nexus-flash");
  });

  test("maps general to nexus-air", () => {
    expect(taskToModel("general")).toBe("nexus-air");
  });

  test("maps free to nexus-lite", () => {
    expect(taskToModel("free")).toBe("nexus-lite");
  });
});

describe("autoRoute", () => {
  test("routes coding question to nexus-code", () => {
    const msgs = [{ role: "user", content: "Help me debug this TypeScript error" }];
    expect(autoRoute(msgs)).toBe("nexus-code");
  });

  test("routes simple question to nexus-flash", () => {
    const msgs = [{ role: "user", content: "Define HTTP" }];
    expect(autoRoute(msgs)).toBe("nexus-flash");
  });
});
