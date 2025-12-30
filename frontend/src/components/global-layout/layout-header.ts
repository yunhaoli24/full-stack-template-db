import type { Ref, Slot } from "vue";
import { inject, provide, ref } from "vue";

import type { LayoutHeaderProps } from "./types";

export interface LayoutHeaderState extends LayoutHeaderProps {
  actions?: Slot;
}

export interface LayoutHeaderContext {
  state: Ref<LayoutHeaderState>;
  setHeader: (header: LayoutHeaderState) => void;
  clearHeader: () => void;
}

const LAYOUT_HEADER_KEY = Symbol("LayoutHeader");

const EMPTY_HEADER: LayoutHeaderState = {
  title: "",
  sticky: false,
};

export function useLayoutHeaderProvider() {
  const state = ref<LayoutHeaderState>({ ...EMPTY_HEADER });

  const setHeader = (header: LayoutHeaderState) => {
    state.value = { ...header };
  };

  const clearHeader = () => {
    state.value = { ...EMPTY_HEADER };
  };

  const context: LayoutHeaderContext = {
    state,
    setHeader,
    clearHeader,
  };

  provide(LAYOUT_HEADER_KEY, context);
  return context;
}

export function useLayoutHeader() {
  const context = inject<LayoutHeaderContext>(LAYOUT_HEADER_KEY);
  if (!context) {
    throw new Error("useLayoutHeader must be used within a layout header provider");
  }
  return context;
}
