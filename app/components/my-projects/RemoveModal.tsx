'use client';

import React, { useEffect, useRef } from 'react';

interface RemoveModalProps {
  customer: {
    id: string | number;  //   Union type
    name: string;
  };
  removeQueue: (id: string | number) => Promise<void>;  //   Promise return
  onClose: () => void;
}

export default function RemoveModal({
  customer,
  removeQueue,
  onClose,
}: RemoveModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    modalRef.current?.showModal();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modalRef.current?.close();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleRemove = () => {
    removeQueue(customer.id);
    modalRef.current?.close();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === modalRef.current) {
      modalRef.current?.close();
      onClose();
    }
  };

  return (
    <dialog
      ref={modalRef}
      className="modal modal-open"
      onClick={handleBackdropClick}
    >
      <div className="modal-box w-11/12 max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-gray-900">Delete Project</h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700">Project ID:</span>
              <span className="font-mono text-sm text-gray-900 bg-gray-200 px-2 py-0.5 rounded">
                {customer.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Project name:</span>
              <span className="text-sm text-gray-900 font-medium">{customer.name}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRemove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-200"
          >
            Delete
          </button>

          <button
            onClick={() => {
              modalRef.current?.close();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
