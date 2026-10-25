import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

const sizes = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  '2xl': 'max-w-2xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  header?: 'gold' | 'plain';
  size?: keyof typeof sizes;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  header = 'plain',
  size = 'lg',
  children,
}: ModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  'w-full rounded-2xl bg-white border-2 border-gold/30 shadow-2xl overflow-hidden',
                  sizes[size]
                )}
              >
                <div
                  className={cn(
                    'flex items-start justify-between gap-4 px-6 py-4',
                    header === 'gold'
                      ? 'bg-gradient-to-r from-gold to-gold-light'
                      : 'border-b border-gray-100'
                  )}
                >
                  <div>
                    <Dialog.Title
                      className={cn(
                        'text-xl font-bold flex items-center gap-2',
                        header === 'gold' ? 'text-black' : 'text-gray-900'
                      )}
                    >
                      {title}
                    </Dialog.Title>
                    {description && (
                      <Dialog.Description
                        className={cn(
                          'mt-1 text-sm',
                          header === 'gold' ? 'text-black/70' : 'text-gray-600'
                        )}
                      >
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className={cn(
                      'rounded-lg p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70',
                      header === 'gold'
                        ? 'text-black/60 hover:text-black hover:bg-black/10'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
