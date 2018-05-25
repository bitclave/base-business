import {TokenTransfer} from "./TokenTransfer";
import {TransactionReceipt} from "web3/types";
import {TxState} from "./TxState";
import Transaction from "./Transaction";
import EthAddressUtils from "../../utils/EthAddressUtils";
import {NonceHelper} from "./NonceHelper";

const BigNumber = require('bignumber.js');
const Abi = require('ethereumjs-abi');
const Tx = require('ethereumjs-tx');

export default class TokenTransferImpl implements TokenTransfer {

    private readonly TOKEN_INCREASE = new BigNumber(10).pow(18);

    private web3: any;
    private nonceHelper: NonceHelper;
    private walletAddress: string;
    private walletPrivateKey: Buffer;
    private contractAddress: string;
    private gasLimit: number;
    private gasPrice: number;
    private networkId: number;

    constructor(web3: any,
                nonceHelper: NonceHelper,
                walletPrivateKey: string,
                contractAddress: string,
                gasLimit: number,
                gasPrice: number,
                networkId: number) {
        this.web3 = web3;
        this.nonceHelper = nonceHelper;
        this.walletPrivateKey = Buffer.from(walletPrivateKey, 'hex');
        this.walletAddress = EthAddressUtils.getAddressByPrivateKey(walletPrivateKey);
        this.contractAddress = contractAddress;
        this.gasLimit = gasLimit;
        this.gasPrice = gasPrice;
        this.networkId = networkId;
    }

    async transfer(value: string, address: string): Promise<Transaction> {
        if (!this.web3.utils.isAddress(address)) {
            throw 'incorrect wallet address'
        }

        const bnValue: any = new BigNumber(value);

        if (bnValue.isLessThanOrEqualTo(0)) {
            throw 'value for reward too small';
        }

        const amount = bnValue.multipliedBy(this.TOKEN_INCREASE);

        await this.validateTokensAmount(amount, this.walletAddress, this.contractAddress);
        await this.validateEth(this.walletAddress);

        const data = Abi.simpleEncode('transfer(address,uint256)', address, this.toHex(amount));

        while (true) {
            const result = await this.sendRawTransaction(
                data,
                this.walletPrivateKey,
                this.walletAddress,
                this.contractAddress,
                await this.nonceHelper.getNonce(),
                this.gasPrice,
                this.gasLimit,
                this.networkId
            ).catch((reason: Error) => {
                const isTooLow: boolean = reason.message.toLowerCase().indexOf('nonce too low') > 0;
                if (!isTooLow) {
                    throw reason;
                } else {
                }
            });

            await this.nonceHelper.increaseNonce();
            if (result != null) {
                return result;
            }
        }
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

    private async validateTokensAmount(amount: any, address: string, contractAddress: string): Promise<void> {
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

    private async validateEth(address: string): Promise<void> {
        const balance = await this.web3.eth.getBalance(address);
        const eth: any = new BigNumber(this.web3.utils.fromWei(balance, 'ether'));
        if (eth.isLessThan(0.0001)) {
            throw 'Eth balance is low';
        }
    }

    private sendRawTransaction(data: any,
                               privateKey: Buffer,
                               walletAddress: string,
                               contractAddress: string,
                               nonce: number,
                               gasPrice: number,
                               gasLimit: number,
                               networkId: number): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            const rawTx: any = {
                nonce: this.toHex(nonce),
                from: walletAddress,
                to: contractAddress,
                value: '0x0',
                data: data,
                gasPrice: this.toHex(gasPrice),
                gasLimit: this.toHex(gasLimit),
                chainId: this.toHex(networkId)
            };

            const tx: any = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();

            const event = this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

            event.on('transactionHash', (hash) => {
                console.log('hash', hash);
                resolve(new Transaction(hash, nonce))
            });

            event.on('error', (error) => {
                console.log(error);
                reject(error)
            })
        });
    }

    private toHex(value: any): string {
        return this.web3.utils.toHex(value);
    }

}
