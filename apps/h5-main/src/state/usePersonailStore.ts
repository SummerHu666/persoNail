import { create } from "zustand";
import type { Design, HandParams, NailStyle, StyleConfig } from "@personail/types";
import { defaultHandParams, styles } from "../data/mock";

type View = "home" | "tryon" | "diy" | "recommend" | "stores";

type PersonailState = {
  view: View;
  activeStyle: NailStyle;
  handParams: HandParams;
  savedDesigns: Design[];
  setView: (view: View) => void;
  setActiveStyle: (style: NailStyle) => void;
  updateHandParam: (key: keyof HandParams, value: number) => void;
  applyStyleConfig: (styleConfig: StyleConfig) => void;
  saveDesign: () => Design;
};

export const usePersonailStore = create<PersonailState>((set, get) => ({
  view: "home",
  activeStyle: styles[0],
  handParams: defaultHandParams,
  savedDesigns: [],
  setView: (view) => set({ view }),
  setActiveStyle: (style) => set({ activeStyle: style }),
  updateHandParam: (key, value) =>
    set((state) => ({
      handParams: {
        ...state.handParams,
        [key]: value
      }
    })),
  applyStyleConfig: (styleConfig) =>
    set((state) => ({
      activeStyle: {
        ...state.activeStyle,
        material_config: styleConfig
      }
    })),
  saveDesign: () => {
    const state = get();
    const design: Design = {
      id: `design_${Date.now()}`,
      user_id: "demo_user",
      title: `${state.activeStyle.title} DIY`,
      hand_params_snapshot: state.handParams,
      style_config: state.activeStyle.material_config,
      decals: [{ stickerId: "star_pearl", pos: [0.68, 0.3], scale: 1, rot: 12 }],
      created_at: new Date().toISOString()
    };
    set((current) => ({ savedDesigns: [design, ...current.savedDesigns] }));
    return design;
  }
}));
