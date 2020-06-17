const Mcrypto = require('@arcblock/mcrypto');
const ForgeSDK = require('@arcblock/forge-sdk');
const MongoStorage = require('@arcblock/did-auth-storage-mongo');
const SwapMongoStorage = require('@arcblock/swap-storage-mongo');
const { fromSecretKey, WalletType } = require('@arcblock/forge-wallet');
const { WalletAuthenticator, WalletHandlers, SwapHandlers } = require('@arcblock/did-auth');
const env = require('./env');

const netlifyPrefix = '/.netlify/functions/app';
const isNetlify = process.env.NETLIFY && JSON.parse(process.env.NETLIFY);

const type = WalletType({
  role: Mcrypto.types.RoleType.ROLE_APPLICATION,
  pk: Mcrypto.types.KeyType.ED25519,
  hash: Mcrypto.types.HashType.SHA3,
});

if (env.chainHost) {
  ForgeSDK.connect(env.chainHost, {
    chainId: env.chainId,
    name: env.chainId,
    default: true,
  });
  if (env.assetChainHost) {
    ForgeSDK.connect(env.assetChainHost, {
      chainId: env.assetChainId,
      name: env.assetChainId,
    });
  }
}

const wallet = fromSecretKey(process.env.BLOCKLET_APP_SK || process.env.APP_SK, type);
const walletJSON = wallet.toJSON();

const walletAuth = new WalletAuthenticator({
  wallet: walletJSON,
  baseUrl: isNetlify ? env.baseUrl.replace(netlifyPrefix, '') : env.baseUrl,
  appInfo: {
    name: env.appName,
    description: env.appDescription,
    icon: 'https://arcblock.oss-cn-beijing.aliyuncs.com/images/wallet-round.png',
    link: isNetlify ? env.baseUrl.replace(netlifyPrefix, '') : env.baseUrl.replace(process.env.PORT || '3030', '3000'),
  },
  chainInfo: {
    host: env.chainHost,
    id: env.chainId,
  },
});

const tokenStorage = new MongoStorage({ url: process.env.MONGO_URI });
const swapStorage = new SwapMongoStorage({ url: process.env.MONGO_URI });

const walletHandlers = new WalletHandlers({
  authenticator: walletAuth,
  tokenGenerator: () => Date.now().toString(),
  tokenStorage,
});


const swapHandlers = new SwapHandlers({
  authenticator: walletAuth,
  tokenStorage,
  swapStorage,
  swapContext: {
    offerChainId: env.chainId,
    offerChainHost: env.chainHost,
    demandChainId: env.assetChainId,
    demandChainHost: env.assetChainHost,
  },
  options: {
    swapKey: 'tid',
  },
});

module.exports = {
  authenticator: walletAuth,
  handlers: walletHandlers,
  swapHandlers,
  swapStorage,
  wallet,
};
