import { getDateKey, getFilteredReservations } from "./school-home-state.js";
import { getReservationPet } from "./school-home-reservation-service.js";
import { getTicketUsageRound } from "../../shared/services/school-reservation-ticket-service.js";

const PAGE_SIZE = 20;

export function getReservationCreatedAtText(reservation) {
  const value = reservation.createdAt || reservation.reservedAt;
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "-";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${getDateKey(date)} ${hours}:${minutes}`;
}

export function getReservationListPage(state) {
  const reservations = getFilteredReservations(state).filter((reservation) => {
    if (state.hideCancelledReservations && reservation.status === "취소") return false;
    return !state.selectedReservationMember?.memberId || reservation.memberId === state.selectedReservationMember.memberId;
  }).sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")));
  const totalPages = Math.max(1, Math.ceil(reservations.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, state.reservationListPage), totalPages);
  return {
    currentPage,
    totalPages,
    reservations: reservations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
  };
}

export function getReservationTicketColumns(state, reservation) {
  const member = state.members.find((item) => item.id === reservation.memberId);
  const pet = getReservationPet(member, reservation.petId);
  const ticket = reservation.isOverbooked ? null : pet?.ticketHistories?.find((item) => item.id === reservation.ticketHistoryId);
  const totalCount = ticket?.totalCount ?? ticket?.quantity;
  return [
    reservation.isOverbooked ? "-" : reservation.ticketName || ticket?.ticketName || "-",
    ticket?.issuedAt?.slice(0, 10) || "-",
    totalCount == null ? "-" : `${totalCount}회`,
    getTicketUsageRound(reservation, ticket, state.reservations),
  ];
}
