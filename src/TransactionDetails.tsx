import React from 'react';
import { useParams } from 'react-router-dom';


export default function TransactionDetails () {
    const { tx_input } = useParams();

    return <>
        <h1>Transaction Details</h1>
        <h2>{tx_input}</h2>

    </>
}