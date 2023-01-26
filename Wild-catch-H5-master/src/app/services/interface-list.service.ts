export interface IPOLines {
  ATNR: string;
  Transaction_Date: string;
  Responsible: string;
  Purchase_Order: string;
  PNLI: string;
  PNLS: string;
  ORQA: string;
  Lot_Reference: string;
  Container: string;
}

export interface IWare {
  WHLO: string;
  FACI: string;
  WHNM: string;
}

export interface IList {
  SUNO: string;
  SUNM: string;
  STAT: string;
  VRNO: string;
}

export interface IWareHouse {
  selectedOption: string;
}
export interface ISup {
  Supplier_Number: string;
  Supplier_Name: string;
  Vat_Reg_No: string;
}
export interface Iitem {
  ITNO: string;
  ITDS: string;
}
export interface IBatchLine {
  SYMS: string;
  STAT: string;
  VLST: string;
  PONO: string;
}
export interface IPurchaseData {
  SUNO: string;
  LINH: string;
  LINO: number;
  ITNO: string;
  DESC: string;
  QNTY: string;
  STAT: string;
  ILTN: string;
  UOMR: string;
  PUPR: string;
  AMNT: string;
  SRCE: string;
  PONO: string;
  SYMS: string;
  VLST: string;
}

export interface IitemBasic {
  FUDS: string;
  ITDS: string;
  UNMS: string;
  DCCD: string;
  ATMO: string;
}
