// File used for the models of Body Request ot the backend


/**
 * The object sent when initiating the game request.
 */
export interface BodyRequestInitWager {
    game_website_host: string;
    game_id: string;
    player_one_id: string;
    player_one_public_key: string;
    blockchain_type: string;
    amount_bet: string;
    signature_transaction_one: string;
}


/**
 * The object sent when accepting the game betting.
 */
export interface BodyRequestAcceptWager {
    game_website_host: string;
    game_id: string;
    player_two_id: string;
    player_two_public_key: string;
    signature_transaction_two: string;
    blockchain_type: string;
    amount_bet: string;
}


export interface BodyRequestStatusGame {
    game_website_host: string;
    game_id: string;
}


export interface BodyRequestFinishGame {
    game_website_host: string;
    game_id: string;
    winner: string;
    winner_pub_key: string;
    is_equality: boolean;
} 
