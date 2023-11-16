import { ethers } from 'ethers';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getEthereumProvider, getPolygonProvider } from './Providers';
import axios from 'axios';
import './AddressDetails.css'; // Import the CSS file
import useWindowWidth from './useWindowWidth';

interface Transaction {
    hash: string;
    amount: string;
    timestamp: string;
    nonce: number;
    sender: string;
}

async function fetchTransactionHashes(
    site: string,
    address: string,
    apiKey: string,
): Promise<any[]> {
    const url = `https://api.${site}/api
?module=account
&action=txlist
&address=${address}
&startblock=0
&endblock=99999999
&page=1
&offset=0
&sort=asc
&apikey=${apiKey}`.trim()

    try {
        const response = await axios.get(url);
        const transactions: any[] = response.data.result;
        // return transactions.filter(tx => tx.from.toUpperCase() === address.toUpperCase()).map((transaction: any): Transaction => ({
        return transactions.map((transaction: any): Transaction => ({
            hash: transaction.hash,
            amount: ethers.formatEther(transaction.value),
            timestamp: new Date(parseInt(transaction.timeStamp) * 1000).toLocaleString(),
            nonce: parseInt(transaction.nonce),
            sender: transaction.from,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

type HistoricTableProps = {
    transactions: Transaction[],
    user: string,
    hashDisplayLength: number,
}

function HistoricTable(props: HistoricTableProps) {
    return (
        <div className="data-table">
            <div className="row header">
                <div className="cell">In Or Out</div>
                <div className="cell">Transaction Hash</div>
                <div className="cell">Amount</div>
                <div className="cell">Timestamp</div>
                <div className="cell">Nonce</div>
                <div className="cell">See More</div>
            </div>
            {props.transactions.map((transaction: Transaction) => (
                <div className="row">
                    <div className="cell">
                        <div className={`status ${transaction.sender.toUpperCase() === props.user.toUpperCase() ? 'out' : 'in'}`}>
                            {transaction.sender.toUpperCase() === props.user.toUpperCase() ? 'Out' : 'In'}
                        </div>
                    </div>
                    <div className="cell">{transaction.hash.substring(0, props.hashDisplayLength) + '...'}</div>
                    <div className="cell">{transaction.amount}</div>
                    <div className="cell">{transaction.timestamp}</div>
                    <div className="cell">{transaction.nonce}</div>
                    <div className="cell">
                        <Link to={`/tx/${transaction.hash}`} className="link">
                            See More
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
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
    const [ethereumTransactions, setEthereumTransactions] = React.useState<Transaction[]>([]);
    const [polygonTransactions, setPolygonTransactions] = React.useState<Transaction[]>([]);
    const [sortBy, setSortBy] = React.useState<'time' | 'amount'>('time');

    const [valid, setValid] = React.useState(false);

    const windowWidth = useWindowWidth();

    const [hashDisplayLength, setHashDisplayLength] = React.useState(10);

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
        const sortTransactionsBy = (txs: any[], sortBy: 'time' | 'amount') => {
            return txs.sort((a, b) => {
                if (sortBy === 'time') {
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                }
                return parseFloat(a.amount) - parseFloat(b.amount);
            });
        }
        (async () => {
            const ethtransactions = await fetchTransactionHashes('etherscan.io', address_input!, process.env.REACT_APP_ETHERSCAN_KEY!);
            setEthereumTransactions(sortTransactionsBy(ethtransactions, sortBy));

            const polytransactions = await fetchTransactionHashes('polygonscan.com', address_input!, process.env.REACT_APP_POLYSCAN_KEY!);
            setPolygonTransactions(sortTransactionsBy(polytransactions, sortBy));
        })()
    }, [valid, address_input, txCount, sortBy]);

    React.useEffect(() => { // calculate the hash display length
        if (windowWidth > 600) {
            setHashDisplayLength(10);
            return;
        }
        setHashDisplayLength(33); // full length -> 66
    }, [windowWidth]);

    if (!valid) {
        return <div className="container">
            <h1>Invalid Address</h1>
            <h2>{address_input}</h2>
            <Link to="/address/0xd90f7Fb941829CFE7Fc50eD235d1Efac05c58190" className="link">Try a demo address</Link>
        </div>

    }

    return (
        <div className="container">
            <h1>Address Details</h1>
            <h2>{address_input}</h2>
            <div className="data-table">
                <div className="row header">
                    <div className="cell">Network</div>
                    <div className="cell">Transaction Count</div>
                    <div className="cell">Balance</div>
                </div>
                <div className="row">
                    <div className="cell">Ethereum</div>
                    <div className="cell">{txCount.ethereum}</div>
                    <div className="cell">{balance.ethereum}</div>
                </div>
                <div className="row">
                    <div className="cell">Polygon</div>
                    <div className="cell">{txCount.polygon}</div>
                    <div className="cell">{balance.polygon}</div>
                </div>
                <div className="row">
                    <div className="cell">Total</div>
                    <div className="cell">{txCount.total}</div>
                    <div className="cell">{balance.total}</div>
                </div>
            </div>
            <div className="sorting-switch">
                <label>
                    Sort by:
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'time' | 'amount')}>
                        <option value="time">Time</option>
                        <option value="amount">Amount</option>
                    </select>
                </label>
            </div>


            <div className="etherscan-provided-data">
                <h2>The following data comes from a centralized indexing service.</h2>
                <h3>In practice these calls should be made on a server to protect the API key or even to use a custom indexing solution.</h3>
                <h2>Ethereum Transactions</h2>
                <HistoricTable
                    transactions={ethereumTransactions}
                    user={address_input ?? ethers.ZeroAddress}
                    hashDisplayLength={hashDisplayLength}
                />
                <h2>Polygon Transactions</h2>
                <HistoricTable
                    transactions={polygonTransactions}
                    user={address_input ?? ethers.ZeroAddress}
                    hashDisplayLength={hashDisplayLength}
                />
            </div>
        </div>
    );
}