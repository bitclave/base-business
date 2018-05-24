import Base, {
    AddrRecord,
    BaseAddrPair,
    OfferSearchResultItem,
    WalletManagerImpl,
    WalletsRecords
} from 'bitclave-base';

import {OfferShareDataRepository} from "../repository/OfferShareDataRepository";
import {Comparator} from "./comparator/Comparator";
import OfferShareData from "bitclave-base/repository/models/OfferShareData";
import {OfferSearchRepository} from "../repository/OfferSearchRepository";
import {TokenTransfer} from "./transfer/TokenTransfer";
import CompareResult from "../models/CompareResult";
import PayResult from "../models/PayResult";
import {RewardLogger} from "./logger/RewardLogger";

export default class WorthValidator {

    private readonly REPEAT_TIME: number = 3600000;

    private offerShareDataRepository: OfferShareDataRepository;
    private offerSearchRepository: OfferSearchRepository;
    private base: Base;
    private comparator: Comparator;
    private tokenTransfer: TokenTransfer;
    private rewardLogger: RewardLogger;

    constructor(offerShareDataRepository: OfferShareDataRepository,
                offerSearchRepository: OfferSearchRepository,
                base: Base,
                comparator: Comparator,
                tokenTransfer: TokenTransfer,
                rewardLogger: RewardLogger) {

        this.offerShareDataRepository = offerShareDataRepository;
        this.offerSearchRepository = offerSearchRepository;
        this.base = base;
        this.comparator = comparator;
        this.tokenTransfer = tokenTransfer;
        this.rewardLogger = rewardLogger;

        this.syncDataShareWithDelay(base.accountManager.getAccount().publicKey);
    }

    private syncDataShareWithDelay(businessPublicKey: string) {
        console.log(`wait before sync. wait ${this.REPEAT_TIME} ms`);
        setTimeout(() => this.syncShareData(businessPublicKey), this.REPEAT_TIME)
    }

    private syncShareData(businessPublicKey: string) {
        console.log('sync process...');

        this.checkRewardLogs()
            .then(() => this.offerShareDataRepository
                .getShareData(businessPublicKey, false))
            .then((result: Array<OfferShareData>) => result.map(this.compareData.bind(this)))
            .then(promise => Promise.all(promise))
            .then((result: Array<CompareResult>) => result.map(this.payReward.bind(this)))
            .then(promise => Promise.all(promise))
            .then(this.saveRewardLogs.bind(this))
            .then(() => {
                console.log('check shared data success');
                this.syncDataShareWithDelay(businessPublicKey);
            })
            .catch(reason => {
                console.log('get error:', reason);
                this.syncDataShareWithDelay(businessPublicKey);
            })
    }

    private async checkRewardLogs(): Promise<void> {
        const result: Array<PayResult> = await this.rewardLogger.getLogs();

        for (let item of result) {
            if (item.compareResult.state && item.transactionHash.length == 0) {
                try {
                    await this.payReward(item.compareResult);
                } catch (e) {
                    console.log('error when try pay', item.compareResult.offerSearchId, e)
                }
            }
        }
    }

    private async saveRewardLogs(items: Array<PayResult>): Promise<void> {
        const result = items.filter(item => {
            return item.compareResult.state && item.transactionHash.length == 0
        });

        await this.rewardLogger.saveLogs(result)
    }

    private async compareData(offerShareData: OfferShareData): Promise<CompareResult> {
        const result: CompareResult = new CompareResult(
            false,
            '',
            offerShareData.offerSearchId,
            offerShareData.worth
        );

        try {
            const clientData: Map<string, string> = await this.base
                .profileManager
                .getAuthorizedData(offerShareData.clientId, offerShareData.clientResponse);

            const clearClientData: Map<string, string> = new Map();

            clientData.forEach((value, key) => {
                if (key != WalletManagerImpl.DATA_KEY_ETH_WALLETS) {
                    clearClientData.set(key, value);
                }
            });

            try {
                result.ethWallet = this.getEthAddressForReward(clientData);
            } catch (e) {
                console.log(e)
            }

            const searchResult: OfferSearchResultItem = await this.offerSearchRepository
                .getOfferSearchItem(offerShareData.clientId, offerShareData.offerSearchId);

            searchResult.offer
                .rules
                .delete(WalletManagerImpl.DATA_KEY_ETH_WALLETS);

            searchResult.offer
                .compare
                .delete(WalletManagerImpl.DATA_KEY_ETH_WALLETS);

            const compareResult: Map<string, boolean> = await this.comparator
                .compare(searchResult.offer, clearClientData);

            const compareKeys: Array<boolean> = Array.from(compareResult.values());
            const countOfValid: number = compareKeys
                .filter(value => value === true).length;

            result.state = compareKeys.length == countOfValid && result.ethWallet.length > 0;

        } catch (e) {
            console.log('compare data error: ', e)
        }

        return result;
    }

    private async payReward(compareResult: CompareResult): Promise<PayResult> {
        const result: PayResult = new PayResult(compareResult);

        if (!compareResult.state) {
            return result;
        }

        try {
            console.log(
                `try pay to wallet address: ${compareResult.ethWallet}; 
                search request id: ${compareResult.offerSearchId};
                worth: ${compareResult.worth}`
            );

            console.log('update share data status');
            await this.offerShareDataRepository.acceptShareData(
                compareResult.offerSearchId,
                compareResult.worth
            );

            result.transactionHash = await this.tokenTransfer.transfer(
                compareResult.worth, compareResult.ethWallet
            );

            console.log('pay success');

        } catch (e) {
            console.log('pay fail! cause:', e);
        }

        return result;
    }

    private getEthAddressForReward(clientData: Map<string, string>): string {
        const walletsValue: string | undefined = clientData.get(WalletManagerImpl.DATA_KEY_ETH_WALLETS);

        if (walletsValue != null) {
            let walletRecords: WalletsRecords;
            try {
                walletRecords = Object.assign(new WalletsRecords([], ''), JSON.parse(walletsValue));
            } catch (e) {
                throw 'invalid wallets records'
            }
            const validator = this.base.walletManager['baseSchema'];
            const validWallets: boolean = validator.validateWallets(walletRecords);

            if (!validWallets) {
                throw 'invalid wallets records'
            }

            const records: Array<AddrRecord> = walletRecords.data;

            if (records.length <= 0) {
                throw 'Client does not have a wallet'
            }
            const pair: BaseAddrPair = Object.assign(new BaseAddrPair('', ''), JSON.parse(records[0].data));

            return pair.ethAddr;

        } else {
            throw  'Business does not have permission for a wallet data'
        }
    }

}
