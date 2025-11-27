export const renderStatusBadge = (status?: string) => {
  const badgeClassByStatus: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 border border-gray-200",
    submit: "bg-blue-100 text-blue-800 border border-blue-200",
    waiting_payment: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    paid: "bg-green-100 text-green-800 border border-green-200",
    cancelled: "bg-red-100 text-red-800 border border-red-200",
    refunded: "bg-purple-100 text-purple-800 border border-purple-200",
  };

  const textByStatus: Record<string, string> = {
    draft: "Draft",
    submit: "Submitted",
    waiting_payment: "Waiting Payment",
    paid: "Paid",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };

  const className =
    badgeClassByStatus[status ?? ""] ??
    "bg-gray-100 text-gray-800 border border-gray-200";
  const label = textByStatus[status ?? ""] ?? status ?? "-";

  return (
    <span className={`px-3 rounded-full text-md ${className}`}>{label}</span>
  );
};
