import React from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export interface FilterInputs {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface FiltersProps {
  filterInputs: FilterInputs;
  onInputChange: (field: keyof FilterInputs, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  filterInputs,
  onInputChange,
  onSubmit,
  onReset,
}) => (
  <form
    onSubmit={onSubmit}
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
        onChange={(e) => onInputChange("firstName", e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        className="input input-bordered input-sm w-full"
        value={filterInputs.lastName}
        onChange={(e) => onInputChange("lastName", e.target.value)}
      />
      <input
        type="text"
        placeholder="Email"
        className="input input-bordered input-sm w-full"
        value={filterInputs.email}
        onChange={(e) => onInputChange("email", e.target.value)}
      />
      <input
        type="text"
        placeholder="Phone"
        className="input input-bordered input-sm w-full"
        value={filterInputs.phone}
        onChange={(e) => onInputChange("phone", e.target.value)}
      />
      <input
        type="date"
        className="input input-bordered input-sm w-full"
        value={filterInputs.dateOfBirth}
        onChange={(e) => onInputChange("dateOfBirth", e.target.value)}
      />
    </div>
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onReset}
        className="btn btn-ghost btn-sm gap-1"
      >
        <ClearIcon fontSize="small" /> Clear
      </button>
      <button type="submit" className="btn btn-primary btn-sm gap-1">
        <SearchIcon fontSize="small" /> Search
      </button>
    </div>
  </form>
);