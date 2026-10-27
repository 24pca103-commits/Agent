import { useState, useEffect } from 'react';
import { DATAGALACTIC_COMPANY } from '../data/catalog';

export interface CompanySettings {
  companyName: string;
  companyEmail: string;
  founder: string;
  tagline: string;
  website: string;
  dailySendLimit: number;
  delayBetweenSends: number;
}

const STORAGE_KEY_MODE_A = 'datagalactic_settings_mode_a';
const STORAGE_KEY_MODE_B = 'datagalactic_settings_mode_b';

export const getDefaultSettings = (mode: 'mode_a' | 'mode_b' = 'mode_a'): CompanySettings => {
  const isModeB = mode === 'mode_b';
  return {
    companyName: isModeB ? 'DataGalactic International Trade & Exports' : DATAGALACTIC_COMPANY.name,
    companyEmail: isModeB ? 'export@datagalactic.com' : (DATAGALACTIC_COMPANY.email || 'contact@datagalactic.com'),
    founder: DATAGALACTIC_COMPANY.founder || 'Risona',
    tagline: isModeB ? 'Global Commodity & Product Export Hub' : DATAGALACTIC_COMPANY.tagline,
    website: DATAGALACTIC_COMPANY.website,
    dailySendLimit: 50,
    delayBetweenSends: 15,
  };
};

export const getSavedSettings = (mode: 'mode_a' | 'mode_b' = 'mode_a'): CompanySettings => {
  const key = mode === 'mode_b' ? STORAGE_KEY_MODE_B : STORAGE_KEY_MODE_A;
  const defaults = getDefaultSettings(mode);

  if (typeof window === 'undefined') return defaults;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch (err) {
    console.error('Failed to read settings from localStorage:', err);
  }

  return defaults;
};

export const saveSettings = (
  newSettings: Partial<CompanySettings>,
  mode: 'mode_a' | 'mode_b' = 'mode_a'
): CompanySettings => {
  const current = getSavedSettings(mode);
  const updated = { ...current, ...newSettings };
  const key = mode === 'mode_b' ? STORAGE_KEY_MODE_B : STORAGE_KEY_MODE_A;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent('datagalactic_settings_updated', {
          detail: { mode, settings: updated }
        })
      );
    } catch (err) {
      console.error('Failed to save settings to localStorage:', err);
    }
  }

  return updated;
};

/**
 * React hook to reactively read and update company/sender settings
 */
export function useCompanySettings(mode: 'mode_a' | 'mode_b' = 'mode_a') {
  const [settings, setSettings] = useState<CompanySettings>(() => getSavedSettings(mode));

  useEffect(() => {
    // Initial fetch
    setSettings(getSavedSettings(mode));

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode: string; settings: CompanySettings }>;
      if (customEvent.detail && (!customEvent.detail.mode || customEvent.detail.mode === mode)) {
        setSettings(customEvent.detail.settings);
      }
    };

    window.addEventListener('datagalactic_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('datagalactic_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [mode]);

  const update = (partial: Partial<CompanySettings>) => {
    const saved = saveSettings(partial, mode);
    setSettings(saved);
    return saved;
  };

  return { settings, updateSettings: update };
}
