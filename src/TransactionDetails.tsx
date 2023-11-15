import { ethers } from 'ethers';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getEthereumProvider, getPolygonProvider } from './Providers';
import './TransactionDetails.css';
import isValidEthereumTxHash from './isValidEthereumTxHash';

type TxDetails = {
    chain: 'ethereum' | 'polygon',
    amount: string,
    timestamp: string,
    fee: string,
    nonce: number,
    reverted: boolean,
}

function DetailItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="detail-item">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
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

            const receipt = await (ethereumResult === null ? polygon : ethereum).getTransactionReceipt(tx_input!);
            console.log("recipt: ", receipt);
            const didRevert = receipt?.status === 0;
            const result = ethereumResult ?? polygonResult;

            // to get the timestamp we need the block
            const block = await (ethereumResult === null ? polygon : ethereum).getBlock(result!.blockNumber!);

            const timestamp = new Date(block!.timestamp * 1000).toLocaleString();

            const details: TxDetails = {
                chain: ethereumResult === null ? 'polygon' : 'ethereum',
                amount: `${ethers.formatEther(result!.value)} ${ethereumResult === null ? 'MATIC' : 'ETH'}`,
                timestamp: timestamp,
                fee: `${ethers.formatEther(result!.gasPrice * result!.gasLimit)} ${ethereumResult === null ? 'MATIC' : 'ETH'}`,
                nonce: result!.nonce,
                reverted: didRevert,
            }

            setDetails(details);
        })();


    }, [valid, tx_input])
    return (
        <>
            {!valid ? (
                <div className="error">
                    <h1>Invalid Transaction Hash</h1>
                    <h2>{tx_input}</h2>
                    <Link to="/tx/0x5a2e936f418affd295fcd91e8bbbbcc04ad58451bed856d4cf5b2413bd270a72">
                        Try a demo Transaction
                    </Link>
                </div>
            ) : (
                <div className="transaction-details">
                    <h1>Transaction Details</h1>
                    <h2>{tx_input}</h2>
                    <div className="details-grid">
                        {details && (
                            <>
                                <DetailItem label="Chain" value={details.chain} />
                                <DetailItem label="Amount" value={details.amount} />
                                <DetailItem label="Timestamp" value={details.timestamp} />
                                <DetailItem
                                    label="Confirmation Status"
                                    value={details.reverted ? 'Reverted' : 'Confirmed'}
                                />
                                <DetailItem label="Fee" value={details.fee} />
                                <DetailItem label="Nonce" value={details.nonce.toString()} />
                                <div className="detail-item">
                                    <span>View More</span>
                                    <a
                                        href={
                                            details.chain === 'ethereum'
                                                ? `https://etherscan.io/tx/${tx_input}`
                                                : `https://polygonscan.com/tx/${tx_input}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View Via External Explorer
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

