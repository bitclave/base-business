export interface NonceHelper {

    getNonce(): Promise<number>;

    increaseNonce(): Promise<number>;

}
