export function generateId(): string {
    return crypto.randomUUID();
}

export function formatDate(date: Date, use24Hour: boolean = false): string {
    if (isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: !use24Hour,
    }).format(date);
}

export function formatDateLong(date: Date, use24Hour: boolean = false): string {
    if (isNaN(date.getTime())) return 'Unknown date';
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: !use24Hour,
    }).format(date);
}
