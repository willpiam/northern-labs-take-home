export default function isValidEthereumTxHash(txHash: string): boolean {
    const regex = /^0x[a-fA-F0-9]{64}$/;
    return regex.test(txHash);
}