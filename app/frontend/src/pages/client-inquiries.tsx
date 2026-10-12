import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

import { type AppDispatch, type RootState } from "@/store";
import {
  fetchClientInquiries,
  fetchClientInquiryById,
  patchClientInquiry,
  deleteClientInquiry,
  setFilters,
  resetFilters,
  clearSelectedInquiry,
  type ClientInquiryIndexResource,
  type ClientInquirySort,
} from "@/store/slices/client-inquiries";

export const ClientInquiriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalCount, selectedInquiry, filters, loading, error } = useSelector(
    (state: RootState) => state.clientInquiries
  );

  const [deleteTarget, setDeleteTarget] = useState<ClientInquiryIndexResource | null>(null);
  const [filterInputs, setFilterInputs] = useState({
    firstName: filters.firstName || "",
    lastName: filters.lastName || "",
    email: filters.email || "",
    phone: filters.phone || "",
    dateOfBirth: filters.dateOfBirth || "",
  });

  useEffect(() => {
    dispatch(fetchClientInquiries());
  }, [dispatch, filters.page, filters.pageSize, filters.sort, filters.descending, filters.isArchived]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ ...filterInputs, page: 1 }));
    dispatch(fetchClientInquiries());
  };

  const handleReset = () => {
    setFilterInputs({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
    });
    dispatch(resetFilters());
    dispatch(fetchClientInquiries());
  };

  const handleSort = (column: ClientInquirySort) => {
    const isSameColumn = filters.sort === column;
    const nextDescending = isSameColumn ? !filters.descending : true;
    dispatch(setFilters({ sort: column, descending: nextDescending, page: 1 }));
  };

  const handleArchiveToggle = (id: string, isArchived: boolean) => {
    dispatch(patchClientInquiry({ id, patch: { isArchived: !isArchived } }));
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteClientInquiry(deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const totalPages = Math.ceil(totalCount / filters.pageSize) || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Inquiries</h1>
        </div>
        <button
          onClick={() => dispatch(fetchClientInquiries())}
          className="btn btn-outline btn-sm gap-2"
        >
          <RefreshIcon fontSize="small" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed w-fit">
        <button
          className={`tab ${!filters.isArchived ? "tab-active" : ""}`}
          onClick={() => dispatch(setFilters({ isArchived: false, page: 1 }))}
        >
          Active Inquiries
        </button>
        <button
          className={`tab ${filters.isArchived ? "tab-active" : ""}`}
          onClick={() => dispatch(setFilters({ isArchived: true, page: 1 }))}
        >
          Archived Inquiries
        </button>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="card bg-base-100 shadow-md p-4 space-y-4">
        <div className="flex items-center gap-2 font-semibold">
          <FilterListIcon fontSize="small" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="First Name"
            className="input input-bordered input-sm w-full"
            value={filterInputs.firstName}
            onChange={(e) => setFilterInputs({ ...filterInputs, firstName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="input input-bordered input-sm w-full"
            value={filterInputs.lastName}
            onChange={(e) => setFilterInputs({ ...filterInputs, lastName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Email"
            className="input input-bordered input-sm w-full"
            value={filterInputs.email}
            onChange={(e) => setFilterInputs({ ...filterInputs, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone"
            className="input input-bordered input-sm w-full"
            value={filterInputs.phone}
            onChange={(e) => setFilterInputs({ ...filterInputs, phone: e.target.value })}
          />
          <input
            type="date"
            className="input input-bordered input-sm w-full"
            value={filterInputs.dateOfBirth}
            onChange={(e) => setFilterInputs({ ...filterInputs, dateOfBirth: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={handleReset} className="btn btn-ghost btn-sm gap-1">
            <ClearIcon fontSize="small" /> Clear
          </button>
          <button type="submit" className="btn btn-primary btn-sm gap-1">
            <SearchIcon fontSize="small" /> Search
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="card bg-base-100 shadow-md overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="cursor-pointer select-none" onClick={() => handleSort("FirstName" as ClientInquirySort)}>
                First Name {filters.sort === "FirstName" && (filters.descending ? <ArrowDownwardIcon fontSize="inherit" /> : <ArrowUpwardIcon fontSize="inherit" />)}
              </th>
              <th className="cursor-pointer select-none" onClick={() => handleSort("LastName" as ClientInquirySort)}>
                Last Name {filters.sort === "LastName" && (filters.descending ? <ArrowDownwardIcon fontSize="inherit" /> : <ArrowUpwardIcon fontSize="inherit" />)}
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th>DOB</th>
              <th className="cursor-pointer select-none" onClick={() => handleSort("Timestamp" as ClientInquirySort)}>
                Submitted {filters.sort === "Timestamp" && (filters.descending ? <ArrowDownwardIcon fontSize="inherit" /> : <ArrowUpwardIcon fontSize="inherit" />)}
              </th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
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
                      onClick={() => dispatch(fetchClientInquiryById(inquiry.id))}
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                    <button
                      title={inquiry.isArchived ? "Unarchive" : "Archive"}
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleArchiveToggle(inquiry.id, inquiry.isArchived)}
                    >
                      {inquiry.isArchived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
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
            Showing Page {filters.page} of {totalPages} ({totalCount} items)
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={filters.page <= 1}
              onClick={() => dispatch(setFilters({ page: filters.page - 1 }))}
            >
              «
            </button>
            <button className="join-item btn btn-sm">Page {filters.page}</button>
            <button
              className="join-item btn btn-sm"
              disabled={filters.page >= totalPages}
              onClick={() => dispatch(setFilters({ page: filters.page + 1 }))}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedInquiry && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Client Inquiry Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {selectedInquiry.firstName} {selectedInquiry.lastName}</p>
              <p><strong>Email:</strong> {selectedInquiry.email}</p>
              <p><strong>Phone:</strong> {selectedInquiry.phone ?? "N/A"}</p>
              <p><strong>Date of Birth:</strong> {selectedInquiry.dateOfBirth ?? "N/A"}</p>
              <p><strong>Status:</strong> {selectedInquiry.isArchived ? "Archived" : "Active"}</p>
              <p><strong>Submitted At:</strong> {new Date(selectedInquiry.timestamp!).toLocaleString()}</p>
            </div>
            <div className="modal-action">
              <button className="btn btn-sm" onClick={() => dispatch(clearSelectedInquiry())}>
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
              <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-error btn-sm" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ClientInquiriesPage;