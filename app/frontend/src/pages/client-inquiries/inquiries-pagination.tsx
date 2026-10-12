import React from "react";

interface InquiriesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

export const InquiriesPagination: React.FC<InquiriesPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}) => (
  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-base-200 gap-4">
    <span className="text-sm text-base-content/70">
      Showing Page {currentPage} of {totalPages} ({totalCount} items)
    </span>
    <div className="join">
      <button
        className="join-item btn btn-sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        «
      </button>
      <button className="join-item btn btn-sm">Page {currentPage}</button>
      <button
        className="join-item btn btn-sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        »
      </button>
    </div>
  </div>
);