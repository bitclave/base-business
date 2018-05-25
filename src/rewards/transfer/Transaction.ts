export default class Transaction {

    hash: string;
    nonce: number;

    constructor(hash: string = '', nonce: number = 0) {
        this.hash = hash;
        this.nonce = nonce;
    }

}
