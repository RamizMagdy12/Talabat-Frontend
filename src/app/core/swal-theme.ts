import Swal, { type SweetAlertOptions } from 'sweetalert2';

const dialogClass = {
  popup: 'tb-swal',
  title: 'tb-swal__title',
  htmlContainer: 'tb-swal__text',
  confirmButton: 'tb-swal__btn tb-swal__btn--solid',
  cancelButton: 'tb-swal__btn tb-swal__btn--ghost',
  denyButton: 'tb-swal__btn tb-swal__btn--ghost',
  actions: 'tb-swal__actions',
  timerProgressBar: 'tb-swal__timer',
  icon: 'tb-swal__icon'
};

const toastClass = {
  popup: 'tb-toast',
  title: 'tb-toast__title',
  htmlContainer: 'tb-toast__text',
  timerProgressBar: 'tb-toast__timer',
  icon: 'tb-toast__icon'
};

const originalFire = Swal.fire.bind(Swal);

function mergeOptions(options: SweetAlertOptions): SweetAlertOptions {
  const isToast = options.toast === true;
  const baseClass = isToast ? toastClass : dialogClass;
  const incoming = (options.customClass ?? {}) as Record<string, string>;

  return {
    buttonsStyling: false,
    reverseButtons: true,
    confirmButtonText: options.confirmButtonText ?? 'OK',
    cancelButtonText: options.cancelButtonText ?? 'Cancel',
    ...options,
    customClass: {
      ...baseClass,
      ...incoming
    }
  };
}

Swal.fire = ((...args: unknown[]) => {
  if (args.length === 0) {
    return originalFire(mergeOptions({}));
  }

  if (typeof args[0] === 'string') {
    const [title, text, icon] = args as [string, string?, SweetAlertOptions['icon']?];
    return originalFire(mergeOptions({ title, text, icon }));
  }

  return originalFire(mergeOptions(args[0] as SweetAlertOptions));
}) as typeof Swal.fire;
