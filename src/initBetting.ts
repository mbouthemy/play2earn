// Function used to initiate the betting

import { transferSolana } from "./transferSol";
import {addressChestPubKey} from "./constants";
import { PublicKey, Connection } from "@solana/web3.js";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";


/**
 * Function to initiate the betting of the game by the player one. Returns a promise with the results.
 * 
 * @param connection 
 * @param wallet 
 * @param signTransaction 
 * @param gameWebsiteHost 
 * @param gameID
 * @param playerOneUsername 
 * @param playerOnePublicKeyString 
 * @param blockchainType 
 * @param amountBet 
 */
export async function initiateBetting(connection: Connection, wallet: any, signTransaction: SignerWalletAdapterProps["signTransaction"],

    gameWebsiteHost: string, gameID: string, playerOneUsername: string, playerOnePublicKeyString: string, blockchainType: string, amountBet: string) {
    try {
        // @ts-ignore
        const receiverPublicKey = new PublicKey(addressChestPubKey);

        const signature = await transferSolana({ connection, receiverPublicKey, wallet, signTransaction });

        console.log('Player 1 has bet the money', signature);

        // @ts-ignore
        const bodyRequest: BodyRequestInitWager = {
            "game_website_host": gameWebsiteHost, "game_id": gameID,
            "player_one_id": playerOneUsername, "player_one_public_key": playerOnePublicKeyString, "blockchain_type": blockchainType, "amount_bet": amountBet,
            signature_transaction_one: signature
        }


        return fetch('/api/init-wager', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyRequest)
        })
            .then(response => response.json())
            .then(data => {
                console.log('data', data);
                console.log('The transaction has been stored in the backend.');
                return data;
            })
            .catch(error => {
                console.log('Error', error);
                return error;
            });

    } catch (e) {
        console.error(e);
        // toast.error((e as Error).message);
    }

}