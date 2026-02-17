/** Type declarations for Elm modules loaded via vite-plugin-elm. */

interface ElmPort<T> {
  subscribe(callback: (value: T) => void): void;
  unsubscribe(callback: (value: T) => void): void;
}

interface ElmPortIn<T> {
  send(value: T): void;
}

interface TaggedEnvelope {
  tag: string;
  payload: unknown;
}

interface OutgoingCommand {
  command: string;
  args?: Record<string, unknown>;
}

interface ElmApp {
  ports: {
    sendToTauri: ElmPort<OutgoingCommand>;
    receiveFromTauri: ElmPortIn<TaggedEnvelope>;
    resizeComposeInput: ElmPort<null>;
  };
}

declare module "*.elm" {
  export const Elm: {
    Main: {
      init(options: { node: HTMLElement | null }): ElmApp;
    };
  };
}
