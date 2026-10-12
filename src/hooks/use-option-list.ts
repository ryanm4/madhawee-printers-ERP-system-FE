import { useEffect, useState } from "react";
import {
  COATING_TYPES,
  INK_STATUS,
  ITEM_CATEGORY,
  ITEM_SUB_CATEGORY,
  PLATES_STATUS,
  PRODUCT_TYPES,
  UNIT_OF_MEASSURE,
} from "@/config/enum";
import { SettingsApi, type OptionListKey } from "@/modules/settings/api";

export interface SelectOption {
  value: string;
  label: string;
}

const toOptions = (values: string[]): SelectOption[] => values.map((value) => ({ value, label: value }));

/**
 * The built-in values, used until the saved lists arrive and if they cannot be loaded
 * (for example before the settings migration has been run), so forms never go empty.
 */
const FALLBACK: Record<OptionListKey, SelectOption[]> = {
  item_category: toOptions(Object.values(ITEM_CATEGORY)),
  item_sub_category: toOptions(Object.values(ITEM_SUB_CATEGORY)),
  unit_of_measure: toOptions(Object.values(UNIT_OF_MEASSURE)),
  product_type: toOptions(Object.values(PRODUCT_TYPES)),
  coating_type: toOptions(Object.values(COATING_TYPES)),
  plate_status: toOptions(Object.values(PLATES_STATUS)),
  ink_status: toOptions(Object.values(INK_STATUS)),
};

/** One request shared by every form on the page; cleared when Settings changes a list */
let cache: Promise<Record<OptionListKey, SelectOption[]>> | null = null;

function loadLists() {
  if (!cache) {
    cache = SettingsApi.getOptionLists()
      .then(({ data }) => {
        const lists = { ...FALLBACK };
        (Object.keys(FALLBACK) as OptionListKey[]).forEach((key) => {
          const saved = data?.lists?.[key];
          if (saved && saved.length > 0) {
            lists[key] = saved.map((option) => ({ value: option.value, label: option.label }));
          }
        });
        return lists;
      })
      .catch(() => {
        cache = null; // try again next time a form opens
        return FALLBACK;
      });
  }
  return cache;
}

/** Call after a list is edited so the next form that opens reads the new values */
export function invalidateOptionLists() {
  cache = null;
}

/**
 * The choices for one dropdown, as set in Settings.
 *
 * `current` keeps values a record already holds in the list even when they have since been
 * switched off, so an edit form still shows what was saved instead of an empty select.
 */
export function useOptionList(key: OptionListKey, current?: string | null | Array<string | null | undefined>) {
  const [lists, setLists] = useState<Record<OptionListKey, SelectOption[]> | null>(null);

  useEffect(() => {
    let alive = true;
    loadLists().then((loaded) => alive && setLists(loaded));
    return () => {
      alive = false;
    };
  }, []);

  const options = (lists ?? FALLBACK)[key];
  const held = (Array.isArray(current) ? current : [current]).filter(
    (value): value is string => !!value && !options.some((option) => option.value === value)
  );

  return held.length > 0 ? [...options, ...toOptions([...new Set(held)])] : options;
}
