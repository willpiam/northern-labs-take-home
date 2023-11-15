import React from 'react';
import { useParams } from 'react-router-dom';

export default function AddressDetails() {
    const { address_input } = useParams();

    return <>
        <h1>Address Details</h1>
        <h2>
            {address_input}
        </h2>
    </>
}