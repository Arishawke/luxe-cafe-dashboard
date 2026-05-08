export function generateId(): string {
    return crypto.randomUUID();
}

export function formatDate(date: Date, use24Hour: boolean = false): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: !use24Hour,
    }).format(date);
}
