import { describe, it, expect } from 'vitest';
import { getLogMessage } from './milestones';

describe('getLogMessage', () => {
    it('welcomes the very first shot', () => {
        expect(getLogMessage(1, 1, 'Ethiopia')).toMatch(/First shot/);
    });

    it('marks total-count milestones', () => {
        expect(getLogMessage(100, 3, 'Ethiopia')).toMatch(/100th/);
    });

    it('marks per-bean milestones, naming the bean', () => {
        expect(getLogMessage(132, 50, 'Ethiopia')).toBe('50 shots of Ethiopia. You know this bean.');
    });

    it('falls back to the plain confirmation on ordinary shots', () => {
        expect(getLogMessage(7, 3, 'Ethiopia')).toBe('Shot logged!');
    });

    it('prefers a total milestone over the plain message', () => {
        expect(getLogMessage(25, 4, 'Ethiopia')).not.toBe('Shot logged!');
    });
});
