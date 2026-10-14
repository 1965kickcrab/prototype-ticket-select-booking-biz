export function getTicketUsageRound(reservation, ticketHistory, reservations, { includeTotal = true } = {}) {
  const totalCount = Math.max(Number(ticketHistory?.totalCount ?? ticketHistory?.quantity) || 0, 0);
  if (!reservation?.ticketHistoryId || reservation?.isOverbooked || (includeTotal && totalCount <= 0)) return "-";

  const ticketReservations = (reservations || [])
    .map((item) => item.id === reservation.id ? reservation : item)
    .filter((item) => item.ticketHistoryId === reservation.ticketHistoryId && item.status !== "취소")
    .sort((left, right) => {
      const leftTime = Date.parse(left.createdAt || left.reservedAt || left.date || "");
      const rightTime = Date.parse(right.createdAt || right.reservedAt || right.date || "");
      if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) return leftTime - rightTime;
      return String(left.id || "").localeCompare(String(right.id || ""));
    });
  const usageRound = ticketReservations.findIndex((item) => item.id === reservation.id) + 1;
  return usageRound > 0 ? includeTotal ? `${usageRound}/${totalCount}회차` : `${usageRound}회차` : "-";
}
