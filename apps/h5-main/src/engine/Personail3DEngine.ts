import type { HandParams, StyleConfig } from "@personail/types";

export type EngineOptions = {
  quality: "low" | "medium" | "high";
  enableWebGPU?: boolean;
};

export class Personail3DEngine {
  private canvas?: HTMLCanvasElement;
  private handParams?: HandParams;
  private styleConfig?: StyleConfig;

  async init(canvas: HTMLCanvasElement, options: EngineOptions) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#fff7f3";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#4a2b2d";
    context.font = "16px sans-serif";
    context.fillText(`3D engine placeholder / ${options.quality}`, 24, 36);
  }

  async loadHandModel(_url: string) {
    return Promise.resolve();
  }

  setHandParams(handParams: HandParams) {
    this.handParams = handParams;
  }

  getHandParams() {
    return this.handParams;
  }

  applyNailStyle(styleConfig: StyleConfig) {
    this.styleConfig = styleConfig;
  }

  setEnv(_envId: string) {
    return;
  }

  enableParallax(_enable: boolean) {
    return;
  }

  updateParallax(_sensorData: DeviceOrientationEvent) {
    return;
  }

  captureScreenshot() {
    return Promise.resolve(this.canvas?.toDataURL("image/png") ?? "");
  }

  dispose() {
    this.canvas = undefined;
    this.handParams = undefined;
    this.styleConfig = undefined;
  }
}
