# Algorand Auto ARC19 Minter

This project is maintained by [Beepboy](https://twitter.com/beepboy_).

On this project, you will find an example for minting automatically a small collection of 6 NFTs using ARC19 on the Algorand blockchain.

# Getting started

1. Install packages with `yarn` command.
2. Create a file `local.cjs` inside the folder `config` with all the configuration parameters. You will find a template on `/config/local-example.cjs`.
3. Add all the initial NFT images on the folder `/images/Level 1/`. The name of the image have to be the number of the NFT on the collection and the file extension.
4. Update the call function `startMint(supply: number)` at the end of the `/src/index.ts` file with the correct supply of your collection.
5. Use the command `yarn start` to start minting the ARC19 NFTs.

> You can use the function `configArc19(assetID, cid, reserveAddress)` from `/src/index.ts` to update the minted NFTs.

> If you are using Purestake API, you will need to change the token value on file `/src/lib/algorand/index.ts`
