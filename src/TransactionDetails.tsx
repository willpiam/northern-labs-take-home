import { ethers } from 'ethers';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getEthereumProvider, getPolygonProvider } from './Providers';

function isValidEthereumTxHash(txHash: string): boolean {
    const regex = /^0x[a-fA-F0-9]{64}$/;
    return regex.test(txHash);
}

type TxDetails = {
    chain: 'ethereum' | 'polygon',
    amount: string,
    timestamp: string,
    confirmationStatus: 'loading' | 'successful' | 'failed',
    fee: string,
    nonce: number,
}

export default function TransactionDetails() {
    const { tx_input } = useParams();
    const [valid, setValid] = React.useState(false);
    const [details, setDetails] = React.useState<TxDetails | null>(null);

    React.useEffect(() => { // is the provided input a valid address?
        if (tx_input === undefined)
            return;
        if (isValidEthereumTxHash(tx_input)) {
            setValid(true);
            return;
        }

        setValid(false);
        return;
    }, [tx_input]);

    React.useEffect(() => { // find the transaction details
        if (!valid)
            return;

        const ethereum = getEthereumProvider();
        const polygon = getPolygonProvider();

        (async () => { // use the provider to get the transaction details

            const ethereumResult = await ethereum.getTransaction(tx_input!);
            const polygonResult = await polygon.getTransaction(tx_input!);

            // case -> both null
            if (ethereumResult === null && polygonResult === null) {
                // handle error -> indicate that the transaction does not exist
                return;
            }

            const result = ethereumResult ?? polygonResult;

            // to get the timestamp we need the block
            const block = await (ethereumResult === null ? polygon : ethereum).getBlock(result!.blockNumber!);

            const timestamp = new Date(block!.timestamp * 1000).toLocaleString();

            const details: TxDetails = {
                chain: ethereumResult === null ? 'polygon' : 'ethereum',
                amount: `${ethers.formatEther(result!.value)} ${ethereumResult === null ? 'MATIC' : 'ETH'}`,
                timestamp: timestamp,
                confirmationStatus: 'successful', // temporary place holder 
                fee: `${ethers.formatEther(result!.gasPrice * result!.gasLimit)} ${ethereumResult === null ? 'MATIC' : 'ETH'}`,
                nonce: result!.nonce,
            }

            setDetails(details);
        })();


    }, [valid, tx_input])

    if (!valid)
        return <>
            <h1>Invalid Transaction Hash</h1>
            <h2>{tx_input}</h2>
            <Link to="/tx/0x5a2e936f418affd295fcd91e8bbbbcc04ad58451bed856d4cf5b2413bd270a72">Try a demo Transaction</Link>
        </>

    return <>
        <h1>Transaction Details</h1>
        <h2>{tx_input}</h2>
        <table border={1}>
            <thead>
                <tr>
                    <th>
                        Chain
                    </th>
                    <th>
                        Amount
                    </th>
                    <th>
                        Timestamp
                    </th>
                    <th>
                        Confirmation Status
                    </th>
                    <th>
                        Fee
                    </th>
                    <th>
                        Nonce
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        {details?.chain}
                    </td>
                    <td>
                        {details?.amount}
                    </td>
                    <td>
                        {details?.timestamp}
                    </td>
                    <td>
                        {details?.confirmationStatus}
                    </td>
                    <td>
                        {details?.fee}
                    </td>
                    <td>
                        {details?.nonce}
                    </td>
                </tr>
            </tbody>

        </table>

    </>
}