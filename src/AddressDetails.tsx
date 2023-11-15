import { ethers } from 'ethers';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getEthereumProvider, getPolygonProvider } from './Providers';
import axios from 'axios';

interface Transaction {
    hash: string;
    amount: string;
    timestamp: string;
    nonce: number;
    // ... other relevant properties
}

async function fetchTransactionHashes(
    address: string,
    startBlock: number,
    endBlock: number,
    apiKey: string,
): Promise<any[]> {
    const url = `https://api.etherscan.io/api
?module=account
&action=txlist
&address=0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC
&startblock=0
&endblock=99999999
&page=1
&offset=10
&sort=asc
&apikey=${apiKey}`.trim()

    try {
        const response = await axios.get(url);
        const transactions: any[] = response.data.result;
        console.log(transactions)
        return transactions.map((transaction: any): Transaction => ({
            hash: transaction.hash,
            amount: ethers.formatEther(transaction.value),
            timestamp: new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString(),
            nonce: parseInt(transaction.nonce),
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}







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
    const [transactions, setTransactions] = React.useState<Transaction[]>([]); // [Transaction, Transaction, Transaction

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

    React.useEffect(() => { // given: address + txCount -> find the transactions
        if (!valid)
            return;
        if (address_input === undefined)
            return;
        if (txCount.total === 0)
            return;
        (async () => {
            const transactions = await fetchTransactionHashes(address_input!, 0, txCount.ethereum, process.env.REACT_APP_ETHERSCAN_KEY!);
            console.log(transactions)
            setTransactions(transactions);
        })()
    }, [valid, address_input, txCount]);

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
        </h2>
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

        <div className="etherscan-provided-data">
            <h2>
                The following data comes from a centralized indexing service.
            </h2>
            <h3>
                In practice these calls should be made on a server to protect the API key or even to use a custom indexing solution.
            </h3>
            <h2>
                Ethereum Transactions
            </h2>
            <table border={1}>

                <thead>
                    <tr>
                        <th>Transaction Hash</th>
                        <th>Amount</th>
                        <th>Timestamp</th>
                        <th>Nonce</th>
                        <th>See More</th>
                    </tr>
                </thead>
                <tbody>

                    {
                        transactions.map((transaction: Transaction) => {
                            return <tr>
                                <td>{transaction.hash}</td>
                                <td>{transaction.amount}</td>
                                <td>{transaction.timestamp}</td>
                                <td>
                                    {transaction.nonce}
                                </td>
                                <td>
                                    <Link to={`/tx/${transaction.hash}`}>
                                        See More
                                    </Link>
                                </td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
        </div>

    </>
}