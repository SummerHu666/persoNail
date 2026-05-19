import cors from "cors";
import express from "express";
import type { Booking, Design, NailStyle, Store } from "@personail/types";

const app = express();
const port = Number(process.env.PORT ?? 4310);

const styles: NailStyle[] = [
  {
    id: "style_001",
    title: "奶茶猫眼",
    cover: "https://example.com/covers/milktea-cat-eye.jpg",
    tags: ["显白", "通勤", "春夏"],
    material_config: {
      baseColor: "#D8BFA8",
      roughness: 0.35,
      metallic: 0.1,
      glitter: 0.2,
      catEye: { strength: 0.8, direction: 0.4 }
    }
  }
];

const stores: Store[] = [
  {
    id: "store_001",
    name: "PersoNail 美甲研究所",
    distance: "0.8km",
    rating: 4.9,
    priceRange: "¥168-368",
    tags: ["猫眼专门", "可约今晚", "同款可做"],
    availableStyleIds: ["style_001"]
  }
];

const designs: Design[] = [];

app.use(cors());
app.use(express.json());

app.get("/styles/hot", (_request, response) => response.json({ data: styles }));

app.get("/styles/:id", (request, response) => {
  const style = styles.find((item) => item.id === request.params.id);
  if (!style) {
    response.status(404).json({ error: "style_not_found" });
    return;
  }
  response.json({ data: style });
});

app.post("/design/save", (request, response) => {
  const design = request.body as Design;
  designs.unshift(design);
  response.json({ data: design });
});

app.get("/design/list", (_request, response) => response.json({ data: designs }));

app.get("/stores/nearby", (_request, response) => response.json({ data: stores }));

app.post("/booking/create", (request, response) => {
  const booking: Booking = {
    id: `booking_${Date.now()}`,
    storeId: request.body?.storeId ?? "store_001",
    styleId: request.body?.styleId ?? "style_001",
    designId: request.body?.designId,
    status: "created",
    created_at: new Date().toISOString()
  };
  response.json({ data: booking });
});

app.listen(port, () => {
  console.info(`Mock API listening on http://localhost:${port}`);
});
