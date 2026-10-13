import { renderSchoolReservationDetail } from "../features/school-reservation-detail/school-reservation-detail-renderer.js";

const reservationId = new URLSearchParams(window.location.search).get("reservationId");
renderSchoolReservationDetail(document.querySelector("#app"), reservationId);
window.matchMedia("(max-width: 430px)").addEventListener("change", () => {
  renderSchoolReservationDetail(document.querySelector("#app"), reservationId);
});
