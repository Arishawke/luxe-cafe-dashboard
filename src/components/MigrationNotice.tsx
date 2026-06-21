import Icons from './Icons';

interface MigrationNoticeProps {
    onMigrate: () => void;
    onDismiss: () => void;
}

export default function MigrationNotice({ onMigrate, onDismiss }: MigrationNoticeProps) {
    return (
        <div className="migration-notice" role="region" aria-label="Bring your data from the old site">
            <span className="migration-notice__icon">
                <Icons.Bean />
            </span>
            <div className="migration-notice__content">
                <h4>Welcome to the new home for Luxe Café</h4>
                <p>Used the old site? Bring your shots, recipes, and beans over in one click.</p>
            </div>
            <div className="migration-notice__actions">
                <button className="migration-notice__migrate" onClick={onMigrate}>
                    <Icons.Download /> Bring my data
                </button>
                <button className="migration-notice__dismiss" onClick={onDismiss} aria-label="Dismiss">
                    <Icons.X />
                </button>
            </div>
        </div>
    );
}
