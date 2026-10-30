import { describe, expect, it } from "vitest";
import { buildSlots } from "../TimeStep";

const monday = new Date(2026, 10, 2);
const hours = { mon: { open: "09:00", close: "12:00" } };
const earlyMorning = new Date(2026, 10, 1, 8);

describe("buildSlots", () => {
  it("offers every half hour where the whole treatment fits before closing", () => {
    const slots = buildSlots(monday, hours, [], 60, earlyMorning);
    expect(slots.map((s) => new Date(s).getHours() + new Date(s).getMinutes() / 60)).toEqual([9, 9.5, 10, 10.5, 11]);
  });

  it("drops slots that overlap an existing booking", () => {
    const booked = [{ startAt: new Date(2026, 10, 2, 10), endAt: new Date(2026, 10, 2, 11) }];
    const slots = buildSlots(monday, hours, booked, 60, earlyMorning).map((s) => new Date(s).getHours() + new Date(s).getMinutes() / 60);
    expect(slots).toEqual([9, 11]);
  });

  it("hides times already in the past and days with no hours", () => {
    const lateMorning = new Date(2026, 10, 2, 10, 15);
    expect(buildSlots(monday, hours, [], 30, lateMorning).map((s) => new Date(s).getHours() + new Date(s).getMinutes() / 60)).toEqual([10.5, 11, 11.5]);
    expect(buildSlots(new Date(2026, 10, 3), hours, [], 30, earlyMorning)).toEqual([]);
  });
});
