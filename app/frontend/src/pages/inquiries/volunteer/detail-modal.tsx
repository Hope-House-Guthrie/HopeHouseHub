import React from "react";
import { useGetVolunteerInquiryByIdQuery } from "@/store/slices/volunteer-inquiries";

interface DetailModalProps {
  selectedInquiryId: string | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  selectedInquiryId,
  onClose,
}) => {
  const {
    data: selectedInquiry,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useGetVolunteerInquiryByIdQuery(selectedInquiryId as string, {
    skip: !selectedInquiryId,
  });

  if (!selectedInquiryId) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex justify-between items-start mb-4 border-b border-base-200 pb-3">
          <div>
            <h3 className="font-bold text-xl">Volunteer Inquiry Details</h3>
            <p className="text-xs text-base-content/60 font-mono mt-0.5">
              ID: {selectedInquiryId}
            </p>
          </div>
          {selectedInquiry && (
            <span
              className={`badge ${
                selectedInquiry.isArchived ? "badge-warning" : "badge-success"
              }`}
            >
              {selectedInquiry.isArchived ? "Archived" : "Active"}
            </span>
          )}
        </div>

        {isLoadingDetail ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : detailError ? (
          <div className="alert alert-error my-4">
            <span>Failed to retrieve inquiry details from backend.</span>
          </div>
        ) : selectedInquiry ? (
          <div className="space-y-4 text-sm">
            {/* Personal & Organization Information */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-base-content/60 mb-2">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-200/50 p-3 rounded-lg">
                <div>
                  <span className="text-xs text-base-content/60 block">
                    Full Name
                  </span>
                  <span className="font-medium">
                    {[selectedInquiry.firstName, selectedInquiry.lastName]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-base-content/60 block">
                    Organization
                  </span>
                  <span className="font-medium">
                    {selectedInquiry.organization || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-base-content/60 mb-2">
                Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-200/50 p-3 rounded-lg">
                <div>
                  <span className="text-xs text-base-content/60 block">
                    Email
                  </span>
                  <span className="font-medium break-all">
                    {selectedInquiry.email || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-base-content/60 block">
                    Phone
                  </span>
                  <span className="font-medium">
                    {selectedInquiry.phone || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Volunteer Profile & Availability */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-base-content/60 mb-2">
                Volunteer Preferences
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-200/50 p-3 rounded-lg">
                <div>
                  <span className="text-xs text-base-content/60 block">
                    Volunteer Type
                  </span>
                  <span className="font-medium">
                    {selectedInquiry.volunteerType || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-base-content/60 block">
                    Availability
                  </span>
                  <span className="font-medium">
                    {selectedInquiry.availability || "—"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-base-content/60 block mb-1">
                    Interests
                  </span>
                  {selectedInquiry.interests && selectedInquiry.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedInquiry.interests.map((interest, index) => (
                        <span key={index} className="badge badge-neutral badge-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-medium">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Message / Notes */}
            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider text-base-content/60 mb-2">
                Message / Notes
              </h4>
              <div className="bg-base-200/50 p-3 rounded-lg whitespace-pre-wrap min-h-[4rem]">
                {selectedInquiry.message ? (
                  selectedInquiry.message
                ) : (
                  <span className="italic text-base-content/50">
                    No additional message provided.
                  </span>
                )}
              </div>
            </div>

            {/* System Metadata */}
            <div className="text-xs text-base-content/60 pt-2 border-t border-base-200 flex justify-between">
              <span>
                Submitted:{" "}
                {selectedInquiry.timestamp
                  ? new Date(selectedInquiry.timestamp).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        ) : null}

        <div className="modal-action">
          <button className="btn btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};