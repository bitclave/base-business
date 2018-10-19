import { TxState } from './TxState';
import Transaction from './Transaction';

export interface TokenTransfer {

    transfer(value: string, address: string): Promise<Transaction>;

    checkTransactionState(hash: string): Promise<TxState>;

}
