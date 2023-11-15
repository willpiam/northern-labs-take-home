import { ethers } from 'ethers';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

function isValidEthereumTxHash(txHash: string): boolean {
    const regex = /^0x[a-fA-F0-9]{64}$/;
    return regex.test(txHash);
}

export default function TransactionDetails() {
    const { tx_input } = useParams();
    const [valid, setValid] = React.useState(false);

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

    if (!valid)
        return <>
            <h1>Invalid Transaction Hash</h1>
            <h2>{tx_input}</h2>
            <Link to="/tx/0x5a2e936f418affd295fcd91e8bbbbcc04ad58451bed856d4cf5b2413bd270a72">Try a demo Transaction</Link>
        </>

    return <>
        <h1>Transaction Details</h1>
        <h2>{tx_input}</h2>


    </>
}