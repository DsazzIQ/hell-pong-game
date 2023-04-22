import Toast, { ToastStatus } from './Toast';

const AUTO_REMOVE_DELAY = 3000;
const MAX_DISPLAY_TOASTS = 3;

type ToastItem = { status: ToastStatus; message: string };
class ToastManager {
  private readonly scene: Phaser.Scene;
  private toasts: Toast[] = [];
  private toastQueue: ToastItem[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showToast(status: ToastStatus, message: string) {
    if (this.toasts.length >= MAX_DISPLAY_TOASTS) {
      this.toastQueue.push({ status, message });
    } else {
      this.createAndShowToast(status, message);
    }
  }

  protected createAndShowToast(status: ToastStatus, message: string) {
    const toast = new Toast(this.scene, status, message, this.toasts.length);

    // Handle closing the toast
    toast.onClose = () => {
      this.removeToast(toast);
    };

    toast.show();
    this.toasts.push(toast);

    // Automatically close the toast after AUTO_REMOVE_DELAY
    this.scene.time.delayedCall(AUTO_REMOVE_DELAY, () => {
      !toast.isDestroyed && toast.hide();
    });
  }

  protected removeToast(toast: Toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
    this.updateToastPositions();

    if (this.toastQueue.length) {
      const nextToast = this.toastQueue.shift();
      if (nextToast) {
        this.createAndShowToast(nextToast.status, nextToast.message);
      }
    }
  }

  protected updateToastPositions() {
    for (const [i, toast] of this.toasts.entries()) {
      toast.updateY(i);
    }
  }
}
export default ToastManager;
