import { NonceHelper } from './NonceHelper';
const LocalStorage = require('node-localstorage').LocalStorage;

export default class NonceHelperImpl implements NonceHelper {

    private readonly STORAGE_PATH: string = './storage';
    private readonly NONCE_KEY: string  = 'nonce';
    private storage: any;

    private web3: any;
    private nonce: number = -1;
    private walletAddress: string;

    constructor(web3: any, walletAddress: string) {
        this.web3 = web3;
        this.walletAddress = walletAddress;
        this.storage = new LocalStorage(this.STORAGE_PATH);
    }

    async getNonce(): Promise<number> {
        this.nonce = (await this.storage.getItem(this.NONCE_KEY)) || -1;

        if (this.nonce === -1) {
            this.nonce = await this.web3.eth.getTransactionCount(this.walletAddress);
            await this.storage.setItem(this.NONCE_KEY, this.nonce);
        }

        return this.nonce;
    }

    async increaseNonce(): Promise<number> {
        this.nonce = await this.getNonce();
        this.nonce++;

        await this.storage.setItem(this.NONCE_KEY, this.nonce);

        return this.nonce;
    }

}
