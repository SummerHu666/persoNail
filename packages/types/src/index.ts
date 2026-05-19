export type HandParams = {
  fingerSlim: number;
  fingerLength: number;
  handWidth: number;
  nailLength: number;
  skinTone: number;
};

export type CatEyeConfig = {
  strength: number;
  direction: number;
};

export type StyleConfig = {
  baseColor: string;
  roughness: number;
  metallic: number;
  glitter: number;
  catEye: CatEyeConfig;
};

export type NailStyle = {
  id: string;
  title: string;
  cover: string;
  tags: string[];
  material_config: StyleConfig;
};

export type Decal = {
  stickerId: string;
  pos: [number, number];
  scale: number;
  rot: number;
};

export type Design = {
  id: string;
  user_id: string;
  title: string;
  hand_params_snapshot: HandParams;
  style_config: StyleConfig;
  decals: Decal[];
  created_at: string;
};

export type Recommendation = {
  styleId: string;
  score: number;
  reason: string;
};

export type Topic = {
  title: string;
  subtitle: string;
  styleIds: string[];
  copywriting: string[];
};

export type Store = {
  id: string;
  name: string;
  distance: string;
  rating: number;
  priceRange: string;
  tags: string[];
  availableStyleIds: string[];
};

export type Booking = {
  id: string;
  storeId: string;
  styleId: string;
  designId?: string;
  status: "created" | "confirmed";
  created_at: string;
};

export type TelemetryEventName =
  | "enter_tryon"
  | "adjust_morph"
  | "switch_style"
  | "change_env"
  | "save_design"
  | "click_recommend_card"
  | "click_store"
  | "create_booking";
