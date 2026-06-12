// Quiet milestone copy for the log-shot toast. Rewards the habit with a word,
// never a badge or confetti (see PRODUCT.md anti-references).
const TOTAL_MILESTONES: Record<number, string> = {
    10: "That's 10 shots logged.",
    25: '25 shots in. The ritual is sticking.',
    50: '50 shots logged. Nicely dialed.',
    100: "Your 100th shot. That's real practice.",
    250: '250 shots. A serious logbook.',
    500: '500 shots logged. Master of the machine.',
};

export function getLogMessage(totalShots: number, beanShots: number, beanName: string): string {
    if (totalShots === 1) return 'First shot logged. Welcome to the dial-in.';
    if (TOTAL_MILESTONES[totalShots]) return TOTAL_MILESTONES[totalShots];
    if (beanShots === 50) return `50 shots of ${beanName}. You know this bean.`;
    if (beanShots === 100) return `100 shots of ${beanName}. A house favorite.`;
    return 'Shot logged!';
}
