import {TokenTransfer} from "./TokenTransfer";
import {TransactionReceipt} from "web3/types";
import {TxState} from "./TxState";

const BigNumber = require('bignumber.js');
const Abi = require('ethereumjs-abi');
const Tx = require('ethereumjs-tx');
const EC = require('elliptic').ec;
const CryptoJS = require('crypto-js');

export default class TokenTransferImpl implements TokenTransfer {

    private readonly TOKEN_INCREASE = new BigNumber(10).pow(18);

    private web3: any;
    private walletAddress: string;
    private walletPrivateKey: Buffer;
    private contractAddress: string;
    private gasLimit: number;
    private gasPrice: number;
    private networkId: number;

    constructor(web3: any,
                walletPrivateKey: string,
                contractAddress: string,
                gasLimit: number,
                gasPrice: number,
                networkId: number) {
        this.web3 = web3;
        this.walletPrivateKey = Buffer.from(walletPrivateKey, 'hex');
        this.walletAddress = this.getAddressByPrivateKey(walletPrivateKey);
        this.contractAddress = contractAddress;
        this.gasLimit = gasLimit;
        this.gasPrice = gasPrice;
        this.networkId = networkId;
    }

    async transfer(value: string, address: string): Promise<string> {
        if (!this.web3.utils.isAddress(address)) {
            throw 'incorrect wallet address'
        }

        const bnValue: any = new BigNumber(value);
        if (bnValue.isLessThanOrEqualTo(0)) {
            throw 'value for reward too small';
        }

        let nonce: number = await this.web3.eth.getTransactionCount(this.walletAddress);
        const amount = bnValue.multipliedBy(this.TOKEN_INCREASE);

        await this.validateTokensAmount(amount, this.walletAddress, this.contractAddress);
        await this.validateEth(this.walletAddress);

        const data = Abi.simpleEncode(
            'transfer(address,uint256)',
            address,
            this.web3.utils.toHex(amount)
        );

        const hash: string = await this.sendRawTransaction(
            data,
            this.walletPrivateKey,
            this.walletAddress,
            this.contractAddress,
            nonce++,
            this.gasPrice,
            this.gasLimit,
            this.networkId
        );

        return hash;
    }

    async checkTransactionState(hash: string): Promise<TxState> {
        try {
            const receipt: TransactionReceipt = await this.web3.eth.getTransactionReceipt(hash);
            if (receipt == null) {
                return TxState.PROGRESS;
            }


            return receipt.blockNumber > 0 && (receipt.status.toString() == 'true')
                ? TxState.SUCCESS
                : TxState.FAIL;
        } catch (e) {
            //ignore
        }

        return TxState.FAIL;
    }

    async validateTokensAmount(amount: any, address: string, contractAddress: string): Promise<void> {
        const data: Buffer = Abi.simpleEncode('balanceOf(address):(uint256)', address);
        const hexBalance: string = await this.web3.eth.call({
            to: contractAddress,
            data: '0x' + data.toString('hex')
        });
        const bnBalance: any = new BigNumber(hexBalance, 16);

        if (bnBalance.isLessThan(amount)) {
            throw 'CAT balance is low';
        }
    }

    async validateEth(address: string): Promise<void> {
        const balance = await this.web3.eth.getBalance(address);
        const eth: any = new BigNumber(this.web3.utils.fromWei(balance, 'ether'));
        if (eth.isLessThan(0.0001)) {
            throw 'Eth balance is low';
        }
    }

    private getAddressByPrivateKey(privateKey: string) {
        const ec = new EC('secp256k1');
        const keyPair = ec.genKeyPair();
        keyPair._importPrivate(privateKey, 'hex');
        const pubKey = keyPair.getPublic(false, 'hex').slice(2);

        const pubKeyWordArray = CryptoJS.enc.Hex.parse(pubKey);
        const hash = CryptoJS.SHA3(pubKeyWordArray, {outputLength: 256});

        return '0x' + hash.toString(CryptoJS.enc.Hex).slice(24);
    }

    private sendRawTransaction(data: any,
                               privateKey: Buffer,
                               walletAddress: string,
                               contractAddress: string,
                               nonce: number,
                               gasPrice: number,
                               gasLimit: number,
                               networkId: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const rawTx: any = {
                nonce: this.web3.utils.toHex(nonce),
                from: walletAddress,
                to: contractAddress,
                value: '0x0',
                data: data,
                gasPrice: this.web3.utils.toHex(gasPrice),
                gasLimit: this.web3.utils.toHex(gasLimit),
                chainId: this.web3.utils.toHex(networkId)
            };

            const tx: any = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();

            const event = this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

            // event.on('transactionHash', (hash) => {
            //     console.log('hash', hash);
            //     resolve(hash)
            // });

            event.on('receipt', (receipt) => {
                console.log('receipt', receipt);
                if (receipt.blockNumber > 0 && (receipt.status.toString() == 'true')) {
                    resolve(receipt.transactionHash)

                } else {
                    reject('transaction status fail')
                }
            });

            event.on('error', (error) => {
                console.log(error);
                reject(error)
            })
        });
    }

}
