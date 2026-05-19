import type { HandParams, NailStyle, Store, Topic } from "@personail/types";

export const defaultHandParams: HandParams = {
  fingerSlim: 0.5,
  fingerLength: 0.5,
  handWidth: 0.46,
  nailLength: 0.52,
  skinTone: 0.48
};

export const styles: NailStyle[] = [
  {
    id: "style_001",
    title: "奶茶猫眼",
    cover: "linear-gradient(135deg, #f3d6c5, #af7d62)",
    tags: ["显白", "通勤", "春夏"],
    material_config: {
      baseColor: "#D8BFA8",
      roughness: 0.35,
      metallic: 0.1,
      glitter: 0.2,
      catEye: { strength: 0.8, direction: 0.4 }
    }
  },
  {
    id: "style_002",
    title: "莓果镜面",
    cover: "linear-gradient(135deg, #ff9fb7, #8f1f48)",
    tags: ["约会", "镜面", "显气色"],
    material_config: {
      baseColor: "#B7355C",
      roughness: 0.18,
      metallic: 0.55,
      glitter: 0.28,
      catEye: { strength: 0.25, direction: 0.7 }
    }
  },
  {
    id: "style_003",
    title: "月光法式",
    cover: "linear-gradient(135deg, #fff7ef, #c9d7e6)",
    tags: ["法式", "婚礼", "清透"],
    material_config: {
      baseColor: "#F7EDE4",
      roughness: 0.28,
      metallic: 0.18,
      glitter: 0.42,
      catEye: { strength: 0.36, direction: 0.2 }
    }
  },
  {
    id: "style_004",
    title: "薄荷银砂",
    cover: "linear-gradient(135deg, #a6ead6, #798da3)",
    tags: ["旅行", "亮片", "冷调"],
    material_config: {
      baseColor: "#8EDCCB",
      roughness: 0.42,
      metallic: 0.34,
      glitter: 0.75,
      catEye: { strength: 0.18, direction: 0.5 }
    }
  },
  {
    id: "style_005",
    title: "乌龙玫瑰",
    cover: "linear-gradient(135deg, #d9a2a5, #6f4d59)",
    tags: ["秋冬", "高级", "短甲"],
    material_config: {
      baseColor: "#A76573",
      roughness: 0.5,
      metallic: 0.08,
      glitter: 0.18,
      catEye: { strength: 0.48, direction: 0.62 }
    }
  }
];

export const topic: Topic = {
  title: "早春通勤显白组",
  subtitle: "低饱和、微光泽，适合日常和镜头展示。",
  styleIds: ["style_001", "style_003", "style_005"],
  copywriting: ["柔雾底色降低攻击感", "猫眼微光让手部更有层次", "短甲也能保持精致比例"]
};

export const stores: Store[] = [
  {
    id: "store_001",
    name: "PersoNail 美甲研究所",
    distance: "0.8km",
    rating: 4.9,
    priceRange: "¥168-368",
    tags: ["猫眼专门", "可约今晚", "同款可做"],
    availableStyleIds: ["style_001", "style_002", "style_004"]
  },
  {
    id: "store_002",
    name: "晴川手作 Nail Bar",
    distance: "1.4km",
    rating: 4.8,
    priceRange: "¥128-298",
    tags: ["法式强项", "近地铁", "学生优惠"],
    availableStyleIds: ["style_003", "style_005"]
  },
  {
    id: "store_003",
    name: "Mooncoat Studio",
    distance: "2.1km",
    rating: 4.7,
    priceRange: "¥198-428",
    tags: ["镜面", "亮片", "预约制"],
    availableStyleIds: ["style_001", "style_002", "style_003", "style_004"]
  }
];
