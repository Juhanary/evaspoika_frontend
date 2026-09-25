// Tilauksen tila suomeksi. Kaikki tilaa näyttävät kohdat käyttävät tätä, jottei
// sama tilaus näy eri nimellä eri näkymässä.
//
// Netvisorin tilakoodi (netvisor_status) ratkaisee. Sovelluksen oma `status`
// kertoo vain mistä tilaus tuli ('sent' = tuotu Netvisorista), joten se ei saa
// ohittaa Netvisorin tilaa: aiemmin tilauslista näytti Netvisorista tuodun
// avoimen tilauksen tekstillä "sent" ja tabletilla luodun tekstillä "Avoin".

type OrderStatusFields = {
  status?: string | null;
  netvisor_status?: string | null;
  deleted_at?: string | null;
};

// Myyntitilauksen tilat Netvisorin preinvoice-listalla.
const NETVISOR_STATUS_LABELS: Record<string, string> = {
  undelivered: 'Avoin tilaus',
  delivered: 'Toimitettu',
  billed: 'Laskutettu',
  archived: 'Arkistoitu',
};

const LOCAL_STATUS_LABELS: Record<string, string> = {
  invoice: 'Lasku',
};

const normalize = (value?: string | null) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

// Tuntematon koodi näytetään sellaisenaan: tyhjä kenttä kätkisi sen, eikä sitä
// huomattaisi lisätä tähän.
export function getOrderStatusLabel(order?: OrderStatusFields | null): string | null {
  if (!order) return null;
  if (order.deleted_at) return 'Poistettu';

  const netvisorStatus = normalize(order.netvisor_status);
  if (netvisorStatus) return NETVISOR_STATUS_LABELS[netvisorStatus] ?? netvisorStatus;

  const localStatus = normalize(order.status);
  if (localStatus) return LOCAL_STATUS_LABELS[localStatus] ?? localStatus;

  return null;
}

// Toimitettu mutta laskuttamatta — tilauslista nostaa sen erikseen esiin.
export const isAwaitingInvoice = (order: OrderStatusFields) =>
  !order.deleted_at && normalize(order.netvisor_status) === 'delivered';

type NetvisorSyncFields = {
  netvisor_resend_required?: boolean;
  manual_composition_required?: boolean;
};

// Muutos odottaa backendin automaattista uudelleenlähetystä Netvisoriin. Koostettava
// tilaus ei ole tässä tilassa vaikka merkintä olisi päällä: sen lähettää
// "Koostumus valmis", eikä uudelleenyritys koske sitä — "yritetään automaattisesti"
// olisi silloin väärä lupaus.
export const isAwaitingNetvisorResend = (order: NetvisorSyncFields) =>
  order.netvisor_resend_required === true && order.manual_composition_required !== true;
