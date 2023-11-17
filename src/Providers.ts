import { ethers } from "ethers";

const ethereumEndpoints : string[] = [
    'https://eth.llamarpc.com',
    // 'https://virginia.rpc.blxrbdn.com',
    // 'https://rpc.mevblocker.io',
]

// const getEthereumProvider = () => new ethers.FallbackProvider(ethereumEndpoints.map(url => new ethers.JsonRpcProvider(url)));
const getEthereumProvider = () => new ethers.JsonRpcProvider(ethereumEndpoints[0]);

const polygonEndpoints : string[] = [
    'https://polygon.llamarpc.com',
    // 'https://polygon.rpc.blxrbdn.com',
    // 'https://polygon-rpc.com',
]

// const getPolygonProvider = () => new ethers.FallbackProvider(polygonEndpoints.map(url => new ethers.JsonRpcProvider(url)));
const getPolygonProvider = () => new ethers.JsonRpcProvider(polygonEndpoints[0]);

export {
    getEthereumProvider,
    getPolygonProvider
}