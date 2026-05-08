import Icons from './Icons';

interface HeaderProps {
    mobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
    onCloseMobileMenu: () => void;
    onOpenBeanLibrary: () => void;
    onOpenRecipes: () => void;
    onOpenStats: () => void;
    onOpenCaffeine: () => void;
    onOpenSettings: () => void;
}

export default function Header({
    mobileMenuOpen,
    onToggleMobileMenu,
    onCloseMobileMenu,
    onOpenBeanLibrary,
    onOpenRecipes,
    onOpenStats,
    onOpenCaffeine,
    onOpenSettings,
}: HeaderProps) {
    return (
        <header className="header">
            <Icons.Coffee />
            <h1 className="header__title">Luxe Cafe Dial-In</h1>
            <p className="header__subtitle">Ninja Luxe Cafe Pro Calibration Dashboard</p>

            <button
                className="header__hamburger"
                onClick={onToggleMobileMenu}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>

            <div className={`header__btns ${mobileMenuOpen ? 'header__btns--open' : ''}`}>
                <button
                    className="header__btn"
                    onClick={onOpenBeanLibrary}
                    title="Manage Bean Library"
                >
                    <Icons.Bean /> Bean Library
                </button>
                <button
                    className="header__btn"
                    onClick={onOpenRecipes}
                    title="Manage Recipes"
                >
                    <Icons.Book /> Recipes
                </button>
                <button
                    className="header__btn"
                    onClick={onOpenStats}
                    title="View Statistics"
                >
                    <Icons.PieChart /> Stats
                </button>
                <button
                    className="header__btn"
                    onClick={onOpenCaffeine}
                    title="Caffeine Tracker"
                >
                    <Icons.Caffeine /> Caffeine
                </button>
                <button
                    className="header__btn header__btn--icon header__prefs-btn"
                    onClick={onOpenSettings}
                    title="Settings"
                >
                    <Icons.Sliders />
                </button>
                <button
                    className="header__btn header__theme-btn"
                    onClick={onOpenSettings}
                    title="Settings"
                >
                    <Icons.Sliders /> Settings
                </button>
            </div>

            {mobileMenuOpen && (
                <div
                    className="header__overlay"
                    onClick={onCloseMobileMenu}
                />
            )}
        </header>
    );
}
