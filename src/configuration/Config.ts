export interface Config {

    getEthereumNodeHost(): string;

    getContractAddress(): string;

    getGasLimit(): number;

    getGasPrice(): number;

    getNetworkId(): number;

}
