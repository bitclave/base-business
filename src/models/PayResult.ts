import CompareResult from "./CompareResult";

export default class PayResult {

    compareResult: CompareResult;
    transactionHash: string;

    constructor(compareResult: CompareResult, transactionHash: string = '') {
        this.compareResult = compareResult;
        this.transactionHash = transactionHash;
    }

}
