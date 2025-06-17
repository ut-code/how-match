import { Context } from "runed";
import { assert } from "share/lib";

type MaybePromise<T> = Promise<T> | T;
type ModalConfig = {
  title: string;
  content?: string;
  buttons: {
    text: string;
    class?: string;
    onclick?: () => MaybePromise<void>;
  }[];
};

export class ModalServer {
  #current = $state<ModalConfig | undefined>(undefined);
  #shown = $state<boolean>(false);
  #resolve?: () => void;
  show(config: ModalConfig) {
    this.#current = config;
    this.#shown = true;
    const { promise, resolve } = Promise.withResolvers<void>();
    this.#resolve = resolve;
    return promise;
  }
  close() {
    const resolve = this.#resolve;
    assert(resolve != null);
    resolve();
    this.#shown = false;
    this.#current = undefined;
    this.#resolve = undefined;
  }
  get current() {
    return this.#current;
  }
  get shown() {
    return this.#shown;
  }
}

export class ModalClient {
  readonly current = $derived.by(() => this.server.current);
  readonly shown = $derived.by(() => this.server.shown);

  constructor(private server: ModalServer) {}

  show(config: ModalConfig) {
    return this.server.show(config);
  }
  close() {
    this.server.close();
  }
}

const modalContext = new Context<ModalClient>("how-match:modal");

export function useModal() {
  return modalContext.get();
}

export function setupModal(modal: ModalServer) {
  modalContext.set(new ModalClient(modal));
}
