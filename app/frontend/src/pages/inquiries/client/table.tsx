import React from "react";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import type {
  ClientInquiryIndexResource,
  ClientInquirySort,
} from "@/store/slices/client-inquiries";

interface TableProps {
  items: ClientInquiryIndexResource[];
  isLoading: boolean;
  isFetching: boolean;
  currentSort: ClientInquirySort;
  isDescending: boolean;
  onSort: (column: ClientInquirySort) => void;
  onView: (id: string) => void;
  onArchiveToggle: (id: string, isArchived: boolean) => void;
  onDeleteSelect: (item: ClientInquiryIndexResource) => void;
}

export const Table: React.FC<TableProps> = ({
  items,
  isLoading,
  isFetching,
  currentSort,
  isDescending,
  onSort,
  onView,
  onArchiveToggle,
  onDeleteSelect,
}) => {
  const renderSortIcon = (column: ClientInquirySort) => {
    if (currentSort !== column) return null;
    return isDescending ? (
      <ArrowDownwardIcon fontSize="inherit" />
    ) : (
      <ArrowUpwardIcon fontSize="inherit" />
    );
  };

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th
            className="cursor-pointer select-none"
            onClick={() => onSort("FirstName" as ClientInquirySort)}
          >
            First Name {renderSortIcon("FirstName" as ClientInquirySort)}
          </th>
          <th
            className="cursor-pointer select-none"
            onClick={() => onSort("LastName" as ClientInquirySort)}
          >
            Last Name {renderSortIcon("LastName" as ClientInquirySort)}
          </th>
          <th>Email</th>
          <th>Phone</th>
          <th>DOB</th>
          <th
            className="cursor-pointer select-none"
            onClick={() => onSort("Timestamp" as ClientInquirySort)}
          >
            Submitted {renderSortIcon("Timestamp" as ClientInquirySort)}
          </th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {isLoading || isFetching ? (
          <tr>
            <td colSpan={7} className="text-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan={7} className="text-center py-8 text-base-content/60">
              No client inquiries found.
            </td>
          </tr>
        ) : (
          items.map((inquiry) => (
            <tr key={inquiry.id} className="hover">
              <td className="font-medium">{inquiry.firstName}</td>
              <td className="font-medium">{inquiry.lastName}</td>
              <td>{inquiry.email}</td>
              <td>{inquiry.phone || "—"}</td>
              <td>{inquiry.dateOfBirth || "—"}</td>
              <td>
                {inquiry.timestamp
                  ? new Date(inquiry.timestamp).toLocaleDateString()
                  : "—"}
              </td>
              <td className="text-right space-x-1">
                <button
                  title="View Details"
                  className="btn btn-ghost btn-xs"
                  onClick={() => onView(inquiry.id)}
                >
                  <VisibilityIcon fontSize="small" />
                </button>
                <button
                  title={inquiry.isArchived ? "Unarchive" : "Archive"}
                  className="btn btn-ghost btn-xs"
                  onClick={() =>
                    onArchiveToggle(inquiry.id, inquiry.isArchived)
                  }
                >
                  {inquiry.isArchived ? (
                    <UnarchiveIcon fontSize="small" />
                  ) : (
                    <ArchiveIcon fontSize="small" />
                  )}
                </button>
                <button
                  title="Delete"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => onDeleteSelect(inquiry)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};