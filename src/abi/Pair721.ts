export const Pair721 = [
    {
      "type": "function",
      "name": "ROYALTY_ENGINE",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract IRoyaltyEngineV1"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "bondingCurve",
      "inputs": [],
      "outputs": [
        {
          "name": "_bondingCurve",
          "type": "address",
          "internalType": "contract ICurve"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "calculateRoyaltiesView",
      "inputs": [
        { "name": "assetId", "type": "uint256", "internalType": "uint256" },
        { "name": "saleAmount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "royaltyRecipients",
          "type": "address[]",
          "internalType": "address payable[]"
        },
        {
          "name": "royaltyAmounts",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        { "name": "royaltyTotal", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "changeAssetRecipient",
      "inputs": [
        {
          "name": "newRecipient",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "changeDelta",
      "inputs": [
        { "name": "newDelta", "type": "uint128", "internalType": "uint128" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "changeFee",
      "inputs": [
        { "name": "newFee", "type": "uint96", "internalType": "uint96" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "changeReferralAddress",
      "inputs": [
        { "name": "newReferral", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "changeSpotPrice",
      "inputs": [
        { "name": "newSpotPrice", "type": "uint128", "internalType": "uint128" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "delta",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint128", "internalType": "uint128" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "factory",
      "inputs": [],
      "outputs": [
        {
          "name": "_factory",
          "type": "address",
          "internalType": "contract ILSSVMPairFactoryLike"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "fee",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint96", "internalType": "uint96" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAllIds",
      "inputs": [],
      "outputs": [
        { "name": "ids", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAssetRecipient",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "address payable" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getBuyNFTQuote",
      "inputs": [
        { "name": "assetId", "type": "uint256", "internalType": "uint256" },
        { "name": "numNFTs", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "error",
          "type": "uint8",
          "internalType": "enum CurveErrorCodes.Error"
        },
        {
          "name": "newSpotPrice",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "newDelta", "type": "uint256", "internalType": "uint256" },
        { "name": "inputAmount", "type": "uint256", "internalType": "uint256" },
        { "name": "protocolFee", "type": "uint256", "internalType": "uint256" },
        {
          "name": "royaltyAmount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getFeeRecipient",
      "inputs": [],
      "outputs": [
        {
          "name": "_feeRecipient",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getIds",
      "inputs": [
        { "name": "start", "type": "uint256", "internalType": "uint256" },
        { "name": "end", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "ids", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getSellNFTQuote",
      "inputs": [
        { "name": "assetId", "type": "uint256", "internalType": "uint256" },
        { "name": "numNFTs", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "error",
          "type": "uint8",
          "internalType": "enum CurveErrorCodes.Error"
        },
        {
          "name": "newSpotPrice",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "newDelta", "type": "uint256", "internalType": "uint256" },
        {
          "name": "outputAmount",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "protocolFee", "type": "uint256", "internalType": "uint256" },
        {
          "name": "royaltyAmount",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasId",
      "inputs": [
        { "name": "id", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hook",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "contract IPairHooks" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initialize",
      "inputs": [
        { "name": "_owner", "type": "address", "internalType": "address" },
        {
          "name": "_assetRecipient",
          "type": "address",
          "internalType": "address payable"
        },
        { "name": "_delta", "type": "uint128", "internalType": "uint128" },
        { "name": "_fee", "type": "uint96", "internalType": "uint96" },
        { "name": "_spotPrice", "type": "uint128", "internalType": "uint128" },
        {
          "name": "_hookAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_referralAddress",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "multicall",
      "inputs": [
        { "name": "calls", "type": "bytes[]", "internalType": "bytes[]" },
        { "name": "revertOnFail", "type": "bool", "internalType": "bool" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "nft",
      "inputs": [],
      "outputs": [
        { "name": "_nft", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "numIdsHeld",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "onERC1155BatchReceived",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "uint256[]", "internalType": "uint256[]" },
        { "name": "", "type": "uint256[]", "internalType": "uint256[]" },
        { "name": "", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [{ "name": "", "type": "bytes4", "internalType": "bytes4" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "onERC1155Received",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [{ "name": "", "type": "bytes4", "internalType": "bytes4" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "onERC721Received",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [{ "name": "", "type": "bytes4", "internalType": "bytes4" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pairVariant",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "uint8",
          "internalType": "enum ILSSVMPairFactoryLike.PairVariant"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "poolType",
      "inputs": [],
      "outputs": [
        {
          "name": "_poolType",
          "type": "uint8",
          "internalType": "enum LSSVMPair.PoolType"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "propertyChecker",
      "inputs": [],
      "outputs": [
        {
          "name": "_propertyChecker",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "referralAddress",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "spotPrice",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint128", "internalType": "uint128" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "supportsInterface",
      "inputs": [
        { "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "swapNFTsForToken",
      "inputs": [
        { "name": "nftIds", "type": "uint256[]", "internalType": "uint256[]" },
        {
          "name": "minExpectedTokenOutput",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "tokenRecipient",
          "type": "address",
          "internalType": "address payable"
        },
        { "name": "isRouter", "type": "bool", "internalType": "bool" },
        {
          "name": "routerCaller",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "propertyCheckerParams",
          "type": "bytes",
          "internalType": "bytes"
        }
      ],
      "outputs": [
        { "name": "outputAmount", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapNFTsForToken",
      "inputs": [
        { "name": "nftIds", "type": "uint256[]", "internalType": "uint256[]" },
        {
          "name": "minExpectedTokenOutput",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "tokenRecipient",
          "type": "address",
          "internalType": "address payable"
        },
        { "name": "isRouter", "type": "bool", "internalType": "bool" },
        { "name": "routerCaller", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "outputAmount", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "swapTokenForSpecificNFTs",
      "inputs": [
        { "name": "nftIds", "type": "uint256[]", "internalType": "uint256[]" },
        {
          "name": "maxExpectedTokenInput",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "nftRecipient",
          "type": "address",
          "internalType": "address"
        },
        { "name": "isRouter", "type": "bool", "internalType": "bool" },
        { "name": "routerCaller", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "syncNFTIds",
      "inputs": [
        { "name": "ids", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" },
        { "name": "data", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "withdrawERC1155",
      "inputs": [
        { "name": "a", "type": "address", "internalType": "contract IERC1155" },
        { "name": "ids", "type": "uint256[]", "internalType": "uint256[]" },
        { "name": "amounts", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawERC20",
      "inputs": [
        { "name": "a", "type": "address", "internalType": "contract ERC20" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawERC721",
      "inputs": [
        { "name": "a", "type": "address", "internalType": "contract IERC721" },
        { "name": "nftIds", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "DeltaUpdate",
      "inputs": [
        {
          "name": "newDelta",
          "type": "uint128",
          "indexed": false,
          "internalType": "uint128"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "FeeUpdate",
      "inputs": [
        {
          "name": "newFee",
          "type": "uint96",
          "indexed": false,
          "internalType": "uint96"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NFTWithdrawal",
      "inputs": [
        {
          "name": "ids",
          "type": "uint256[]",
          "indexed": false,
          "internalType": "uint256[]"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NFTWithdrawal",
      "inputs": [
        {
          "name": "numNFTs",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SpotPriceUpdate",
      "inputs": [
        {
          "name": "newSpotPrice",
          "type": "uint128",
          "indexed": false,
          "internalType": "uint128"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SwapNFTInPair",
      "inputs": [
        {
          "name": "amountOut",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "ids",
          "type": "uint256[]",
          "indexed": false,
          "internalType": "uint256[]"
        },
        {
          "name": "royaltyAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SwapNFTInPair",
      "inputs": [
        {
          "name": "amountOut",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "numNFTs",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "royaltyAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SwapNFTOutPair",
      "inputs": [
        {
          "name": "amountIn",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "ids",
          "type": "uint256[]",
          "indexed": false,
          "internalType": "uint256[]"
        },
        {
          "name": "royaltyAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SwapNFTOutPair",
      "inputs": [
        {
          "name": "amountIn",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "numNFTs",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "royaltyAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "TokenDeposit",
      "inputs": [
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "TokenWithdrawal",
      "inputs": [
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "LSSVMPairERC721__NeedPropertyChecking",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LSSVMPairERC721__PropertyCheckFailed",
      "inputs": []
    },
    { "type": "error", "name": "LSSVMPair__AlreadyInitialized", "inputs": [] },
    {
      "type": "error",
      "name": "LSSVMPair__BondingCurveError",
      "inputs": [
        {
          "name": "error",
          "type": "uint8",
          "internalType": "enum CurveErrorCodes.Error"
        }
      ]
    },
    {
      "type": "error",
      "name": "LSSVMPair__DemandedInputTooLarge",
      "inputs": []
    },
    { "type": "error", "name": "LSSVMPair__FunctionNotAllowed", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__InvalidDelta", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__InvalidSpotPrice", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__NftNotTransferred", "inputs": [] },
    {
      "type": "error",
      "name": "LSSVMPair__NonTradePoolWithTradeFee",
      "inputs": []
    },
    { "type": "error", "name": "LSSVMPair__NotRouter", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__OutputTooSmall", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__RoyaltyTooLarge", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__TargetNotAllowed", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__TradeFeeTooLarge", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__WrongPoolType", "inputs": [] },
    { "type": "error", "name": "LSSVMPair__ZeroSwapAmount", "inputs": [] },
    { "type": "error", "name": "Ownable_NewOwnerZeroAddress", "inputs": [] },
    { "type": "error", "name": "Ownable_NotOwner", "inputs": [] }
  ] as const;
