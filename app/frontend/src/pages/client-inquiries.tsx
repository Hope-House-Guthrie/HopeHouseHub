import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ClearIcon from "@mui/icons-material/Clear";

import {
  useGetClientInquiriesQuery,
  useGetClientInquiryByIdQuery,
  usePatchClientInquiryMutation,
  useDeleteClientInquiryMutation,
  type ClientInquiryIndexResource,
  type ClientInquiryFilters,
  type ClientInquirySort,
} from "@/store/slices/client-inquiries";

const initialFilterState: ClientInquiryFilters = {
  page: 1,
  pageSize: 20,
  sort: "Timestamp" as ClientInquirySort,
  descending: true,
  isArchived: false,
};

export const ClientInquiriesPage: React.FC = () => {
  // Query parameters state
  const [activeQueryParams, setActiveQueryParams] =
    useState<ClientInquiryFilters>(initialFilterState);

  // Detail Modal selection ID state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] =
    useState<ClientInquiryIndexResource | null>(null);

  // Form input state (buffered until form submit)
  const [filterInputs, setFilterInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  // RTK Query Hooks
  const {
    data: inquiryPageData,
    isLoading,
    isFetching,
    error: fetchError,
    refetch,
  } = useGetClientInquiriesQuery(activeQueryParams);

  const { data: selectedInquiry, isLoading: isLoadingDetail } =
    useGetClientInquiryByIdQuery(selectedInquiryId!, {
      skip: !selectedInquiryId,
    });

  const [patchClientInquiry] = usePatchClientInquiryMutation();
  const [deleteClientInquiry, { isLoading: isDeleting }] =
    useDeleteClientInquiryMutation();

  const items = inquiryPageData?.items ?? [];
  const totalCount = inquiryPageData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / activeQueryParams.pageSize) || 1;

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQueryParams((prev) => ({
      ...prev,
      ...filterInputs,
      page: 1,
    }));
  };

  const handleReset = () => {
    const resetFormInputs = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
    };
    setFilterInputs(resetFormInputs);
    setActiveQueryParams((prev) => ({
      ...initialFilterState,
      isArchived: prev.isArchived, // Preserve current tab context
    }));
  };

  const handleTabChange = (isArchived: boolean) => {
    setActiveQueryParams((prev) => ({
      ...prev,
      isArchived,
      page: 1,
    }));
  };

  const handleSort = (column: ClientInquirySort) => {
    setActiveQueryParams((prev) => {
      const isSameColumn = prev.sort === column;
      return {
        ...prev,
        sort: column,
        descending: isSameColumn ? !prev.descending : true,
        page: 1,
      };
    });
  };

  const handleArchiveToggle = async (id: string, isArchived: boolean) => {
    await patchClientInquiry({ id, patch: { isArchived: !isArchived } });
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteClientInquiry(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const errorMessage =
    fetchError && "data" in fetchError
      ? (fetchError.data as string)
      : fetchError
      ? "Failed to fetch client inquiries"
      : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Inquiries</h1>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-outline btn-sm gap-2"
        >
          <RefreshIcon
            fontSize="small"
            className={isFetching ? "animate-spin" : ""}
          />{" "}
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed w-fit">
        <button
          className={`tab ${!activeQueryParams.isArchived ? "tab-active" : ""}`}
          onClick={() => handleTabChange(false)}
        >
          Active Inquiries
        </button>
        <button
          className={`tab ${activeQueryParams.isArchived ? "tab-active" : ""}`}
          onClick={() => handleTabChange(true)}
        >
          Archived Inquiries
        </button>
      </div>

      {/* Filters Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="card bg-base-100 shadow-md p-4 space-y-4"
      >
        <div className="flex items-center gap-2 font-semibold">
          <FilterListIcon fontSize="small" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="First Name"
            className="input input-bordered input-sm w-full"
            value={filterInputs.firstName}
            onChange={(e) =>
              setFilterInputs({ ...filterInputs, firstName: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Last Name"
            className="input input-bordered input-sm w-full"
            value={filterInputs.lastName}
            onChange={(e) =>
              setFilterInputs({ ...filterInputs, lastName: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Email"
            className="input input-bordered input-sm w-full"
            value={filterInputs.email}
            onChange={(e) =>
              setFilterInputs({ ...filterInputs, email: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Phone"
            className="input input-bordered input-sm w-full"
            value={filterInputs.phone}
            onChange={(e) =>
              setFilterInputs({ ...filterInputs, phone: e.target.value })
            }
          />
          <input
            type="date"
            className="input input-bordered input-sm w-full"
            value={filterInputs.dateOfBirth}
            onChange={(e) =>
              setFilterInputs({ ...filterInputs, dateOfBirth: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-ghost btn-sm gap-1"
          >
            <ClearIcon fontSize="small" /> Clear
          </button>
          <button type="submit" className="btn btn-primary btn-sm gap-1">
            <SearchIcon fontSize="small" /> Search
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Table */}
      <div className="card bg-base-100 shadow-md overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th
                className="cursor-pointer select-none"
                onClick={() => handleSort("FirstName" as ClientInquirySort)}
              >
                First Name{" "}
                {activeQueryParams.sort === "FirstName" &&
                  (activeQueryParams.descending ? (
                    <ArrowDownwardIcon fontSize="inherit" />
                  ) : (
                    <ArrowUpwardIcon fontSize="inherit" />
                  ))}
              </th>
              <th
                className="cursor-pointer select-none"
                onClick={() => handleSort("LastName" as ClientInquirySort)}
              >
                Last Name{" "}
                {activeQueryParams.sort === "LastName" &&
                  (activeQueryParams.descending ? (
                    <ArrowDownwardIcon fontSize="inherit" />
                  ) : (
                    <ArrowUpwardIcon fontSize="inherit" />
                  ))}
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th>DOB</th>
              <th
                className="cursor-pointer select-none"
                onClick={() => handleSort("Timestamp" as ClientInquirySort)}
              >
                Submitted{" "}
                {activeQueryParams.sort === "Timestamp" &&
                  (activeQueryParams.descending ? (
                    <ArrowDownwardIcon fontSize="inherit" />
                  ) : (
                    <ArrowUpwardIcon fontSize="inherit" />
                  ))}
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
                  <td>{inquiry.phone ?? "—"}</td>
                  <td>{inquiry.dateOfBirth ?? "—"}</td>
                  <td>{new Date(inquiry.timestamp).toLocaleDateString()}</td>
                  <td className="text-right space-x-1">
                    <button
                      title="View Details"
                      className="btn btn-ghost btn-xs"
                      onClick={() => setSelectedInquiryId(inquiry.id)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                    <button
                      title={inquiry.isArchived ? "Unarchive" : "Archive"}
                      className="btn btn-ghost btn-xs"
                      onClick={() =>
                        handleArchiveToggle(inquiry.id, inquiry.isArchived)
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
                      onClick={() => setDeleteTarget(inquiry)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-base-200 gap-4">
          <span className="text-sm text-base-content/70">
            Showing Page {activeQueryParams.page} of {totalPages} ({totalCount}{" "}
            items)
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={activeQueryParams.page <= 1}
              onClick={() =>
                setActiveQueryParams((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
            >
              «
            </button>
            <button className="join-item btn btn-sm">
              Page {activeQueryParams.page}
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={activeQueryParams.page >= totalPages}
              onClick={() =>
                setActiveQueryParams((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedInquiryId && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Client Inquiry Details</h3>
            {isLoadingDetail ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : selectedInquiry ? (
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {selectedInquiry.firstName}{" "}
                  {selectedInquiry.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedInquiry.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedInquiry.phone ?? "N/A"}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {selectedInquiry.dateOfBirth ?? "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedInquiry.isArchived ? "Archived" : "Active"}
                </p>
                <p>
                  <strong>Submitted At:</strong>{" "}
                  {new Date(selectedInquiry.timestamp!).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-error">Inquiry detail unavailable.</p>
            )}
            <div className="modal-action">
              <button
                className="btn btn-sm"
                onClick={() => setSelectedInquiryId(null)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
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
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error btn-sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ClientInquiriesPage;