export const ListingBook = [
    {
      "type": "function",
      "name": "get1155Bids",
      "inputs": [
        { "name": "collection", "type": "address", "internalType": "address" },
        { "name": "token", "type": "address", "internalType": "address" },
        { "name": "nftId", "type": "uint256", "internalType": "uint256" },
        { "name": "start", "type": "uint256", "internalType": "uint256" },
        { "name": "end", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "get1155Listings",
      "inputs": [
        { "name": "collection", "type": "address", "internalType": "address" },
        { "name": "token", "type": "address", "internalType": "address" },
        { "name": "nftId", "type": "uint256", "internalType": "uint256" },
        { "name": "start", "type": "uint256", "internalType": "uint256" },
        { "name": "end", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "get721Bids",
      "inputs": [
        { "name": "collection", "type": "address", "internalType": "address" },
        { "name": "token", "type": "address", "internalType": "address" },
        { "name": "start", "type": "uint256", "internalType": "uint256" },
        { "name": "end", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "get721Listings",
      "inputs": [
        { "name": "collection", "type": "address", "internalType": "address" },
        { "name": "token", "type": "address", "internalType": "address" },
        { "name": "start", "type": "uint256", "internalType": "uint256" },
        { "name": "end", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
  ] as const;