import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/solid'

export const MyModal = ({ show, close, title, children }) => (
  <Transition appear show={show} as={Fragment}>
    <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={close}>
      <div className="min-h-screen px-4 text-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/*
                        Background overlay (alternate for Dialog.Overlay) 
                        Dialog.Overlay closes modal when background overlay is clicked.
                        
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
                            or
                        <div className="fixed inset-0 bg-black bg-opacity-30" />
                    */}

          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="my-8 inline-block w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title className="flex justify-between">
              <span className="text-lg font-medium leading-6 text-gray-900">{title}</span>
              <button type="button" className="" onClick={close}>
                <XIcon className="h-6 w-6 rounded-md border-1 text-gray-600" />
              </button>
            </Dialog.Title>
            <div className="mt-3">{children}</div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
)
