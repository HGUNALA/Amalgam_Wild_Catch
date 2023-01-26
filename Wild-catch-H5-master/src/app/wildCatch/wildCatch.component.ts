import { Component, OnInit, ViewChild } from '@angular/core';
import { MIService } from '@infor-up/m3-odin-angular';
import { IMIResponse, MIRecord, IMIRequest, Log } from '@infor-up/m3-odin';
import { SohoDataGridComponent, SohoMessageService } from 'ids-enterprise-ng';
import {
  IWare,
  IPOLines,
  IList,
  IPurchaseData,
  ISup,
  IWareHouse,
  IitemBasic,
  IBatchLine,
  Iitem,
} from '../services/interface-list.service';
@Component({
  selector: 'app-wild-catch',
  templateUrl: './wildCatch.component.html',
  styleUrls: ['./wildCatch.component.css'],
})
export class WildCatchComponent implements OnInit {
  @ViewChild(SohoDataGridComponent) datagrid: SohoDataGridComponent;
  datagridOptions: SohoDataGridOptions;
  supDgOptions: SohoDataGridOptions;
  itemDgOptions: SohoDataGridOptions;
  whDgOptions: SohoDataGridOptions;
  columns: SohoDataGridColumn[] = [];
  supColumns: SohoDataGridColumn[] = [];
  itmColumns: SohoDataGridColumn[] = [];
  whsColumns: SohoDataGridColumn[] = [];
  lineNumber: number = 10;
  selItem: string;
  processCount: number = 0;
  isRefreshDisable: boolean;
  lotNumber: string;
  getWH: string[] = [];
  isLoading: boolean = true;
  isLoadingText: string = 'Fetching the User data';
  output: string[];
  selWh: string = '';
  quantity: string;
  lstSN: IList[] = [];
  lstSN1: IList[] = [];
  itemSN: Iitem[] = [];
  srcList: string[] = [];
  selSrc: string;
  supData: ISup = { Supplier_Number: '', Supplier_Name: '', Vat_Reg_No: '' };
  itemData: Iitem = { ITNO: '', ITDS: '' };
  whData: IWare = { WHLO: '', FACI: '', WHNM: '' };
  supplierList: ISup[] = [];
  supFinal: Object[] = [];
  itmFinal: Object[] = [];
  whsFinal: Object[] = [];
  selSup: string = '';
  selSupNo: string;
  selSupNm: string;
  supplierMessage: string;
  purchaseData: Array<IPurchaseData> = [
    //  {
    //    SUNO: '',
    //    LINH: '',
    //    LINO: 0,
    //    ITNO: '',
    //    DESC: '',
    //    QNTY: '',
    //    STAT: '',
    //    ILTN: '',
    //    UOMR: '',
    //    PUPR: '',
    //    AMNT: '',
    //    SRCE: '',
    //    PONO: '',
    //    SYMS: '',
    //    VLST: '',
    //  },
  ];
  ItmBasic: IitemBasic[] = [];
  itmSup: MIRecord[];
  selItemNo: string;
  itemMessage: string;
  msgNumber: string;
  purchaseOrder: string;
  updCounts: number = 0;
  pRecord: IPurchaseData = {
    SUNO: '',
    LINH: '',
    LINO: 0,
    ITNO: '',
    STAT: '',
    DESC: '',
    QNTY: '',
    ILTN: '',
    UOMR: '',
    PUPR: '',
    AMNT: '',
    SRCE: '',
    PONO: '',
    SYMS: '',
    VLST: '',
  };
  resp: string;
  fullDate: Date;
  unitOfMsr: string;
  selGrid: any;
  gridDataCount: number = 0;
  isSupDisable: boolean;
  sysErrMsg: string;
  isProcessDisable: boolean;
  isReceiveDisable: boolean;
  selectRowData: IBatchLine = {
    SYMS: '',
    STAT: '',
    VLST: '',
    PONO: '',
  };
  selectRows: any;
  multiSelectCount: number;
  chAttrCount: number = -1;
  selItemDesc: string = '';
  isWhDisable: boolean;
  date: string;
  alSelectRows: any;
  lstWH: IWare[] = [];
  lstWhFa: IWare[] = [];
  lstPOLine: IPOLines[] = [];
  warehouseMessage: string;
  validationMessage6: string;
  validationMessage5: string;
  validationMessage4: string;
  isDeleteDisable: boolean;
  isProcessOn: boolean;
  decimalPlaces: number = 0;
  cumulativeQuantity = 0;
  cumulativeAmount = 0;
  isSelectable: boolean;
  userWarehouse: any;
  chAttrFlag: boolean;
  constructor(
    private miService: MIService,
    private messageService: SohoMessageService
  ) {}
  ngOnInit(): void {
    this.selSup = '';
    this.selItem = '';
    let date = new Date();
    this.isLoadingText = 'Fetching User Default warehouse';
    this.isReceiveDisable = true;
    this.initColumns();
    this.supInitColumns();
    this.whsInitColumns();
    this.ItmInitColumns();
    this.initialDisable();
    this.ItmInit();
    this.supInit();
    this.whsInit();
    this.init();
    this.selSup = '';
    this.selItem = '';
    this.getUserData();
    this.getLstWarehouses();
    this.getLstByNumber();
    this.getLstAttrValue();
    this.getSearchItem('*');
  }
  initialDisable() {
    this.isWhDisable = true;
    this.isProcessDisable = true;
    this.isSupDisable = true;
    this.isProcessOn = true;
  }
  initialEnable() {
    this.isLoading = false;
    this.isWhDisable = false;
    this.isSupDisable = false;
    this.isProcessOn = false;
  }
  onColor(event: any) {}
  onSupplier(event: any) {
    if (event.length) {
      this.selSup =
        event[0].data.Supplier_Number + ' - ' + event[0].data.Supplier_Name;
      this.supplierMessage = '';
      this.selSupNo = event[0].data.Supplier_Number;
    } else {
      this.filterSupData1();
      this.selSupNo = this.selSup;
    }
  }
  onItem(event: any) {
    this.selItem = this.selItem.toUpperCase();
    if (event.length) {
      this.selItem = event[0].data.ITNO + ' - ' + event[0].data.ITDS;
      this.selItemNo = event[0].data.ITNO;
      this.selItemDesc = event[0].data.ITDS;
      this.itemMessage = '';
    } else if (this.selItem.length < 1) {
      this.onError('Min. input text is 1 character', 'Item search validation');
      this.selItem = '';
      this.selItemNo = '';
      this.isLoading = false;
    } else if (this.selItem.length >= 1) {
      if (!this.itmFinal.length) {
        this.isLoading = true;
        this.getSearchItem('');
      } else {
        this.filterItemData1();
      }
    }
  }
  onQuantity() {
    if (+this.quantity > 0) {
      this.validationMessage4 = '';
      this.onAddlines();
    }
  }
  onLotNo() {
    if (this.lotNumber) {
      this.validationMessage6 = '';
      this.onAddlines();
    }
  }
  onWarehouse(event: any) {
    this.isLoading = false;

    if (event.length) {
      this.selWh = event[0].data.WHLO + ' - ' + event[0].data.WHNM;
      this.selWh = this.selWh + ' ';
      this.warehouseMessage = '';
    } else {
      this.filterWhData1();
    }
  }
  onDelete() {
    let delRowIndex1: number, delRowIndex2: number;
    if (!this.isProcessOn) {
      for (
        delRowIndex1 = 0;
        delRowIndex1 < this.selectRows.length;
        delRowIndex1++
      ) {
        for (
          delRowIndex2 = 0;
          delRowIndex2 < this.purchaseData.length;
          delRowIndex2++
        ) {
          if (
            this.selectRows[delRowIndex1].data.LINO ===
            this.purchaseData[delRowIndex2].LINO
          ) {
            this.cumulativeQuantity = Number(
              this.qRound(
                this.cumulativeQuantity - +this.purchaseData[delRowIndex2].QNTY
              )
            );
            this.cumulativeAmount =
              Math.round(
                (this.cumulativeAmount -
                  +this.purchaseData[delRowIndex2].AMNT) *
                  100
              ) / 100;
            this.lineNumber -= 10;
            this.purchaseData.splice(delRowIndex2, 1);
          }
        }
      }
      this.onLineFilter(10);
    }
  }
  onSource() {
    if (this.selSrc) {
      this.validationMessage5 = '';
      this.onAddlines();
    }
  }
  getUserData() {
    this.isSelectable = true;
    let record: MIRecord = new MIRecord();
    record['USID'] = '';
    let output: string[] = [
      'CONO',
      'DIVI',
      'LANC',
      'DTFM',
      'WHLO',
      'FACI',
      'USID',
    ];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'MNS150MI',
      transaction: 'GetUserData',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        console.log(response);
        this.resp = response.item.USID;
        this.isRefreshDisable = true;
        this.isDeleteDisable = true;
        this.userWarehouse = response.item.WHLO;
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getLstWarehouses() {
    this.isLoadingText = 'Fetching Warehouse List';
    let record: MIRecord = new MIRecord();
    let output: string[] = ['WHLO', 'FACI', 'WHNM'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'MMS005MI',
      transaction: 'LstWarehouses',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.lstWH = response.items;
        this.lstWhFa = this.lstWH;
        this.filterWhData();
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getItemBasic() {
    this.isLoadingText = 'Fetching the Item Basic information';
    let record: MIRecord = new MIRecord();
    record['ITNO'] = this.selItemNo;
    let output: string[] = ['FUDS', 'ITDS', 'UNMS', 'DCCD', 'ATMO'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'MMS200MI',
      transaction: 'GetItmBasic',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.ItmBasic = response.items;
        this.unitOfMsr = response.item.UNMS;
        this.decimalPlaces = response.item.DCCD
          ? Number(response.item.DCCD)
          : null;
        this.getItemSupplier();
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getItemSupplier() {
    this.isLoadingText = 'Adding Lines';
    let record: MIRecord = new MIRecord();
    record['ITNO'] = this.selItemNo;
    record['SUNO'] = this.selSupNo;
    let output: string[] = ['PUPR'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'PPS040MI',
      transaction: 'GetItemSupplier',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.itmSup = response.items;
        console.log(this.itmSup);

        this.getItemSupplierGo(response);
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.selItem = '';
        this.isLoading = false;
      }
    );
  }
  getItemSupplierGo(response: IMIResponse) {
    if (+response.item.PUPR > 0) {
      this.pRecord['SUNO'] = this.selSupNo;
      this.pRecord['LINO'] = this.lineNumber;
      this.pRecord['ITNO'] = this.selItemNo;
      this.pRecord['DESC'] = this.selItemDesc;
      this.pRecord['QNTY'] = this.qRound(Number(this.quantity)).toString();
      this.pRecord['ILTN'] = this.lotNumber;
      this.pRecord['UOMR'] = this.unitOfMsr;
      this.pRecord['PUPR'] = (
        Math.round(parseFloat(response.item.PUPR) * 100) / 100
      ).toString();

      this.pRecord['AMNT'] = (
        Math.round(+this.quantity * response.item.PUPR * 100) / 100
      ).toString();
      this.pRecord['SRCE'] = this.selSrc;
      this.pRecord['PONO'] = '';
      this.pRecord['SYMS'] = '';
      this.pRecord['STAT'] = '';
      this.pRecord['VLST'] = 'OK';
      this.cumulativeQuantity = Number(
        this.qRound(this.cumulativeQuantity + +this.pRecord['QNTY'])
      );
      this.cumulativeAmount =
        Math.round((this.cumulativeAmount + +this.pRecord['AMNT']) * 100) / 100;
      this.purchaseData.push(Object.assign({}, this.pRecord));
      this.isDeleteDisable = false;
      this.gridDataCount++;
      this.lineNumber += 10;
      this.datagridOptions = { ...this.datagridOptions };
      this.isLoading = false;
      this.quantity = '';
      this.lotNumber = '';
      this.selItem = '';
      this.selItemNo = '';

      console.log(this.pRecord);
    } else {
      this.onError(
        'Purchase price does not exist in PPS040 records',
        'Validation'
      );
      this.selItem = '';
      this.selItemNo = '';
      this.isLoading = false;
    }
  }
  getLstByNumber() {
    this.isLoadingText = 'Fetching Supplier List';
    let record: MIRecord = new MIRecord();
    record['SUNO'] = '*';
    let output: string[] = ['SUNO', 'SUNM', 'STAT', 'VRNO'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'CRS620MI',
      transaction: 'LstByNumber',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.lstSN = response.items;
        this.filterSupData();
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getLstAttrValue() {
    this.isLoadingText = 'Fetching Attribute values list';
    let record: MIRecord = new MIRecord();
    record['ATID'] = 'SOURCE';
    let output: string[] = ['AALF', 'ATID', 'AALT'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'ATS020MI',
      transaction: 'LstAttrValue',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        const source = response.items;
        const map = new Map();
        source.map((val, index) => {
          map.set(index, val.AALF);
        });
        this.srcList = Array.from(map.values());
        this.initialEnable();
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getLstItemWhsByItm() {
    this.isLoadingText = 'Verifying the provided Item details';
    let record: MIRecord = new MIRecord();
    record['WHLO'] = this.selWh.slice(0, 3);
    record['ITNO'] = this.selItemNo;
    let output: string[] = ['ITNO', 'ITDS'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'MMS200MI',
      transaction: 'LstItmWhsByItm',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.getLstItemWhsCheck(response);
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getLstItemWhsCheck(response: IMIResponse) {
    if (response.items.length > 0) {
      console.log(this.purchaseData);
      console.log(this.selItemNo);
      console.log(this.selItem);
      const ItemDuplicate: IPurchaseData = this.purchaseData.filter(
        (x) => x.ITNO === this.selItemNo
      )[0];
      console.log(ItemDuplicate);
      if (ItemDuplicate) {
        this.onConfirm(
          'Are you sure want to add this ' + this.selItemNo + ' Item again?',
          'Item Duplication'
        );
        this.isLoading = false;
      } else {
        this.getItemBasic();
      }
    } else {
      this.onError(
        'Selected Item is not available in this ' +
          this.selWh.slice(0, 3) +
          ' warehouse',
        'Item Validation'
      );
      this.selItemNo = '';
      this.selItem = '';
      this.isLoading = false;
    }
  }

  getSearchItem(startValue?: string) {
    console.log('get searchitem');

    this.itemSN = [];

    this.itemDgOptions.dataset = [];
    this.isLoadingText = 'Fetching all Items';
    let record: MIRecord = new MIRecord();
    if (startValue === '*') {
      record['SQRY'] = startValue;
    } else {
      this.itemMessage = '';
      record['SQRY'] =
        'ITNO:(' + this.selItem + '*) OR ITDS:(' + this.selItem + '*)';
    }
    let output: string[] = ['ITNO', 'ITDS'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'MMS200MI',
      transaction: 'SearchItem',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.itemSN = response.items;
        if (this.itemSN.length) {
          this.filterItemData();
        } else {
          this.selItem = '';
          this.itemMessage = 'No Items are available for this search';
          this.isLoading = false;
        }
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getStartEntry() {
    this.isLoadingText = 'Processing Start Entry';
    this.multiSelectCount = 0;
    let record: MIRecord = new MIRecord();
    record['BAOR'] = 'WILD_CATCH';
    let output: string[] = ['MSGN'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'PPS370MI',
      transaction: 'StartEntry',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.msgNumber = response.items[0].MSGN;
        this.getAddHead();
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getAddHead() {
    this.isLoadingText = 'Generating PO number';
    this.date = this.dateConcat();
    let record: MIRecord = new MIRecord();
    record['MSGN'] = this.msgNumber;
    for (let getFacility of this.lstWhFa) {
      if (this.selWh.slice(0, 3) === getFacility.WHLO) {
        record['FACI'] = getFacility.FACI;
      }
    }
    record['WHLO'] = this.selWh.slice(0, 3).slice(0, 3);
    record['SUNO'] = this.selSupNo;
    record['DWDT'] = this.date;
    let output: string[] = ['PUNO'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'PPS370MI',
      transaction: 'AddHead',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.alSelectRows = this.selectRows;

        console.log(response);
        this.purchaseOrder = response.items[0].PUNO;
        console.log(this.purchaseOrder);
        this.multiSelectCount = 1;
        this.getAddLine(this.purchaseData[0]);
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getAddLine(selectRowData: any) {
    this.isLoadingText = 'Purchase Order lines are adding...';
    let record: MIRecord = new MIRecord();
    record['MSGN'] = this.msgNumber;
    record['ITNO'] = selectRowData.ITNO;
    record['PUNO'] = this.purchaseOrder;
    record['PNLI'] = selectRowData.LINO;
    record['ORQA'] = selectRowData.QNTY;
    let output: string[] = ['PUNO', 'PNLI'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'PPS370MI',
      transaction: 'AddLine',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        if (this.multiSelectCount === this.purchaseData.length) {
          this.getFinishEntry();
        } else {
          this.getAddLine(this.purchaseData[this.multiSelectCount++]);
        }
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getFinishEntry() {
    this.isLoadingText = 'Finishing the process';
    let record: MIRecord = new MIRecord();
    record['MSGN'] = this.msgNumber;
    let output: string[] = [];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'PPS370MI',
      transaction: 'FinishEntry',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.updCounts++;
        this.isProcessDisable = true;
        setTimeout(() => {
          this.forBatchCall();
        }, 5000);
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getBatchLine(selectRowData: any) {
    this.isLoadingText = 'Retrieving the PO error messages if any';
    let record: MIRecord = new MIRecord();
    record['PUNO'] = this.purchaseOrder;
    record['PNLI'] = selectRowData.LINO;
    let output: string[] = ['MSID', 'MSGD', 'STAT', 'PUPR', 'PUNO'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'PPS370MI',
      transaction: 'GetBatchLine',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.getBatchGo(response);
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getBatchGo(response) {
    console.log(response);
    console.log(this.purchaseData);
    console.log(this.multiSelectCount - 1);
    console.log(this.purchaseData[this.multiSelectCount - 1]);
    console.log(this.purchaseData[this.multiSelectCount - 1].STAT);

    this.purchaseData[this.multiSelectCount - 1].STAT = response.item.STAT;
    this.purchaseData[this.multiSelectCount - 1].PONO = response.item.PUNO;
    if (parseFloat(response.item.STAT) <= 23) {
      this.purchaseData[this.multiSelectCount - 1].SYMS =
        response.item.MSID + ' - ' + response.item.MSGD;
      if (this.purchaseData[this.multiSelectCount - 1].SYMS === ' - ') {
        this.purchaseData[this.multiSelectCount - 1].SYMS =
          'Refresh to get the latest status';
      }
      this.purchaseData[this.multiSelectCount - 1].VLST = 'Not OK';
    } else {
      this.purchaseData[this.multiSelectCount - 1].SYMS = '';
      this.purchaseData[this.multiSelectCount - 1].VLST = 'Batch PO created';
    }
    console.log(this.purchaseData[this.multiSelectCount - 1]);

    const commentDetails: IPurchaseData = this.purchaseData.filter(
      (x) => x.VLST === 'Not OK'
    )[0];
    if (commentDetails) {
      this.isReceiveDisable = true;
      this.isRefreshDisable = false;
    } else {
      this.isReceiveDisable = false;
      this.isRefreshDisable = true;
    }
    this.processCount = 0;
    console.log(this.multiSelectCount);

    if (this.multiSelectCount < this.purchaseData.length) {
      this.getBatchLine(this.purchaseData[this.multiSelectCount++]);
    } else {
      this.isLoading = false;
      this.isDeleteDisable = true;
      this.datagridOptions = { ...this.datagridOptions };
    }
  }
  getLstLine() {
    let record: MIRecord = new MIRecord();
    record['PUNO'] = this.purchaseOrder;
    //  let output: string[] = ['PNLI', 'ATNR', 'PNLS', 'ORQA'];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'PPS200MI',
      transaction: 'LstLine',
      record: record,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.lstPOLine = response.items;
        console.log(response);

        this.multiSelectCount = 0;
        this.checkAttrId();
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  getSetAttrValue(poLineIndex: number) {
    this.isLoadingText = 'Setting the attribute Value for all lines';
    let record: MIRecord = new MIRecord();
    record['ATNR'] = this.lstPOLine[poLineIndex].ATNR;
    record['ATID'] = 'SOURCE';
    record['AALF'] = this.purchaseData[poLineIndex].SRCE;
    record['AALT'] = this.purchaseData[poLineIndex].SRCE;
    record['ATAV'] = this.purchaseData[poLineIndex].SRCE;
    let output: string[] = [''];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'ATS101MI',
      transaction: 'SetAttrValue',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.getReceipt(poLineIndex);
      },
      (error: any) => {
        console.log(error);
        if (error.errorCode) {
          this.onError(error.errorMessage, 'Validation');
          this.isLoading = false;
          this.purchaseData[this.chAttrCount].SYMS = error.errorMessage;
          if (this.chAttrCount + 1 != this.purchaseData.length) {
            this.getSetAttrValue(++this.chAttrCount);
          }

          this.datagridOptions = { ...this.datagridOptions };
        }
      }
    );
  }
  getReceipt(receiptDataIndex?) {
    this.isLoadingText = 'Generating the Receipt';
    let record: MIRecord = new MIRecord();
    record['TRDT'] = this.date;
    record['RESP'] = this.resp;
    record['CAMU'] = this.purchaseOrder;
    record['PUNO'] = this.purchaseOrder;
    record['PNLI'] = this.lstPOLine[receiptDataIndex].PNLI;
    record['PNLS'] = this.lstPOLine[receiptDataIndex].PNLS;
    record['RVQA'] = this.lstPOLine[receiptDataIndex].ORQA;
    record['BREF'] = this.purchaseData[receiptDataIndex].ILTN;
    let output: string[] = [''];
    const request: IMIRequest = {
      includeMetadata: true,
      program: 'PPS001MI',
      transaction: 'Receipt',
      record: record,
      outputFields: output,
    };
    this.miService.execute(request).subscribe(
      (response) => {
        this.isReceiveDisable = true;
        this.isLoadingText = '';
        this.purchaseData[receiptDataIndex].SYMS =
          'REPN ' + response.item.REPN + ' created successfully';
        this.purchaseData[receiptDataIndex].VLST = 'FINISHED';
        this.isProcessDisable = true;
        if (this.chAttrCount + 1 === this.lstPOLine.length) {
          this.datagridOptions = { ...this.datagridOptions };
          this.isLoading = false;
        } else {
          this.checkAttrId();
        }
      },
      (error: IMIResponse) => {
        this.onError(error.errorMessage, 'Validation');
        this.isLoading = false;
      }
    );
  }
  dateConcat() {
    this.fullDate = new Date();
    let day: number = this.fullDate.getDate(),
      month = this.fullDate.getMonth() + 1,
      year = this.fullDate.getFullYear();
    let sMonth: string = month.toString(),
      sDay: string = day.toString();
    if (month < 10) {
      sMonth = '0' + month;
    }
    if (day < 10) {
      sDay = '0' + day;
    }
    return year + '' + sMonth + sDay;
  }

  checkAttrId() {
    this.chAttrFlag = false;
    ++this.chAttrCount;

    if (this.lstPOLine[this.chAttrCount].ATNR === '00000000000000000') {
      this.getReceipt(this.chAttrCount);
    } else {
      this.chAttrFlag = true;
      this.getSetAttrValue(this.chAttrCount);
    }
  }
  qRound(quantity: number) {
    switch (Number(this.decimalPlaces)) {
      case 1: {
        return Math.round(quantity * 10) / 10;
      }
      case 2: {
        return Math.round(quantity * 100) / 100;
      }
      case 3: {
        return Math.round(quantity * 1000) / 1000;
      }
      case 4: {
        return (Math.round(quantity * 10000) / 10000).toString();
      }
      case 5: {
        return (Math.round(quantity * 100000) / 100000).toString();
      }
      default: {
        return (Math.round(quantity * 1000000) / 1000000).toString();
      }
    }
  }
  forBatchCall() {
    this.multiSelectCount = 0;
    this.getBatchLine(this.purchaseData[this.multiSelectCount++]);
  }
  protected onError(message: string, title?: any) {
    const buttons = [
      {
        text: 'Ok',
        click: (_e, modal) => {
          modal.close();
        },
      },
    ];
    this.messageService
      .error()
      .title(title)
      .message(message)
      .buttons(buttons)
      .open();
  }
  protected onConfirm(message: string, title?: any) {
    const buttons = [
      {
        text: 'No',
        click: (_e, modal) => {
          modal.close();
        },
      },
      {
        text: 'Yes',
        click: (_e, modal) => {
          modal.close();
          if (title === 'Data reset') {
            this.onResetData();
          } else {
            this.getItemBasic();
            this.isLoading = true;
          }
        },
      },
    ];
    this.messageService
      .confirm()
      .title(title)
      .message(message)
      .buttons(buttons)
      .open();
  }
  filterSupData() {
    let supFilterIndex = 0;
    for (let suppData of this.lstSN) {
      this.supData = { Supplier_Number: '', Supplier_Name: '', Vat_Reg_No: '' };
      if (suppData.STAT === '20') {
        this.supData.Supplier_Name = suppData.SUNM;
        this.supData.Supplier_Number = suppData.SUNO;
        this.supData.Vat_Reg_No = suppData.VRNO;
        this.supDgOptions.dataset.push(this.supData);
        this.lstSN1[supFilterIndex++] = suppData;
      }
    }
    console.log(this.lstSN1);

    this.supFinal = this.supDgOptions.dataset;
    console.log(this.supFinal);
  }
  filterSupData1() {
    let matchCount = 0;
    this.selSup = this.selSup.toUpperCase();
    for (let suppData of this.lstSN1) {
      this.supData = { Supplier_Number: '', Supplier_Name: '', Vat_Reg_No: '' };
      if (suppData.SUNO === this.selSup) {
        matchCount = 1;
        break;
      }
    }
    if (matchCount) {
      this.supplierMessage = '';
    } else {
      this.supplierMessage = 'Supplier ' + this.selSup + ' does not exist';
      this.selSup = '';
    }
  }
  filterItemData() {
    for (let whsItemData of this.itemSN) {
      this.itemData = { ITNO: '', ITDS: '' };
      this.itemData.ITNO = whsItemData.ITNO;
      this.itemData.ITDS = whsItemData.ITDS;
      this.itemDgOptions.dataset.push(this.itemData);
    }
    this.itmFinal = this.itemDgOptions.dataset;
    this.initialEnable();
  }
  filterItemData1() {
    let matchCount = 0;
    console.log(this.itemSN);

    for (let itmDta of this.itemSN) {
      this.itemData = { ITNO: '', ITDS: '' };
      console.log(itmDta.ITDS);
      if (itmDta.ITNO === this.selItem || itmDta.ITDS === this.selItem) {
        this.selItemDesc = itmDta.ITDS;
        matchCount = 1;
        break;
      }
    }
    if (matchCount) {
      console.log('match');

      this.selItemNo = this.selItem;
      this.itemMessage = '';
      this.inputValidation();
    } else {
      console.log('no match');
      console.log(this.selItem);

      this.itemMessage =
        'Item number/Item Description ' + this.selItem + ' does not exist';
      this.isLoading = true;
      this.getSearchItem('');
    }
  }
  onItemFilterCheck() {
    let matchCount = 0;
    for (let itmDta of this.itemSN) {
      this.itemData = { ITNO: '', ITDS: '' };
      if (itmDta.ITNO === this.selItem || this.itemData.ITDS === this.selItem) {
        this.selItemDesc = itmDta.ITDS;
        matchCount = 1;
        break;
      }
    }
    if (matchCount) {
      this.selItemNo = this.selItem;
      this.itemMessage = '';
      this.inputValidation();
    } else {
      this.itemMessage =
        'Item number/Item Description ' + this.selItem + ' does not exist';
    }
  }
  filterWhData() {
    for (let wareHouseList of this.lstWH) {
      this.whData = { WHLO: '', FACI: '', WHNM: '' };
      this.whData.WHLO = wareHouseList.WHLO;
      this.whData.FACI = wareHouseList.FACI;
      this.whData.WHNM = wareHouseList.WHNM;
      this.whDgOptions.dataset.push(this.whData);
    }
    const warehouseDesc: IWare = this.lstWH.filter(
      (x) => x.WHLO === this.userWarehouse
    )[0];
    if (warehouseDesc) {
      this.selWh = this.userWarehouse + ' - ' + warehouseDesc.WHNM;
    }
    this.whsFinal = this.whDgOptions.dataset;
  }
  filterWhData1() {
    let matchCount = 0;
    for (let warehouseData of this.lstWH) {
      this.whData = { WHLO: '', FACI: '', WHNM: '' };
      if (warehouseData.WHLO === this.selWh.slice(0, 3)) {
        matchCount = 1;
        break;
      }
    }
    if (matchCount) {
      this.warehouseMessage = '';
    } else {
      this.warehouseMessage = 'Warehouse ' + this.selWh + ' does not exist';
      this.selWh = '';
      this.isLoading = false;
    }
  }

  getOrderTypes(): void {
    let record: MIRecord = new MIRecord();
    record['TTYP'] = '41';
    record['FSQ3'] = '4';
    const request: IMIRequest = {
      program: 'CRS200MI',
      transaction: 'LstOrderType',
      record: record,
      outputFields: ['TRTP'],
    };
  }
  getPartnerTypes() {
    let record: MIRecord = new MIRecord();
    record['E0IO'] = 'I';
    const request: IMIRequest = {
      program: 'MDBREADMI',
      transaction: 'LstMMIPPT10M3C1',
      record: record,
      outputFields: ['E0PA'],
    };
  }
  onAddlines() {
    if (!this.selItemNo && this.selItem.length >= 1) {
      this.onItemFilterCheck();
    } else {
      this.inputValidation();
    }
  }
  inputValidation() {
    if (!this.selWh.slice(0, 3)) {
      this.warehouseMessage = 'WareHouse ' + this.selWh + ' does not exist';
    } else if (!this.selSup) {
      this.supplierMessage = 'Supplier ' + this.selSup + ' does not exist';
    } else if (!+this.quantity && +this.quantity <= 0) {
      this.validationMessage4 = 'Quantity is required';
    } else if (!this.selSrc) {
      this.validationMessage5 = 'Source is required';
    } else if (!this.lotNumber) {
      this.validationMessage6 = 'Lot number is required';
    } else {
      this.emptyErrorMsg();
      this.isLoading = true;
      this.getLstItemWhsByItm();
    }
  }
  emptyErrorMsg() {
    this.validationMessage4 = '';
    this.validationMessage5 = '';
    this.validationMessage6 = '';
    this.warehouseMessage = '';
    this.itemMessage = '';
    this.supplierMessage = '';
    this.isLoading = true;
    this.isSupDisable = true;
    this.isWhDisable = true;
    this.isProcessDisable = false;
  }
  onReset() {
    this.onConfirm('Are you sure you want to reset the data?', 'Data reset');
  }
  onResetData() {
    this.initialEnable();
    this.isLoading = true;
    this.getSearchItem('*');
    this.chAttrCount = -1;
    this.isReceiveDisable = true;
    this.itemDgOptions.dataset = [];
    this.itmFinal = [];
    this.isProcessDisable = true;
    this.cumulativeQuantity = 0;
    this.isDeleteDisable = false;
    this.isRefreshDisable = true;
    this.cumulativeAmount = 0;
    this.isProcessOn = false;
    this.isSupDisable = false;
    this.isWhDisable = false;
    this.selItem = '';
    this.lineNumber = 10;
    this.selSup = '';
    this.quantity = '';
    this.lotNumber = '';
    this.selSrc = '';
    this.purchaseData.splice(0);
    this.datagridOptions = { ...this.datagridOptions };
  }
  onProcess() {
    if (this.purchaseData.length) {
      this.initialDisable();
      this.emptyErrorMsg();
      this.processCount = 0;
      this.isSelectable = false;
      this.cumulativeAmount = 0;
      this.updCounts = 0;
      this.isLoading = true;
      this.isWhDisable = true;
      this.isSupDisable = true;
      let i: number = 0;
      this.getStartEntry();
    }
  }
  onRefresh() {
    if (
      this.isProcessDisable &&
      this.isLoadingText === 'Retrieving the PO error messages if any'
    ) {
      this.isLoading = true;
      this.isWhDisable = true;
      this.isSupDisable = true;
      this.isLoadingText = 'Refreshing the order status';
      for (
        this.multiSelectCount = 0;
        this.multiSelectCount < this.purchaseData.length;
        this.multiSelectCount++
      ) {
        if (parseFloat(this.purchaseData[this.multiSelectCount].STAT) <= 23) {
          this.getBatchLine(this.purchaseData[this.multiSelectCount]);
        } else {
          this.isLoading = false;
        }
      }
    }
  }
  onReceive() {
    this.isLoading = true;
    this.isLoadingText = 'Fetching lines list';
    this.getLstLine();
  }
  exportToExcel(): void {
    const exportPurchaseData: Array<any> = [];
    if (this.purchaseData && this.purchaseData.length > 0) {
      this.isLoading = true;
      this.isWhDisable = true;
      this.isSupDisable = true;
      const purchaseDataPageDetails: Array<IPurchaseData> =
        this.purchaseData.slice(0, this.purchaseData.length);
      exportPurchaseData.push({
        SUNO: 'Supplier',
        LINH: 'Line Number',
        ITNO: 'Item Number',
        DESC: 'Description',
        QNTY: 'Quantity',
        ILTN: 'Lot Number',
        UOMR: 'U/M',
        PUPR: 'Purchase Price',
        AMNT: 'Amount',
        SRCE: 'Source',
        PONO: 'Purchase Order',
        SYMS: 'System Messages',
        VLST: 'Validation Status',
      });
      purchaseDataPageDetails.forEach((purchaseDataDetails: IPurchaseData) => {
        const purchaseDataDetail: any = {
          SUNO: purchaseDataDetails.SUNO,
          LINO: purchaseDataDetails.LINO,
          ITNO: purchaseDataDetails.ITNO,
          DESC: purchaseDataDetails.DESC,
          QNTY: purchaseDataDetails.QNTY,
          ILTN: purchaseDataDetails.ILTN,
          UOMR: purchaseDataDetails.UOMR,
          PUPR: purchaseDataDetails.PUPR,
          AMNT: purchaseDataDetails.AMNT,
          SRCE: purchaseDataDetails.SRCE,
          PONO: purchaseDataDetails.PONO,
          SYMS: purchaseDataDetails.SYMS,
          VLST: purchaseDataDetails.VLST,
        };
        exportPurchaseData.push(purchaseDataDetail);
      });
      Soho.excel.exportToExcel(
        'Wild_Catch_Data',
        'DataSheet1',
        exportPurchaseData
      );
      this.isLoading = false;
    }
  }
  protected init() {
    this.datagridOptions = this.initDataGridOptions(
      'Purchase Lines',
      this.columns
    );
  }
  protected supInit() {
    this.supDgOptions = this.supInitDataGridOptions(
      'Supplier ',
      this.supColumns
    );
  }
  protected ItmInit() {
    this.itemDgOptions = this.ItmInitDataGridOptions('Items ', this.itmColumns);
  }
  protected whsInit() {
    this.whDgOptions = this.supInitDataGridOptions(
      'Warehouse ',
      this.whsColumns
    );
  }
  protected supInitColumns() {
    this.supColumns = [
      {
        width: 125,
        id: 'col-suppler-number',
        field: 'Supplier_Number',
        name: 'Supplier Number',
        resizable: true,
      },
      {
        width: 125,
        id: 'col-supplier-name',
        field: 'Supplier_Name',
        name: 'Supplier Name',
        resizable: true,
      },
      {
        width: 125,
        id: 'col-vat_reg',
        field: 'Vat_Reg_No',
        name: 'GST no',
        resizable: true,
      },
    ];
  }
  protected ItmInitColumns() {
    this.itmColumns = [
      {
        width: 125,
        id: 'col-item-number',
        field: 'ITNO',
        name: 'Item Number',
        resizable: true,
      },
      {
        width: 125,
        id: 'col-item-name',
        field: 'ITDS',
        name: 'Item Name',
        resizable: true,
      },
    ];
  }
  protected whsInitColumns() {
    this.whsColumns = [
      {
        width: '',
        id: 'col-warehouse',
        field: 'WHLO',
        name: 'Warehouse',
        resizable: true,
      },
      {
        width: '',
        id: 'col-warehouse-name',
        field: 'WHNM',
        name: 'Warehouse Description',
        resizable: true,
      },
      {
        width: '',
        id: 'col-location',
        field: 'FACI',
        name: 'Facility',
        resizable: true,
      },
    ];
  }
  protected initColumns() {
    this.columns = [
      {
        width: 70,
        id: 'selectionCheckbox',
        field: '',
        name: '',
        sortable: false,
        resizable: false,
        align: 'center',
        headerAlign: 'center',
        formatter: Soho.Formatters.SelectionCheckbox,
      },
      {
        width: 125,
        id: 'col-supplier',
        field: 'SUNO',
        name: 'Suppplier',
        resizable: true,
        filterType: 'text',
      },
      {
        width: 92,
        id: 'col-line',
        field: 'LINO',
        name: 'Line Number',
        resizable: true,
        headerAlign: 'right',
        align: 'right',
        filterType: 'integer',
      },
      {
        width: 125,
        id: 'col-item',
        field: 'ITNO',
        name: 'Item Number',
        resizable: true,
        filterType: 'text',
      },
      {
        width: 125,
        id: 'col-description',
        field: 'DESC',
        name: 'Description',
        resizable: true,
        align: 'left',
        filterType: 'text',
      },
      {
        width: 80,
        id: 'col-unit',
        field: 'UOMR',
        name: 'U/M',
        resizable: true,
        align: 'left',
        filterType: 'text',
      },
      {
        width: 100,
        id: 'col-quantity',
        field: 'QNTY',
        name: 'Quantity',
        resizable: true,
        headerAlign: 'right',
        align: 'right',
        filterType: 'integer',
      },
      {
        width: 125,
        id: 'col-lotno',
        field: 'ILTN',
        name: 'Lot Number',
        resizable: true,
        filterType: 'text',
      },
      {
        width: 100,
        id: 'col-source',
        field: 'SRCE',
        name: 'Source',
        resizable: true,
        filterType: 'text',
      },
      {
        width: 102,
        id: 'col-price',
        field: 'PUPR',
        name: 'Purchase Price',
        resizable: true,
        headerAlign: 'right',
        align: 'right',
        filterType: 'decimal',
      },
      {
        width: 125,
        id: 'col-amount',
        field: 'AMNT',
        name: 'Amount',
        resizable: true,
        headerAlign: 'right',
        align: 'right',
        filterType: 'decimal',
      },
      {
        width: 125,
        id: 'col-pono',
        field: 'PONO',
        name: 'Purchase Order',
        resizable: true,
        headerAlign: 'right',
        align: 'right',
        filterType: 'integer',
      },
      {
        width: 125,
        id: 'col-system-messages',
        field: 'SYMS',
        name: 'System Messages',
        resizable: true,
        formatter: Soho.Formatters.Color,
      },
      {
        width: 125,
        id: 'col-validation-status',
        field: 'VLST',
        name: 'Validation Status',
        resizable: true,
      },
    ];
  }
  onLineFilter(deletedValue: number) {
    let delNumber: number;
    for (
      delNumber = deletedValue;
      delNumber < this.purchaseData.length * 10 + 1;
      delNumber += 10
    ) {
      this.purchaseData[delNumber / 10 - 1].LINO = delNumber;
    }
    this.datagridOptions = { ...this.datagridOptions };
  }
  public initDataGridOptions(
    title: string,
    columns: SohoDataGridColumn[]
  ): SohoDataGridOptions {
    const options: SohoDataGridOptions = {
      isList: true,
      clickToSelect: true,
      editable: true,
      filterWhenTyping: true,
      rowNavigation: true,
      cellNavigation: true,
      enableTooltips: true,
      filterable: false,
      selectAllCurrentPage: true,
      stretchColumnOnChange: true,
      paging: true,
      pagesize: 5,
      indeterminate: false,
      rowHeight: 'large' as SohoDataGridRowHeight,
      selectable: 'multiple',
      showDirty: true,
      showFilterTotal: true,
      toolbar: {
        results: true,
        keywordFilter: true,
        collapsibleFilter: true,
        title: title,
        rowHeight: true,
        actions: true,
        personalize: true,
        filterRow: true,
      },
      columns: columns,
      dataset: this.purchaseData,
      emptyMessage: {
        title: 'No data is available',
        icon: 'icon-empty-no-data',
        color: 'azure',
      },
    };
    return options;
  }
  supInitDataGridOptions(
    title: string,
    columns: SohoDataGridColumn[]
  ): SohoDataGridOptions {
    const options: SohoDataGridOptions = {
      alternateRowShading: false,
      cellNavigation: false,
      clickToSelect: false,
      disableRowDeactivation: false,
      editable: true,
      paging: true,
      pagesize: 5,
      isList: false,
      indeterminate: false,
      rowNavigation: false,
      rowHeight: 'normal' as SohoDataGridRowHeight,
      showDirty: true,
      toolbar: {
        results: true,
        title: title,
        hasMoreButton: true,
        noSearchfieldReinvoke: true,
        keywordFilter: true,
        collapsibleFilter: true,
      },
      columns: columns,
      dataset: [],
      emptyMessage: {
        title: 'No data available',
        color: 'amber',
        info: 'Start typing your Manufacturing Order Number to add to the list ',
        icon: 'icon-empty-no-data',
      },
    };
    return options;
  }
  ItmInitDataGridOptions(
    title: string,
    columns: SohoDataGridColumn[]
  ): SohoDataGridOptions {
    const options: SohoDataGridOptions = {
      alternateRowShading: false,
      cellNavigation: false,
      clickToSelect: false,
      disableRowDeactivation: false,
      editable: true,
      isList: false,
      indeterminate: false,
      rowNavigation: false,
      rowHeight: 'normal' as SohoDataGridRowHeight,
      showDirty: true,
      toolbar: {
        results: true,
        title: title,
        hasMoreButton: true,
        noSearchfieldReinvoke: true,
        keywordFilter: true,
        collapsibleFilter: true,
      },
      columns: columns,
      dataset: [],
      emptyMessage: {
        title: 'No data available',
        color: 'amber',
        info: 'Start typing your Manufacturing Order Number to add to the list ',
        icon: 'icon-empty-no-data',
      },
    };
    return options;
  }
  onSelected(event: any) {
    this.selectRows = event.rows;
    this.selGrid = event.rows;
  }
}
