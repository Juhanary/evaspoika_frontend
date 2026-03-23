export type NetvisorResponsePayload = Record<string, unknown>;

export type NetvisorResponseEnvelope<TResponse = NetvisorResponsePayload> = {
  requestId?: string;
  transactionId?: string | null;
  response: TResponse;
};

export type NetvisorFlag = boolean | 0 | 1 | '0' | '1';

export type NetvisorCustomerListQuery = {
  keyword?: string;
  changedsince?: string;
  customercodelist?: string | string[];
};

export type NetvisorCustomerDetailsQuery = {
  id?: number | string;
  idlist?: (number | string)[] | string;
  replyoption?: number | string;
};

export type NetvisorInvoiceListQuery = {
  listtype?: 'preinvoice';
};

export type NetvisorDocumentDetailsQuery = {
  netvisorkey?: number | string;
  netvisorkeylist?: (number | string)[] | string;
  pdfimage?: 'lastsentprintservice' | 'pdf' | 'nopdf';
  showprocesshistory?: NetvisorFlag;
  includeattachments?: NetvisorFlag;
  showcommentlines?: NetvisorFlag;
  includedocuments?: NetvisorFlag;
  replyoption?: number | string;
};

export type NetvisorProductListQuery = {
  changedsince?: string;
  keyword?: string;
  published?: NetvisorFlag;
  unpublished?: NetvisorFlag;
  deleted?: NetvisorFlag;
};

export type NetvisorProductDetailsQuery = {
  id?: number | string;
  idlist?: (number | string)[] | string;
  eancode?: string;
  code?: string;
  codelist?: string | string[];
  showsubproducts?: NetvisorFlag;
  replyoption?: '1' | '2' | '3' | 1 | 2 | 3;
};
