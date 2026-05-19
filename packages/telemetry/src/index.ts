import type { TelemetryEventName } from "@personail/types";

export type TelemetryPayload = Record<string, string | number | boolean | null | undefined>;

type Transport = (event: {
  name: TelemetryEventName;
  payload: TelemetryPayload;
  timestamp: number;
}) => void;

const defaultTransport: Transport = (event) => {
  console.info("[telemetry]", event.name, event.payload);
};

export class TelemetryClient {
  private transport: Transport;

  constructor(transport: Transport = defaultTransport) {
    this.transport = transport;
  }

  track(name: TelemetryEventName, payload: TelemetryPayload = {}) {
    this.transport({
      name,
      payload,
      timestamp: Date.now()
    });
  }
}

export const telemetry = new TelemetryClient();
