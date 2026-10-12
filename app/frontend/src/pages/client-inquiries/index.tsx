import React, { useState } from "react";
import {
  useGetClientInquiriesQuery,
  usePatchClientInquiryMutation,
  useDeleteClientInquiryMutation,
  type ClientInquiryIndexResource,
  type ClientInquiryFilters,
  type ClientInquirySort,
} from "@/store/slices/client-inquiries";

import { InquiriesHeader } from "./inquiries-header";
import { InquiriesTabs } from "./inquiries-tabs";
import { InquiriesFilters, type FilterInputs } from "./inquiries-filters";
import { InquiriesTable } from "./inquiries-table";
import { InquiriesPagination } from "./inquiries-pagination";
import { InquiryDetailModal } from "./inquiries-detail-modal";
import { DeleteConfirmationModal } from "./inquiries-delete-modal";

const initialFilterState: ClientInquiryFilters = {
  page: 1,
  pageSize: 20,
  sort: "Timestamp" as ClientInquirySort,
  descending: true,
  isArchived: false,
};

const initialInputState: FilterInputs = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
};

export const ClientInquiriesPage: React.FC = () => {
  const [activeQueryParams, setActiveQueryParams] =
    useState<ClientInquiryFilters>(initialFilterState);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] =
    useState<ClientInquiryIndexResource | null>(null);
  const [filterInputs, setFilterInputs] =
    useState<FilterInputs>(initialInputState);

  const cleanedFilters = Object.fromEntries(
    Object.entries(activeQueryParams).filter(
      ([_, value]) => value !== "" && value !== undefined
    )
  );

  const {
    data: inquiryPageData,
    isLoading,
    isFetching,
    error: fetchError,
    refetch,
  } = useGetClientInquiriesQuery(cleanedFilters);

  const [patchClientInquiry] = usePatchClientInquiryMutation();
  const [deleteClientInquiry, { isLoading: isDeleting }] =
    useDeleteClientInquiryMutation();

  const items = inquiryPageData?.items ?? [];
  const totalCount = inquiryPageData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / activeQueryParams.pageSize) || 1;

  const handleInputChange = (field: keyof FilterInputs, value: string) => {
    setFilterInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQueryParams((prev) => ({
      ...prev,
      ...filterInputs,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilterInputs(initialInputState);
    setActiveQueryParams((prev) => ({
      ...initialFilterState,
      isArchived: prev.isArchived,
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

  const handlePageChange = (newPage: number) => {
    setActiveQueryParams((prev) => ({ ...prev, page: newPage }));
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
      <InquiriesHeader isFetching={isFetching} onRefresh={refetch} />

      <InquiriesTabs
        isArchived={activeQueryParams.isArchived ?? false}
        onTabChange={handleTabChange}
      />

      <InquiriesFilters
        filterInputs={filterInputs}
        onInputChange={handleInputChange}
        onSubmit={handleSearchSubmit}
        onReset={handleReset}
      />

      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="card bg-base-100 shadow-md overflow-x-auto">
        <InquiriesTable
          items={items}
          isLoading={isLoading}
          isFetching={isFetching}
          currentSort={activeQueryParams.sort as ClientInquirySort}
          isDescending={activeQueryParams.descending ?? true}
          onSort={handleSort}
          onView={setSelectedInquiryId}
          onArchiveToggle={handleArchiveToggle}
          onDeleteSelect={setDeleteTarget}
        />

        <InquiriesPagination
          currentPage={activeQueryParams.page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>

      <InquiryDetailModal
        selectedInquiryId={selectedInquiryId}
        onClose={() => setSelectedInquiryId(null)}
      />

      <DeleteConfirmationModal
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ClientInquiriesPage;