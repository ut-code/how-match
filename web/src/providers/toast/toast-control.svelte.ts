export type Toast = {
  message: string;
  kind: "success";
  timeout: number; // milliseconds
};
type InternalToast = Toast & {
  id: string;
  class: string;
};

export class ToastController {
  toasts: InternalToast[] = $state([]);

  push(toast: Toast) {
    const id = Math.random().toString();
    let class_: string;
    switch (toast.kind) {
      case "success":
        class_ = "alert-success";
        break;
      default:
        class_ = toast.kind satisfies never;
    }

    this.toasts.push({
      ...toast,
      id,
      class: class_,
    });

    $effect(() => {
      const timeoutId = setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id);
      }, toast.timeout);
      return () => clearTimeout(timeoutId);
    });
  }
}
