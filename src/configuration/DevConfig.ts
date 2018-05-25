import {Config} from "./Config";

export default class DevConfig implements Config {

    getEthereumNodeHost(): string {
        return 'https://ropsten.infura.io/R4kTXAgVNzEAjjRP3gvK';
    }

    getContractAddress(): string {
        return '0x56c38d117f92ed0501a9f7ee39abf9089988b6e0';
    }

    getGasLimit(): number {
        return 4000000;
    }

    getGasPrice(): number {
        return 1000000000;
    }

    getNetworkId(): number {
        return 3;
    }

}
