import algosdk from 'algosdk';
import config from 'config';
import { TextEncoder } from 'util';
import { algodClient, getAccount, getAsset } from './lib/algorand';
import { cidToReserveURL, pinFile } from './lib/pinata';

// Create Asset with ARC19
// eslint-disable-next-line no-unused-vars
async function createArc19(
  i: number,
  cid: string,
  url: string,
  reserveAddress: string
) {
  try {
    const account = await getAccount();

    if (!account) {
      console.log('Account not found');
      return false;
    }

    // Construct the transaction
    const params = await algodClient.getTransactionParams().do();
    // comment out the next two lines to use suggested fee
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    const enc = new TextEncoder();

    const note = {
      name: config.get('collection.name') + i.toString(),
      description: '',
      image: `ipfs://${cid}`,
      decimals: 0,
      unitName: config.get('collection.unitName') + i.toString(),
      image_integrity: '',
      image_mimetype: config.get('collection.image_mimetype'),
      properties: {}, // Here you can add traits info for rarity!
    };

    console.log(note);

    const encNote: Uint8Array = enc.encode(JSON.stringify(note));

    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: config.get('wallet.addr'),
      total: 1,
      decimals: 0,
      assetName: config.get('collection.name') + i.toString(),
      unitName: config.get('collection.unitName') + i.toString(),
      assetURL: url,
      assetMetadataHash: '',
      defaultFrozen: false,
      freeze: config.get('wallet.addr'),
      manager: config.get('wallet.addr'),
      clawback: config.get('wallet.addr'),
      reserve: reserveAddress,
      note: encNote,
      suggestedParams: params,
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(account.sk);
    const txId = txn.txID().toString();

    // Submit the transaction
    await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txId,
      4
    );
    // Get the completed Transaction
    console.log(
      `Transaction ${txId} confirmed in round ${confirmedTxn['confirmed-round']}\n`
    );

    return true;
  } catch (error) {
    console.log('Error');
    return false;
  }
}

// eslint-disable-next-line no-unused-vars
async function configArc19(
  assetID: number,
  cid: string,
  reserveAddress: string
) {
  try {
    console.log(`Updating ARC19 to ${assetID}`);
    const account = await getAccount();

    if (!account) {
      console.log('Account not found');
      return false;
    }

    const asset = await getAsset(assetID);

    const note = {
      name: asset.name,
      description: '',
      image: `ipfs://${cid}`,
      decimals: asset.decimals,
      unitName: asset['unit-name'],
      image_integrity: '',
      image_mimetype: config.get('collection.image_mimetype'),
      properties: {}, // Here you can add traits info for rarity!
    };

    const enc = new TextEncoder();
    const encNote: Uint8Array = enc.encode(JSON.stringify(note));

    const params = await algodClient.getTransactionParams().do();
    params.fee = 1000;
    params.flatFee = true;

    // Note that the change has to come from the existing manager
    const txn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
      from: config.get('wallet.addr'),
      note: encNote,
      suggestedParams: params,
      assetIndex: assetID,
      freeze: config.get('wallet.addr'),
      manager: config.get('wallet.addr'),
      clawback: config.get('wallet.addr'),
      reserve: reserveAddress,
      strictEmptyAddressChecking: false,
    });

    // Sign the transaction
    const signedTxn = txn.signTxn(account.sk);
    const txId = txn.txID().toString();

    // Submit the transaction
    await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txId,
      4
    );
    // Get the completed Transaction
    console.log(
      `Transaction ${txId} confirmed in round ${confirmedTxn['confirmed-round']}\n`
    );

    return true;
  } catch (error) {
    console.log('Error');
    return false;
  }
}

async function startMint(supply: number) {
  for (let i = 1; i <= supply; i++) {
    console.log(`Start ${config.get('collection.name') + i.toString()} mint`);
    // Add image on https://www.pinata.cloud/
    const resultFile = await pinFile(`./images/Level 1/${i}.png`);

    // Generate url and reserveAddress from image
    const { url, reserveAddress } = cidToReserveURL(resultFile.IpfsHash);
    await createArc19(i, resultFile.IpfsHash, url, reserveAddress);

    console.log(`End ${config.get('collection.name') + i.toString()} mint\n`);
  }
}

(async () => {
  // The number represents the supply of the collection
  startMint(6);

  // Uncomment this to update the image from a minted NFT
  // // Add image on https://www.pinata.cloud/
  // const resultFile = await pinFile(`./images/Level 2/1.png`);
  // const { reserveAddress } = cidToReserveURL(resultFile.IpfsHash);

  // configArc19(831712015, resultFile.IpfsHash, reserveAddress);
})().catch(e => {
  console.log(e);
});
