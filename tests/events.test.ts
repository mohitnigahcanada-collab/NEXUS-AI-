// Tests for src/events.ts - Event bus
import { test, expect, describe } from "bun:test";
import { events } from "../src/events";

describe("events", () => {
  test("subscribe receives emitted events", () => {
    const received: any[] = [];
    const unsub = events.subscribe((event) => received.push(event));

    events.emit({ type: "request", timestamp: 123, data: { model: "nexus-flash" } });
    events.emit({ type: "error", timestamp: 456, data: { reason: "timeout" } });

    expect(received.length).toBe(2);
    expect(received[0].type).toBe("request");
    expect(received[1].type).toBe("error");

    unsub();
  });

  test("unsubscribe stops receiving events", () => {
    const received: any[] = [];
    const unsub = events.subscribe((event) => received.push(event));

    events.emit({ type: "request", timestamp: 1, data: {} });
    expect(received.length).toBe(1);

    unsub();

    events.emit({ type: "request", timestamp: 2, data: {} });
    expect(received.length).toBe(1); // Still 1, didn't receive second
  });

  test("listener errors don't crash the bus", () => {
    const received: any[] = [];

    // Bad listener that throws
    events.subscribe(() => {
      throw new Error("I'm broken!");
    });

    // Good listener
    const unsub = events.subscribe((event) => received.push(event));

    // Should not throw
    events.emit({ type: "request", timestamp: 1, data: {} });

    // Good listener still received it
    expect(received.length).toBe(1);
    unsub();
  });

  test("multiple subscribers all receive events", () => {
    const a: any[] = [];
    const b: any[] = [];

    const unsub1 = events.subscribe((e) => a.push(e));
    const unsub2 = events.subscribe((e) => b.push(e));

    events.emit({ type: "provider_up", timestamp: 1, data: { model: "test" } });

    expect(a.length).toBe(1);
    expect(b.length).toBe(1);

    unsub1();
    unsub2();
  });
});
