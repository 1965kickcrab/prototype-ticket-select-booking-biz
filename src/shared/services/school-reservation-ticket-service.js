import { getDateKey, getTicketExpiryDate } from "./ticket-status-service.js";

export function getTicketReservableCount(ticket) {
  return Math.max(Number(ticket?.reservableCount ?? ticket?.remainingCount) || 0, 0);
}

export function isReservationTicketAvailable(ticket, reservations = [], context = {}) {
  if (!ticket || getTicketReservableCount(ticket) < 1) return false;
  const expiry = ticket.expiresAt || getTicketExpiryDate(ticket, reservations, context);
  const expiryKey = getDateKey(expiry);
  return !expiryKey || expiryKey >= getDateKey(new Date());
}

export function getAvailableReservationTickets(pet, reservations = [], memberId = "") {
  const ticketHistories = pet?.ticketHistories || [];
  const context = { memberId, petId: pet?.id || "", ticketHistories };
  return ticketHistories.filter((ticket) => isReservationTicketAvailable(ticket, reservations, context));
}

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
