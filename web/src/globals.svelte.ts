import { ModalController } from "./providers/modal/modal-controller.svelte";
import { ToastController } from "./providers/toast/toast-control.svelte";

export const toast = new ToastController();
export const modal = new ModalController();
