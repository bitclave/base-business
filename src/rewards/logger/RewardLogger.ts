import PayResult from "../../models/PayResult";

export interface RewardLogger {

    getLogs(): Promise<Array<PayResult>>;

    saveLogs(items: Array<PayResult>): Promise<void>;

}
