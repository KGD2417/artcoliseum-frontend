/** Delivery lifecycle stages, shared across checkout + profile tracking views.
 *  The courier is shown separately (delivery.courier), so labels stay generic. */
export const STAGE_ORDER = [
  "order_confirmed",
  "curation_crating",
  "dispatched",
  "out_for_delivery",
  "installation",
  "delivered",
];

export const STAGE_LABEL = {
  order_confirmed: "ORDER CONFIRMED",
  curation_crating: "CURATION & CRATING",
  dispatched: "DISPATCHED",
  out_for_delivery: "OUT FOR DELIVERY",
  installation: "FINAL INSTALLATION",
  delivered: "DELIVERED",
};
