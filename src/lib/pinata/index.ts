import pinataSDK, { PinataPinOptions } from '@pinata/sdk';
import config from 'config';
import algosdk from 'algosdk';
import { CID } from 'multiformats/cid';
import fs from 'fs';

const apiKey: string = config.get('pinata.apiKey');
const apiSecret: string = config.get('pinata.apiSecret');
const pinataClient = pinataSDK(apiKey, apiSecret);

export const cidToReserveURL = (cid: string) => {
  const decoded = CID.parse(cid);
  const { version } = decoded;
  const url = `template-ipfs://{ipfscid:${version}:dag-pb:reserve:sha2-256}`;
  const reserveAddress = algosdk.encodeAddress(
    Uint8Array.from(Buffer.from(decoded.multihash.digest))
  );
  return {
    url,
    reserveAddress,
  };
};

export const pinFile = async (filePath: string) => {
  const file = fs.createReadStream(filePath);
  const options: PinataPinOptions = {
    pinataMetadata: {
      name: 'Test',
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  const resultFile = await pinataClient.pinFileToIPFS(file, options);
  console.log(
    'SC1: The NFT original digital asset pinned to IPFS via Pinata: ',
    resultFile
  );
  return resultFile;
};
