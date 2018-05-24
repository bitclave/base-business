import {Config} from "./Config";

export default class ProdConfig implements Config {

    getEthereumNodeHost(): string {
        return 'https://mainnet.infura.io/R4kTXAgVNzEAjjRP3gvK'
    }

    getContractAddress(): string {
        return '0x0';
    }

    getGasLimit(): number {
        return 4000000;
    }

    getGasPrice(): number {
        return 1000000000;
    }

    getNetworkId(): number {
        return 1;
    }

}
