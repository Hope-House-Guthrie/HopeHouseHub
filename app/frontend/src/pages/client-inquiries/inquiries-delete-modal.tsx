import React from "react";
import type { ClientInquiryIndexResource } from "@/store/slices/client-inquiries";

interface DeleteConfirmationModalProps {
  deleteTarget: ClientInquiryIndexResource | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  deleteTarget,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!deleteTarget) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-error">Confirm Delete</h3>
        <p className="py-4 text-sm">
          Are you sure you want to delete the inquiry for{" "}
          <strong>
            {deleteTarget.firstName} {deleteTarget.lastName}
          </strong>
          ? This action cannot be undone.
        </p>
        <div className="modal-action">
          <button
            className="btn btn-ghost btn-sm"
            disabled={isDeleting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="btn btn-error btn-sm"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
};