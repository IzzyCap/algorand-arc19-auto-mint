import algosdk from 'algosdk';
import config from 'config';

// Uncomment this if using Purestake
/*
const token = {
  'x-api-key': config.get('algorand.token') as string,
};
*/
// Comment next line if using Purestake
const token = config.get('algorand.token') as string;

const port = config.get('algorand.port') as string;
const server = config.get('algorand.server') as string;
export const algodClient: algosdk.Algodv2 = new algosdk.Algodv2(
  token,
  server,
  port
);

export const getAccount = async () => {
  try {
    const myaccount = algosdk.mnemonicToSecretKey(
      config.get('wallet.mnemonic') || ''
    );
    return myaccount;
  } catch (err) {
    console.log('err', err);
  }

  return null;
};

export const getAccountInfo = async (address: string) => {
  const clientInfo = await algodClient.accountInformation(address).do();
  return clientInfo;
};

export const getAsset = async (assetID: number) => {
  const asset = await algodClient.getAssetByID(assetID).do();
  return asset;
};
