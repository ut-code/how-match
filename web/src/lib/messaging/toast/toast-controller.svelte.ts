import { Context } from "runed";

export type Toast = {
  message: string;
  kind: "success" | "error";
  timeout?: number; // milliseconds
};
type InternalToast = Toast & {
  id: string;
  class: string;
};

export const DEFAULT_TIMEOUT = 2000;

export class ToastServer {
  toasts: InternalToast[] = $state([]);

  push(toast: Toast): Promise<void> {
    const id = Math.random().toString();
    let class_: string;
    switch (toast.kind) {
      case "success":
        class_ = "alert-success";
        break;
      case "error":
        class_ = "alert-error";
        break;
      default:
        class_ = toast.kind satisfies never;
    }

    this.toasts.push({
      ...toast,
      id,
      class: class_,
    });

    return new Promise((resolve) => {
      const timeout = toast.timeout ?? DEFAULT_TIMEOUT;
      setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id);
        resolve();
      }, timeout);
    });
  }
}

export class ToastClient {
  constructor(private server: ToastServer) {}
  push(toast: Toast): Promise<void> {
    return this.server.push(toast);
  }
}

const toastContext = new Context<ToastClient>("how-match:toast");

export function setupToast(toast: ToastServer) {
  toastContext.set(new ToastClient(toast));
}

export function useToast() {
  return toastContext.get();
}
