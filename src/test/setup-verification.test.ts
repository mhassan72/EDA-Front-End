import { describe, it, expect } from 'vitest';

describe('Project Setup Verification', () => {
  it('should have TypeScript support', () => {
    const testValue: string = 'TypeScript is working';
    expect(testValue).toBe('TypeScript is working');
  });

  it('should have Vitest testing framework configured', () => {
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });

  it('should support modern JavaScript features', () => {
    const testArray = [1, 2, 3];
    const doubled = testArray.map(x => x * 2);
    expect(doubled).toEqual([2, 4, 6]);
  });

  it('should have proper environment setup', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});