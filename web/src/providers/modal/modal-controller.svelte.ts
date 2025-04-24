import { assert } from "share/lib";

type ModalConfig = {
  title: string;
  content?: string;
  buttons: {
    text: string;
    class?: string;
    onclick?: () => Promise<void>;
  }[];
};

export class ModalController {
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
    resolve?.();
    this.#shown = false;
  }
  get current() {
    return this.#current;
  }
  get shown() {
    return this.#shown;
  }
}
