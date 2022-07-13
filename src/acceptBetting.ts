// Player 2 accept the betting, the game can now start
import { transferSolana } from "./transferSol";
import { PublicKey, Connection } from "@solana/web3.js";
import {addressChestPubKey} from "./constants";


/**
 * Function used to accept the betting by the player two.
 * 
 * @param connection 
 * @param wallet 
 * @param signTransaction 
 * @param gameWebsiteHost 
 * @param gameId 
 * @param playerTwoUsername 
 * @param playerTwoPublicKeyString 
 */
export async function acceptBettingFunction(connection: Connection, wallet: any, signTransaction: any, gameWebsiteHost: string, gameId: string, playerTwoUsername: string, playerTwoPublicKeyString: string) {
    try {
        // @ts-ignore
        const receiverPublicKey = new PublicKey(addressChestPubKey);

        const signature = await transferSolana({ connection, receiverPublicKey, wallet, signTransaction });

        console.log('Player 2 has accepted the bet', signature);

        // @ts-ignore
        const bodyRequestAccept: BodyRequestAcceptWager = {game_website_host: gameWebsiteHost, game_id: gameId,
            player_two_id: playerTwoUsername, player_two_public_key: playerTwoPublicKeyString,
            signature_transaction_two: signature
       }

        // Accept the bet and request the API
        return fetch('/api/accept-wager', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyRequestAccept)
        })
            .then(response => response.json())
            .then(data => {
                console.log('data', data);
                console.log('Player two transaction has been stored in the database.');
                return data;
            })
            .catch(error => {
                console.log('error', error);
                return error;
            });

    } catch (e) {
        console.error(e);
        return e;
    }
}