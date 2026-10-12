import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";

interface HeaderProps {
  isFetching: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isFetching,
  onRefresh,
}) => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold">Client Inquiries</h1>
    </div>
    <button
      onClick={onRefresh}
      disabled={isFetching}
      className="btn btn-outline btn-sm gap-2"
    >
      <RefreshIcon
        fontSize="small"
        className={isFetching ? "animate-spin" : ""}
      />
      Refresh
    </button>
  </div>
);