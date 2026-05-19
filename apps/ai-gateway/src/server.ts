import cors from "cors";
import express from "express";
import { z } from "zod";
import type { Recommendation, Topic } from "@personail/types";

const app = express();
const port = Number(process.env.PORT ?? 4320);

app.use(cors());
app.use(express.json());

const recommendSchema = z.object({
  userId: z.string().default("demo_user"),
  styleIds: z.array(z.string()).min(1).default(["style_001", "style_003", "style_005"]),
  handParams: z.record(z.number()).optional()
});

app.post("/ai/recommend", (request, response) => {
  const input = recommendSchema.safeParse(request.body);
  if (!input.success) {
    response.status(400).json({ error: "invalid_payload", detail: input.error.flatten() });
    return;
  }

  const result: Recommendation[] = input.data.styleIds.map((styleId, index) => ({
    styleId,
    score: Number((0.96 - index * 0.06).toFixed(2)),
    reason: "基于当前肤色、甲长和近期通勤场景偏好，推荐这款低饱和微光款。"
  }));

  response.json({ data: result, promptVersion: "recommend-demo-v1" });
});

app.post("/ai/topic", (_request, response) => {
  const topic: Topic = {
    title: "早春通勤显白组",
    subtitle: "低饱和、微光泽，适合日常和镜头展示。",
    styleIds: ["style_001", "style_003", "style_005"],
    copywriting: ["柔雾底色降低攻击感", "猫眼微光让手部更有层次", "短甲也能保持精致比例"]
  };

  response.json({ data: topic, promptVersion: "topic-demo-v1" });
});

app.post("/ai/tag", (request, response) => {
  const source = String(request.body?.description ?? "");
  const tags = ["显白", "通勤", "春夏", "猫眼", "短甲"].filter((tag) => source.includes(tag));
  response.json({ data: { tags: tags.length ? tags : ["显白", "通勤"] } });
});

app.listen(port, () => {
  console.info(`AI Gateway listening on http://localhost:${port}`);
});
