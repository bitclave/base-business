export default class CompareResult {

    state: boolean;
    ethWallet: string;
    offerSearchId: number;
    worth: string;

    constructor(state: boolean = false, ethWallet: string = '', offerSearchId: number = 0, worth: string = '0') {
        this.state = state;
        this.ethWallet = ethWallet;
        this.offerSearchId = offerSearchId;
        this.worth = worth;
    }

}
