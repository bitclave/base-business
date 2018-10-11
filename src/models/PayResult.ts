import CompareResult from './CompareResult';
import Transaction from '../rewards/transfer/Transaction';

export default class PayResult {

    compareResult: CompareResult;
    transaction: Transaction;
    accepted: boolean;

    constructor(compareResult: CompareResult = new CompareResult(),
                transaction: Transaction = new Transaction(),
                accepted: boolean = false) {
        this.compareResult = compareResult;
        this.transaction = transaction;
        this.accepted = accepted;
    }

}
