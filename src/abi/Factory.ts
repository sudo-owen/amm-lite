export const FactoryABI = [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_erc721ETHTemplate",
          "type": "address",
          "internalType": "contract LSSVMPairERC721ETH"
        },
        {
          "name": "_erc721ERC20Template",
          "type": "address",
          "internalType": "contract LSSVMPairERC721ERC20"
        },
        {
          "name": "_erc1155ETHTemplate",
          "type": "address",
          "internalType": "contract LSSVMPairERC1155ETH"
        },
        {
          "name": "_erc1155ERC20Template",
          "type": "address",
          "internalType": "contract LSSVMPairERC1155ERC20"
        },
        {
          "name": "_protocolFeeRecipient",
          "type": "address",
          "internalType": "address payable"
        },
        {
          "name": "_protocolFeeMultiplier",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "_owner", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "nonpayable"
    },
    { "type": "receive", "stateMutability": "payable" },
    {
      "type": "function",
      "name": "addProtocolFeeRecipientReferral",
      "inputs": [
        {
          "name": "referrerAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "recipientAddress",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "authAllowedForToken",
      "inputs": [
        {
          "name": "tokenAddress",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "proposedAuthAddress",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "bondingCurveAllowed",
      "inputs": [
        { "name": "", "type": "address", "internalType": "contract ICurve" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "changeDefaultProtocolFeeRecipient",
      "inputs": [
        {
          "name": "_defaultProtocolFeeRecipient",
          "type": "address",
          "internalType": "address payable"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "changeProtocolFeeMultiplier",
      "inputs": [
        {
          "name": "_protocolFeeMultiplier",
          "type": "uint256",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "closeLock",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createPairERC1155ERC20",
      "inputs": [
        {
          "name": "params",
          "type": "tuple",
          "internalType": "struct LSSVMPairFactory.CreateERC1155ERC20PairParams",
          "components": [
            {
              "name": "token",
              "type": "address",
              "internalType": "contract ERC20"
            },
            {
              "name": "nft",
              "type": "address",
              "internalType": "contract IERC1155"
            },
            {
              "name": "bondingCurve",
              "type": "address",
              "internalType": "contract ICurve"
            },
            {
              "name": "assetRecipient",
              "type": "address",
              "internalType": "address payable"
            },
            {
              "name": "poolType",
              "type": "uint8",
              "internalType": "enum LSSVMPair.PoolType"
            },
            { "name": "delta", "type": "uint128", "internalType": "uint128" },
            { "name": "fee", "type": "uint96", "internalType": "uint96" },
            {
              "name": "spotPrice",
              "type": "uint128",
              "internalType": "uint128"
            },
            { "name": "nftId", "type": "uint256", "internalType": "uint256" },
            {
              "name": "initialNFTBalance",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "initialTokenBalance",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "hookAddress",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "referralAddress",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "pair",
          "type": "address",
          "internalType": "contract LSSVMPairERC1155ERC20"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createPairERC1155ETH",
      "inputs": [
        {
          "name": "_nft",
          "type": "address",
          "internalType": "contract IERC1155"
        },
        {
          "name": "_bondingCurve",
          "type": "address",
          "internalType": "contract ICurve"
        },
        {
          "name": "_assetRecipient",
          "type": "address",
          "internalType": "address payable"
        },
        {
          "name": "_poolType",
          "type": "uint8",
          "internalType": "enum LSSVMPair.PoolType"
        },
        { "name": "_delta", "type": "uint128", "internalType": "uint128" },
        { "name": "_fee", "type": "uint96", "internalType": "uint96" },
        { "name": "_spotPrice", "type": "uint128", "internalType": "uint128" },
        { "name": "_nftId", "type": "uint256", "internalType": "uint256" },
        {
          "name": "_initialNFTBalance",
          "type": "uint256",
          "internalType": "uint256"
        },
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
      "outputs": [
        {
          "name": "pair",
          "type": "address",
          "internalType": "contract LSSVMPairERC1155ETH"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "createPairERC721ERC20",
      "inputs": [
        {
          "name": "params",
          "type": "tuple",
          "internalType": "struct LSSVMPairFactory.CreateERC721ERC20PairParams",
          "components": [
            {
              "name": "token",
              "type": "address",
              "internalType": "contract ERC20"
            },
            {
              "name": "nft",
              "type": "address",
              "internalType": "contract IERC721"
            },
            {
              "name": "bondingCurve",
              "type": "address",
              "internalType": "contract ICurve"
            },
            {
              "name": "assetRecipient",
              "type": "address",
              "internalType": "address payable"
            },
            {
              "name": "poolType",
              "type": "uint8",
              "internalType": "enum LSSVMPair.PoolType"
            },
            { "name": "delta", "type": "uint128", "internalType": "uint128" },
            { "name": "fee", "type": "uint96", "internalType": "uint96" },
            {
              "name": "spotPrice",
              "type": "uint128",
              "internalType": "uint128"
            },
            {
              "name": "propertyChecker",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "initialNFTIDs",
              "type": "uint256[]",
              "internalType": "uint256[]"
            },
            {
              "name": "initialTokenBalance",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "hookAddress",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "referralAddress",
              "type": "address",
              "internalType": "address"
            }
          ]
        }
      ],
      "outputs": [
        {
          "name": "pair",
          "type": "address",
          "internalType": "contract LSSVMPairERC721ERC20"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createPairERC721ETH",
      "inputs": [
        {
          "name": "_nft",
          "type": "address",
          "internalType": "contract IERC721"
        },
        {
          "name": "_bondingCurve",
          "type": "address",
          "internalType": "contract ICurve"
        },
        {
          "name": "_assetRecipient",
          "type": "address",
          "internalType": "address payable"
        },
        {
          "name": "_poolType",
          "type": "uint8",
          "internalType": "enum LSSVMPair.PoolType"
        },
        { "name": "_delta", "type": "uint128", "internalType": "uint128" },
        { "name": "_fee", "type": "uint96", "internalType": "uint96" },
        { "name": "_spotPrice", "type": "uint128", "internalType": "uint128" },
        {
          "name": "_propertyChecker",
          "type": "address",
          "internalType": "address"
        },
        {
          "name": "_initialNFTIDs",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
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
      "outputs": [
        {
          "name": "pair",
          "type": "address",
          "internalType": "contract LSSVMPairERC721ETH"
        }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "defaultProtocolFeeRecipient",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "address", "internalType": "address payable" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "depositERC1155",
      "inputs": [
        {
          "name": "nft",
          "type": "address",
          "internalType": "contract IERC1155"
        },
        { "name": "id", "type": "uint256", "internalType": "uint256" },
        { "name": "recipient", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "depositERC20",
      "inputs": [
        {
          "name": "token",
          "type": "address",
          "internalType": "contract ERC20"
        },
        { "name": "recipient", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "depositNFTs",
      "inputs": [
        {
          "name": "_nft",
          "type": "address",
          "internalType": "contract IERC721"
        },
        { "name": "ids", "type": "uint256[]", "internalType": "uint256[]" },
        { "name": "recipient", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "disableSettingsForPair",
      "inputs": [
        { "name": "settings", "type": "address", "internalType": "address" },
        { "name": "pairAddress", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "enableSettingsForPair",
      "inputs": [
        { "name": "settings", "type": "address", "internalType": "address" },
        { "name": "pairAddress", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "erc1155ERC20Template",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract LSSVMPairERC1155ERC20"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "erc1155ETHTemplate",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract LSSVMPairERC1155ETH"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "erc721ERC20Template",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract LSSVMPairERC721ERC20"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "erc721ETHTemplate",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract LSSVMPairERC721ETH"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPairNFTType",
      "inputs": [
        { "name": "pairAddress", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint8",
          "internalType": "enum ILSSVMPairFactoryLike.PairNFTType"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getPairTokenType",
      "inputs": [
        { "name": "pairAddress", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint8",
          "internalType": "enum ILSSVMPairFactoryLike.PairTokenType"
        }
      ],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "getProtocolFeeRecipient",
      "inputs": [
        {
          "name": "referrerAddress",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        { "name": "", "type": "address", "internalType": "address payable" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getSettingsForPair",
      "inputs": [
        { "name": "pairAddress", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "settingsEnabled", "type": "bool", "internalType": "bool" },
        { "name": "bps", "type": "uint96", "internalType": "uint96" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isValidPair",
      "inputs": [
        { "name": "pairAddress", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "openLock",
      "inputs": [],
      "outputs": [],
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
      "name": "protocolFeeMultiplier",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "protocolFeeRecipientReferral",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [
        { "name": "", "type": "address", "internalType": "address payable" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "routerStatus",
      "inputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "contract LSSVMRouter"
        }
      ],
      "outputs": [
        { "name": "allowed", "type": "bool", "internalType": "bool" },
        { "name": "wasEverTouched", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "setBondingCurveAllowed",
      "inputs": [
        {
          "name": "bondingCurve",
          "type": "address",
          "internalType": "contract ICurve"
        },
        { "name": "isAllowed", "type": "bool", "internalType": "bool" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "setRouterAllowed",
      "inputs": [
        {
          "name": "_router",
          "type": "address",
          "internalType": "contract LSSVMRouter"
        },
        { "name": "isAllowed", "type": "bool", "internalType": "bool" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "settingsForCollection",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "settingsForPair",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "toggleSettingsForCollection",
      "inputs": [
        { "name": "settings", "type": "address", "internalType": "address" },
        {
          "name": "collectionAddress",
          "type": "address",
          "internalType": "address"
        },
        { "name": "enable", "type": "bool", "internalType": "bool" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawERC20ProtocolFees",
      "inputs": [
        {
          "name": "token",
          "type": "address",
          "internalType": "contract ERC20"
        },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawETHProtocolFees",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "BondingCurveStatusUpdate",
      "inputs": [
        {
          "name": "bondingCurve",
          "type": "address",
          "indexed": true,
          "internalType": "contract ICurve"
        },
        {
          "name": "isAllowed",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "CallTargetStatusUpdate",
      "inputs": [
        {
          "name": "target",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "isAllowed",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "DefaultProtocolFeeRecipientUpdate",
      "inputs": [
        {
          "name": "recipientAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ERC1155Deposit",
      "inputs": [
        {
          "name": "poolAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "id",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
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
      "name": "ERC20Deposit",
      "inputs": [
        {
          "name": "poolAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
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
      "name": "NFTDeposit",
      "inputs": [
        {
          "name": "poolAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
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
      "name": "NewERC1155Pair",
      "inputs": [
        {
          "name": "poolAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "initialBalance",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NewERC721Pair",
      "inputs": [
        {
          "name": "poolAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "initialIds",
          "type": "uint256[]",
          "indexed": false,
          "internalType": "uint256[]"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
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
      "name": "ProtocolFeeMultiplierUpdate",
      "inputs": [
        {
          "name": "newMultiplier",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ProtocolFeeRecipientReferralAdded",
      "inputs": [
        {
          "name": "referrerAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "recipientAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "RouterStatusUpdate",
      "inputs": [
        {
          "name": "router",
          "type": "address",
          "indexed": true,
          "internalType": "contract LSSVMRouter"
        },
        {
          "name": "isAllowed",
          "type": "bool",
          "indexed": false,
          "internalType": "bool"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "LSSVMPairFactory__BondingCurveNotWhitelisted",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LSSVMPairFactory__CannotCallRouter",
      "inputs": []
    },
    { "type": "error", "name": "LSSVMPairFactory__FeeTooLarge", "inputs": [] },
    { "type": "error", "name": "LSSVMPairFactory__InvalidPair", "inputs": [] },
    {
      "type": "error",
      "name": "LSSVMPairFactory__ReentrantCall",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LSSVMPairFactory__SettingsNotEnabledForCollection",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LSSVMPairFactory__SettingsNotEnabledForPair",
      "inputs": []
    },
    {
      "type": "error",
      "name": "LSSVMPairFactory__UnauthorizedCaller",
      "inputs": []
    },
    { "type": "error", "name": "LSSVMPairFactory__ZeroAddress", "inputs": [] }
  ] as const;