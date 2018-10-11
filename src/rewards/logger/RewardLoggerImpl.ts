import { RewardLogger } from './RewardLogger';
import PayResult from '../../models/PayResult';
import CompareResult from '../../models/CompareResult';
import Transaction from '../transfer/Transaction';

const LocalStorage = require('node-localstorage').LocalStorage;

export default class RewardLoggerImpl implements RewardLogger {
    private readonly LOG_PATH: string = './storage';
    private readonly PAY_RESULT_KEY: string = 'payresults';

    /* tslint:disable:no-any */
    private storage: any;

    constructor() {
        this.storage = new LocalStorage(this.LOG_PATH);
    }

    async getLogs(): Promise<Array<PayResult>> {
        let result: Array<PayResult>;

        try {
            result = JSON.parse(await this.storage.getItem(this.PAY_RESULT_KEY));
        } catch (e) {
            result = [];
        }

        return (result || []).map(value => {
            const payResult: PayResult = Object.assign(new PayResult(), value);
            payResult.compareResult = Object.assign(new CompareResult(), value.compareResult);
            payResult.transaction = Object.assign(new Transaction(), value.transaction);

            return payResult;
        });
    }

    async saveLogs(items: Array<PayResult>): Promise<void> {
        await this.storage.setItem(this.PAY_RESULT_KEY, JSON.stringify(items));
    }

}
