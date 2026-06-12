import {
    Coffee, PencilSimple, CookingPot, ChartBar, Star as StarIcon, Target,
    Lightbulb, ClipboardText, CaretDown, CaretUp, Minus, Plus, FloppyDisk,
    Lightning, Scales, Faders, BookOpen, X, Trash, OrangeSlice, Sparkle, Fire,
    CaretDoubleLeft, CaretDoubleRight, Calendar, ChartPie, DownloadSimple,
    UploadSimple, Gear, Sun, Moon, Copy, ChartLineUp, List, Palette, Check,
    ArrowsOut, Keyboard, Timer,
} from '@phosphor-icons/react';
import type { Icon, IconProps } from '@phosphor-icons/react';

// Phosphor renders currentColor and takes size from the .icon CSS classes
// (which override the svg width/height attribute). Keep class names stable so
// every existing call site and selector keeps working.
const wrap = (C: Icon, cls = 'icon') => {
    // optional param keeps the signature assignable to the `() => JSX.Element`
    // shape that RATING_CONFIG and the ratingConfig props expect.
    const Wrapped = (props: IconProps = {}) => <C className={cls} {...props} />;
    return Wrapped;
};

const Icons = {
    Coffee: wrap(Coffee, 'header__icon'),
    Edit: wrap(PencilSimple),
    ChefHat: wrap(CookingPot),
    BarChart: wrap(ChartBar),
    Star: ({ filled, ...props }: IconProps & { filled?: boolean }) => (
        <StarIcon className="icon" weight={filled ? 'fill' : 'regular'} {...props} />
    ),
    Target: wrap(Target),
    Lightbulb: wrap(Lightbulb, 'icon icon--xl'),
    Clipboard: wrap(ClipboardText, 'icon icon--xl'),
    ChevronDown: wrap(CaretDown, 'icon icon--sm'),
    ChevronUp: wrap(CaretUp, 'icon icon--sm'),
    Minus: wrap(Minus),
    Plus: wrap(Plus),
    Save: wrap(FloppyDisk),
    Zap: wrap(Lightning),
    Scale: wrap(Scales),
    Sliders: wrap(Faders),
    Book: wrap(BookOpen),
    X: wrap(X),
    Trash: wrap(Trash, 'icon icon--sm'),
    Citrus: wrap(OrangeSlice, 'icon icon--lg'),
    Sparkles: wrap(Sparkle, 'icon icon--lg'),
    Flame: wrap(Fire, 'icon icon--lg'),
    DoubleChevronLeft: wrap(CaretDoubleLeft, 'icon icon--lg'),
    DoubleChevronRight: wrap(CaretDoubleRight, 'icon icon--lg'),
    Calendar: wrap(Calendar),
    PieChart: wrap(ChartPie),
    Download: wrap(DownloadSimple),
    Upload: wrap(UploadSimple),
    Settings: wrap(Gear),
    Sun: wrap(Sun),
    Moon: wrap(Moon),
    Copy: wrap(Copy),
    TrendingUp: wrap(ChartLineUp),
    Menu: wrap(List),
    Palette: wrap(Palette),
    Check: wrap(Check),
    Expand: wrap(ArrowsOut),
    Keyboard: wrap(Keyboard),
    Timer: wrap(Timer, 'icon icon--sm'),

    // Bespoke holdouts: Phosphor has no good coffee-bean, milk-carton, or
    // ticked-cup metaphor, so these stay hand-drawn (on-brand, not a failure).
    Milk: () => (
        <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2h8l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6l2-4z" />
            <path d="M6 6h12" /><path d="M12 12v4" />
        </svg>
    ),
    Bean: () => (
        <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7c0 4-3.5 7.5-8 11-4.5-3.5-8-7-8-11a8 8 0 1 1 16 0Z" />
            <path d="M11 13c2-2.5 4-4 4-7" />
        </svg>
    ),
    Caffeine: () => (
        <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
    ),
};

export default Icons;
