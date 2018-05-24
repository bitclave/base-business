import {TxState} from "./TxState";

export interface TokenTransfer {

    transfer(value: string, address: string): Promise<string>;

    checkTransactionState(hash: string): Promise<TxState>;

}
