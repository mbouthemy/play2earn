// Finish the game and send the winner to the backend

import { BodyRequestFinishGame } from "./BodyRequest";


/**
 * Finish the game and send the transaction to the backend.
 * 
 * @param gameWebsiteHost 
 * @param gameID 
 * @param winnerUsername 
 * @param winnerPublickKey 
 * @param isEquality 
 */
export function finishGameAndGetMoneyWebThree(gameWebsiteHost: string, gameID: string, winnerUsername: string, winnerPublickKey: string, isEquality: boolean) {

    const bodyRequestFinishGame: BodyRequestFinishGame = {
        // @ts-ignore
        game_website_host: gameWebsiteHost, game_id: gameID, winner: winnerUsername, winner_pub_key: winnerPublickKey,
        is_equality: isEquality
    }
    console.log('Finishing the game', bodyRequestFinishGame);
    return fetch('/api/finish-game', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyRequestFinishGame)
    })
    .then(response => response.json())
    .then(data => {
        console.log('signature', data);
        return data;
    })
    .catch(error => {
        console.log('error', error);
        return 'error occured';
    });
}

// TODO: Check the case where the result is an error which is returned
