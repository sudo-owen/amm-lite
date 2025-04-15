export const Multicall = [
    {
      "type": "function",
      "name": "aggregate",
      "inputs": [
        {
          "name": "calls",
          "type": "tuple[]",
          "internalType": "struct Multicall.Call[]",
          "components": [
            { "name": "target", "type": "address", "internalType": "address" },
            { "name": "callData", "type": "bytes", "internalType": "bytes" }
          ]
        }
      ],
      "outputs": [
        { "name": "blockNumber", "type": "uint256", "internalType": "uint256" },
        { "name": "returnData", "type": "bytes[]", "internalType": "bytes[]" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getBlockHash",
      "inputs": [
        { "name": "blockNumber", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "blockHash", "type": "bytes32", "internalType": "bytes32" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCurrentBlockCoinbase",
      "inputs": [],
      "outputs": [
        { "name": "coinbase", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCurrentBlockDifficulty",
      "inputs": [],
      "outputs": [
        { "name": "difficulty", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCurrentBlockGasLimit",
      "inputs": [],
      "outputs": [
        { "name": "gaslimit", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCurrentBlockTimestamp",
      "inputs": [],
      "outputs": [
        { "name": "timestamp", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getEthBalance",
      "inputs": [
        { "name": "addr", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "balance", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getLastBlockHash",
      "inputs": [],
      "outputs": [
        { "name": "blockHash", "type": "bytes32", "internalType": "bytes32" }
      ],
      "stateMutability": "view"
    }
  ] as const;