import { useState, useEffect } from 'react';
import type { BeanProfile } from '../types';
import { loadBeans, saveBeans } from '../lib/storage';

export function useBeans() {
    const [beans, setBeans] = useState<BeanProfile[]>(() => loadBeans());

    useEffect(() => { saveBeans(beans); }, [beans]);

    const addBean = (bean: BeanProfile) => setBeans(prev => [bean, ...prev]);
    const updateBean = (updated: BeanProfile) =>
        setBeans(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    const deleteBean = (id: string) => setBeans(prev => prev.filter(b => b.id !== id));
    const toggleActive = (id: string) =>
        setBeans(prev => prev.map(b => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
    const replaceAll = (next: BeanProfile[]) => setBeans(next);

    return { beans, addBean, updateBean, deleteBean, toggleActive, replaceAll };
}
