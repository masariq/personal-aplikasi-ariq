import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmOptions {
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

let openConfirmExternal: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

export function confirm(opts: ConfirmOptions): Promise<boolean> {
  if (!openConfirmExternal) return Promise.resolve(window.confirm(opts.title));
  return openConfirmExternal(opts);
}

export function ConfirmHost() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  useEffect(() => {
    openConfirmExternal = (o) =>
      new Promise<boolean>((resolve) => {
        setOpts(o);
        setOpen(true);
        setResolver(() => resolve);
      });
    return () => {
      openConfirmExternal = null;
    };
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setOpen(false);
      resolver?.(result);
      setResolver(null);
    },
    [resolver],
  );

  return (
    <Modal
      open={open}
      onClose={() => close(false)}
      title={opts?.title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => close(false)}>
            {opts?.cancelLabel ?? 'Cancel'}
          </Button>
          <Button
            variant={opts?.danger ? 'danger' : 'primary'}
            onClick={() => close(true)}
          >
            {opts?.confirmLabel ?? 'Confirm'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-mid leading-relaxed">{opts?.body}</p>
    </Modal>
  );
}
