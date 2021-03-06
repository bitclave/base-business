import Base, {
    AddrRecord,
    BaseAddrPair,
    OfferSearchResultItem,
    WalletManagerImpl,
    WalletsRecords,
    OfferShareData,
    OfferShareDataRepository,
    OfferSearchRepository,
    AccessRight
} from '@bitclave/base-client-js';

import { Comparator } from './comparator/Comparator';
import { TokenTransfer } from './transfer/TokenTransfer';
import CompareResult from '../models/CompareResult';
import PayResult from '../models/PayResult';
import { RewardLogger } from './logger/RewardLogger';
import { TxState } from './transfer/TxState';

export default class WorthValidator {

    private readonly REPEAT_TIME: number = 1000 * 30; // 3600000;

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
        setTimeout(() => this.syncShareData(businessPublicKey), this.REPEAT_TIME);
    }

    private syncShareData(businessPublicKey: string) {
        console.log('sync process...');

        this.getOfferShareData(businessPublicKey)
            .then((result: Array<OfferShareData>) =>
              result.map(this.compareData.bind(this))
            )
            .then(promise => Promise.all(promise))
            .then( result =>
              result.map(this.payReward.bind(this))
            )
            .then(promises => Promise.all(promises))
            .then(this.saveRewardLogs.bind(this))
            .then(() => {
                console.log('check shared data success');
                this.syncDataShareWithDelay(businessPublicKey);
            })
            .catch(reason => {
                console.log('get error:', reason);
                this.syncDataShareWithDelay(businessPublicKey);
            });
    }

    private async getOfferShareData(businessPublicKey: string): Promise<Array<OfferShareData>> {
        const exclude: Array<number> = await this.checkRewardLogs();
        const shareData: Array<OfferShareData> = await this.offerShareDataRepository
            .getShareData(businessPublicKey, false);

        return shareData.filter(data => exclude.indexOf(data.offerSearchId) === -1);
    }

    private async checkRewardLogs(): Promise<Array<number>> {
        const payResults: Array<PayResult> = await this.rewardLogger.getLogs();

        for (let item of payResults) {
            if (item.compareResult.state && item.transaction.nonce !== 0) {
                const state: TxState = await this.tokenTransfer
                    .checkTransactionState(item.transaction.hash);

                if (!item.accepted) {
                    try {
                        await this.offerShareDataRepository.acceptShareData(
                            item.compareResult.offerSearchId,
                            item.compareResult.worth
                        );
                        item.accepted = true;
                    } catch (e) {
                        console.log('try accept offer share data fail!: ', e);
                    }
                }

                if (state === TxState.FAIL) {
                    const result: PayResult = await this.payReward(item.compareResult);
                    payResults.splice(payResults.indexOf(item), 1, result);

                } else if (state === TxState.SUCCESS && item.accepted) {
                    payResults.splice(payResults.indexOf(item), 1);
                }
            }
        }

        await this.rewardLogger.saveLogs(payResults);

        return payResults.map(value => value.compareResult.offerSearchId);
    }

    private async saveRewardLogs(items: Array<PayResult>): Promise<void> {
        const mergeMap: Map<number, PayResult> = new Map();
        const payResults: Array<PayResult> = await this.rewardLogger.getLogs();

        payResults.forEach(value => mergeMap.set(value.compareResult.offerSearchId, value));

        items.filter(value => value.compareResult.state && value.transaction.nonce > 0)
            .forEach(value => mergeMap.set(value.compareResult.offerSearchId, value));

        await this.rewardLogger.saveLogs(Array.from(mergeMap.values()));
    }

    private async compareData(offerShareData: OfferShareData): Promise<CompareResult> {
        const result: CompareResult = new CompareResult(
            false,
            '',
            offerShareData.offerSearchId,
            offerShareData.worth
        );

        console.log('try compare data. offerSearchId: ', offerShareData.offerSearchId);

        try {
            const clientData: Map<string, string> = await this.base.profileManager
                .getAuthorizedData(offerShareData.clientId, offerShareData.clientResponse);

            const clearClientData: Map<string, string> = new Map();
            clientData.forEach((value, key) => {
                if (key !== WalletManagerImpl.DATA_KEY_ETH_WALLETS) {
                    clearClientData.set(key, value);
                }
            });

            try {
                result.ethWallet = this.getEthAddressForReward(clientData);
            } catch (e) {
                console.log(e);
            }

            const searchResult: OfferSearchResultItem[] = await this.offerSearchRepository.getSearchResultByOfferSearchId(offerShareData.clientId, offerShareData.offerSearchId);
            const priceIdChosenByUser = offerShareData.priceId;
            if (searchResult.length !== 1) {
              throw new Error('inconsistent data');
            }
            const offer = searchResult[0].offer;

            const priceChosenByUser = offer.offerPrices.find(e => e.id === priceIdChosenByUser);
            if (!priceChosenByUser) {
              throw new Error('The price was chosen by user was not found');
            }
            const mustHaveFields = priceChosenByUser.getFieldsForAcception(AccessRight.R);
            let keys = Array.from( mustHaveFields.keys() );
            let isListFieldCompleted = keys.every( e => {
              return e && clearClientData.get(e) ? true : false;
            });

            result.state = isListFieldCompleted && result.ethWallet.length > 0;

        } catch (e) {
            console.log('compare data error: ', e);
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
                offerSearch id:  ${compareResult.offerSearchId};
                worth: ${compareResult.worth}`
            );

            console.log('call transfer');
            result.transaction = await this.tokenTransfer.transfer(
                compareResult.worth, compareResult.ethWallet
            );

            console.log('update share data status');
            await this.offerShareDataRepository.acceptShareData(
                compareResult.offerSearchId,
                compareResult.worth
            );

            result.accepted = true; 

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
                throw 'invalid wallets records';
            }

            const validWallets: boolean = this.base.walletManager.validateWallets(walletRecords);

            if (!validWallets) {
                throw 'invalid wallets records';
            }

            const records: Array<AddrRecord> = walletRecords.data;

            if (records.length <= 0) {
                throw 'Client does not have a wallet';
            }
            const pair: BaseAddrPair = Object.assign(new BaseAddrPair('', ''), JSON.parse(records[0].data));

            return pair.ethAddr;

        } else {
            throw  'Business does not have permission for a wallet data';
        }
    }

}
