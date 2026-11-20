import { describe, expect, it } from 'vitest';
import { lightsOut, minutesToLightsOut, tonightText, isEvening } from '../../src/logic/winddown';

describe('wind-down', () => {
  it('lights-out is the current anchor minus 8 hours', () => {
    expect(lightsOut(570)).toBe(90); // 9:30 AM -> 1:30 AM
    expect(lightsOut(450)).toBe(1410); // 7:30 AM -> 11:30 PM
  });
  it('counts down to an after-midnight lights-out', () => {
    expect(minutesToLightsOut(new Date(2026, 10, 19, 23, 50), 570)).toBe(100);
    expect(minutesToLightsOut(new Date(2026, 10, 19, 15, 0), 570)).toBe(630);
  });
  it('goes negative once lights-out has passed, same night', () => {
    expect(minutesToLightsOut(new Date(2026, 10, 20, 1, 50), 570)).toBe(-20);
  });
  it('handles a before-midnight lights-out', () => {
    expect(minutesToLightsOut(new Date(2026, 10, 19, 22, 10), 450)).toBe(80);
    expect(minutesToLightsOut(new Date(2026, 10, 20, 0, 10), 450)).toBe(-40);
  });
  it('words it neutrally', () => {
    expect(tonightText(80)).toBe('Lights out in 1h 20m');
    expect(tonightText(0)).toBe('Lights out now');
    expect(tonightText(-20)).toBe('Lights-out was 20m ago');
  });
  it('knows when it is evening', () => {
    expect(isEvening(new Date(2026, 10, 19, 19, 0))).toBe(true);
    expect(isEvening(new Date(2026, 10, 20, 2, 0))).toBe(true);
    expect(isEvening(new Date(2026, 10, 19, 10, 0))).toBe(false);
  });
});
