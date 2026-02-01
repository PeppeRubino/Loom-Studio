import { useCallback, useState } from 'react';

type WardrobeFilter = {
  category?: string;
  color?: string;
  tag?: string;
};

const emptyFilter: WardrobeFilter = {};

export const useWardrobeFilters = () => {
  const [filters, setFilters] = useState<WardrobeFilter>(emptyFilter);

  const toggleFilter = useCallback((key: keyof WardrobeFilter, value: string) => {
    setFilters((previous) => ({
      ...previous,
      [key]: previous[key] === value ? undefined : value,
    }));
  }, []);

  const resetFilters = useCallback(() => setFilters(emptyFilter), []);

  return {
    filters,
    toggleFilter,
    resetFilters,
  } as const;
};

