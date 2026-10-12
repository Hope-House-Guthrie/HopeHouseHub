import React, { useState } from "react";
import {
  useGetClientInquiriesQuery,
  usePatchClientInquiryMutation,
  useDeleteClientInquiryMutation,
  type ClientInquiryIndexResource,
  type ClientInquiryFilters,
  type ClientInquirySort,
} from "@/store/slices/client-inquiries";

import { Header } from "./header";
import { Tabs } from "./tabs";
import { Filters, type FilterInputs } from "./filters";
import { Table } from "./table";
import { Pagination } from "./pagination";
import { DetailModal } from "./detail-modal";
import { DeleteModal } from "./delete-modal";

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
      <Header isFetching={isFetching} onRefresh={refetch} />

      <Tabs
        isArchived={activeQueryParams.isArchived ?? false}
        onTabChange={handleTabChange}
      />

      <Filters
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
        <Table
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

        <Pagination
          currentPage={activeQueryParams.page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>

      <DetailModal
        selectedInquiryId={selectedInquiryId}
        onClose={() => setSelectedInquiryId(null)}
      />

      <DeleteModal
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ClientInquiriesPage;