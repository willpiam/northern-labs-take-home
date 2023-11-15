import { ethers } from 'ethers';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getEthereumProvider, getPolygonProvider } from './Providers';

export default function AddressDetails() {
    const { address_input } = useParams();
    const [txCount, setTxCount] = React.useState({
        ethereum: 0,
        polygon: 0,
        total: 0,
    });
    const [balance, setBalance] = React.useState({
        ethereum: '0',
        polygon: '0',
        total: '0',
    });

    const [valid, setValid] = React.useState(false);

    React.useEffect(() => { // is the provided input a valid address?
        if (ethers.isAddress(address_input)) {
            setValid(true);
            return;
        }

        setValid(false);
        return;
    }, [address_input]);

    React.useEffect(() => { // find the accounts tx count
        if (!valid)
            return;

        const ethereum = getEthereumProvider();
        const polygon = getPolygonProvider();

        (async () => {
            const ethereumTxCount = await ethereum.getTransactionCount(address_input!);
            const polygonTxCount = await polygon.getTransactionCount(address_input!);

            setTxCount({
                ethereum: ethereumTxCount,
                polygon: polygonTxCount,
                total: ethereumTxCount + polygonTxCount,
            });
        })();
    }, [valid, address_input]);

    React.useEffect(() => { // find the accounts balance
        if (!valid)
            return;

        const ethereum = getEthereumProvider();
        const polygon = getPolygonProvider();

        (async () => {
            const ethereumBalance = await ethereum.getBalance(address_input!);
            const polygonBalance = await polygon.getBalance(address_input!);

            setBalance({
                ethereum: `${ethers.formatEther(ethereumBalance)} ETH`,
                polygon: `${ethers.formatEther(polygonBalance)} MATIC`,
                total: 'NA', // convert to USD and add
            });
        })();
    }, [valid, address_input]);


    if (!valid) {
        return <>
            <h1>Invalid Address</h1>
            <h2>{address_input}</h2>
            <Link to="/address/0xd90f7Fb941829CFE7Fc50eD235d1Efac05c58190">Try a demo address</Link>
        </>
    }

    return <>
        <h1>Address Details</h1>
        <h2>
            {address_input}
            <table border={1}>
                <thead>
                    <tr>
                        <th>Network</th>
                        <th>Transaction Count</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Ethereum</td>
                        <td>{txCount.ethereum}</td>
                        <td>{balance.ethereum}</td>
                    </tr>
                    <tr>
                        <td>Polygon</td>
                        <td>{txCount.polygon}</td>
                        <td>{balance.polygon}</td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td>{txCount.total}</td>
                        <td>{balance.total}</td>
                    </tr>
                </tbody>
            </table>
        </h2>

    </>
}