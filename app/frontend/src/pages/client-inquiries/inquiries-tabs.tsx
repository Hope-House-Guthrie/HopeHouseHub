import React from "react";

interface InquiriesTabsProps {
  isArchived: boolean;
  onTabChange: (isArchived: boolean) => void;
}

export const InquiriesTabs: React.FC<InquiriesTabsProps> = ({
  isArchived,
  onTabChange,
}) => (
  <div className="tabs tabs-boxed w-fit">
    <button
      className={`tab ${!isArchived ? "tab-active" : ""}`}
      onClick={() => onTabChange(false)}
    >
      Active Inquiries
    </button>
    <button
      className={`tab ${isArchived ? "tab-active" : ""}`}
      onClick={() => onTabChange(true)}
    >
      Archived Inquiries
    </button>
  </div>
);