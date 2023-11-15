import { ethers } from 'ethers';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function AddressDetails() {
    const { address_input } = useParams();

    const [valid, setValid] = React.useState(false);

    React.useEffect(() => { // is the provided input a valid address?
        if (ethers.isAddress(address_input)) {
            setValid(true);
            return;
        }

        setValid(false);
        return;
    }, [address_input]);

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

    </>
}