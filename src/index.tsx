import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import {
    Connection,
    LAMPORTS_PER_SOL,
    SystemProgram,
    PublicKey,
    Transaction,
    TransactionCtorFields
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { FidgetSpinner } from  'react-loader-spinner'


export const addressChestPubKey: string = 'CmVo1zBHvB8BDbZwnTnDqt4iLmmMuPrKgd5fYXJNMbyk';



interface IProps {
    gameWebsiteHost: string;
    gameID: string;
    playerUID: string;
    gameType: string;
    numberMultiplayers?: number;
    handleGameStarting: any;
    blockchainType?: string;
    network?: string;
    amountBet?: number;
    secondsBeforeCancellation?: number;
}


/**
 * Enum for the status of the Game API.
 */
export enum gameAPIStatusEnum {
    PlayerOneHasBet = 'player_one_has_bet'
}


/**
 * Enum for the blockchain type.
 */
export enum blockchainTypeEnum {
    Solana = 'solana'
}

/**
 * Enum for the network type.
 */
export enum networkTypeEnum {
    Devnet = 'devnet',
    Mainnet = 'mainnet'
}


/**
 * Enum for the game type.
 */
export enum gameTypeEnum {
    Solo = 'solo',
    Multiplayer = 'multiplayer'
}




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
    game_type: gameTypeEnum;
    network: networkTypeEnum;
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
export async function acceptBetting(connection: Connection, wallet: any, signTransaction: any, gameWebsiteHost: string, gameId: string, playerTwoUsername: string, playerTwoPublicKeyString: string,
    amountBet: number, blockchainType: string) {
    try {
        // @ts-ignore
        const receiverPublicKey = new PublicKey(addressChestPubKey);

        const amountSol = amountBet;  // In Sol
        const signature = await transferSolana({ connection, receiverPublicKey, wallet, signTransaction, amountSol });

        console.log('Player 2 has accepted the bet', signature);

        const bodyRequestAccept: BodyRequestAcceptWager = {
            game_website_host: gameWebsiteHost, 
            game_id: gameId,
            player_two_id: playerTwoUsername, 
            player_two_public_key: playerTwoPublicKeyString,
            signature_transaction_two: signature,
            blockchain_type: blockchainType,
            amount_bet: String(amountBet)
        
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
        game_website_host: gameWebsiteHost,
        game_id: gameID,
        winner: winnerUsername,
        winner_pub_key: winnerPublickKey,
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
 * @param gameType: string, Solo or multiplayer game 
 * @param blockchainType 
 * @param amountBet 
 */
export async function initiateBetting(connection: Connection, wallet: any, signTransaction: SignerWalletAdapterProps["signTransaction"],

    gameWebsiteHost: string, gameID: string, playerOneUsername: string, playerOnePublicKeyString: string, gameType: string, blockchainType: string, network: string, amountBet: number) {
    try {
        // @ts-ignore
        const receiverPublicKey = new PublicKey(addressChestPubKey);

        const amountSol = amountBet;
        const signature = await transferSolana({ connection, receiverPublicKey, wallet, signTransaction, amountSol });

        console.log('Player 1 has bet the money', signature);

        // TODO: Pass the enum to the modal (check to see how is it possible)

        const bodyRequest: BodyRequestInitWager = {
            "game_website_host": gameWebsiteHost, 
            "game_id": gameID,
            "player_one_id": playerOneUsername,
            "player_one_public_key": playerOnePublicKeyString,
            "blockchain_type": blockchainType,
            "amount_bet": String(amountBet),
            "signature_transaction_one": signature,
            "game_type": gameType === 'solo' ? gameTypeEnum.Solo : gameTypeEnum.Solo,
            "network": network === 'devnet' ? networkTypeEnum.Devnet : networkTypeEnum.Mainnet,
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
        toast.error(e);
    }
}



export async function generateTransaction({
    connection,
    feePayer,
}: {
    connection: Connection;
    feePayer: PublicKey;
}): Promise<Transaction> {
    const recentBlockhash = await connection.getRecentBlockhash();
    const options: TransactionCtorFields = {
        feePayer,
        recentBlockhash: recentBlockhash.blockhash,
    };
    const transaction = new Transaction(options);
    return transaction;
}

export async function signAndSendTransaction(
    connection: Connection,
    signTransaction: SignerWalletAdapterProps["signTransaction"],
    transaction: Transaction
): Promise<string> {
    const signedTrans = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
        signedTrans.serialize()
    );
    return signature;
}



/**
 * Transfer Solana between two accounts.
 * @param param0 
 */
export async function transferSolana({
    connection,
    receiverPublicKey,
    wallet,
    signTransaction,
    amountSol
}: {
    connection: Connection;
    receiverPublicKey: PublicKey;
    wallet: any;
    signTransaction: SignerWalletAdapterProps["signTransaction"];
    amountSol: number;
}) {

    // Add transfer instruction to transaction
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: receiverPublicKey,
            lamports: amountSol * LAMPORTS_PER_SOL // Transfer in Lamports
        })
    );

    // Setting the variables for the transaction
    transaction.feePayer = await wallet.publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    // Transaction constructor initialized successfully
    if (transaction) {
        console.log("Txn created successfully");
    }
    // Sign transaction, broadcast, and confirm
    var signature = await signAndSendTransaction(
        connection,
        signTransaction,
        transaction
    );

    console.log("SIGNATURE", signature);
    console.log("SUCCESS");

    return signature;
}



/**
 * Modal checking that both sides have the 16 chess pieces before starting the game.
 *
 * @param: gameWebsiteHost: the host of the game, used to distinguish the different requests
 * @param: gameID: any, the ID of the game
 * @param: playerUID: string, the name of the player
 * @param: handleGameStarting: Callback after betting is done.
 * @param: numberMultiplayers: Number of multiplayers in case of multiplayer gameType (default is 2).
 * @param: blockchaintType: string, default is 'solana'.
 * @param: network: string, name of the network (default is 'devnet').
 * @param: amountBet: number in Sol (default is 0.1).
 * @param: secondsBeforeCancellation: number, the number of seconds before cancelling the game
 *
 * @constructor
 */
export const Play2EarnModal = ({ gameWebsiteHost, gameID, playerUID, handleGameStarting, gameType, numberMultiplayers = 2,
        blockchainType = 'solana', network = 'devnet', amountBet = 0.1, secondsBeforeCancellation = 60 }: IProps) => {


    const [rpc, setRpc] = useState<string | null>(null);
    const { connection } = useConnection();

    const [errorMessage, setErrorMessage] = useState("");
    const wallet = useWallet();
    const { publicKey, signTransaction } = useWallet();


    // Related to Solana Escrow
    const [secondsBeforeCancelling, setSecondsBeforeCancelling] = useState<number>(0);
    const [isPlayerOneHasBet, setIsPlayerOneHasBet] = useState<boolean>(false);

    // Related to Display
    const [isSpinnerLoading, setIsSpinnerLoading] = useState<boolean>(false);



    /**
     * Display a toast message for the connection to the cluster.
     */
    useEffect(() => {
        const toastConnected = async () => {
            if (wallet.connected) {
                const cluster = await connection.getClusterNodes();
                if (rpc !== cluster[0].rpc) {
                    toast(`Connected to ${cluster[0].rpc}`);
                    setRpc(cluster[0].rpc);
                }
            }
        };
        toastConnected();
    }, [wallet, connection, rpc]);


    /**
     * The first player has bet.
     */
    const playerOneHasBet = async () => {
        setSecondsBeforeCancelling(secondsBeforeCancellation);
        setIsPlayerOneHasBet(true);
    }


    /**
     * Cancel the betting in case of a multiplayer game.
     */
    const handleCancelBetting = () => {
        console.log('Cancel the betting');
        setIsPlayerOneHasBet(false);
    }



    /**
     * Cancel the timer before the cancelling of the betting.
     */
    useEffect(() => {
        if (secondsBeforeCancelling > 0) {
            setTimeout(() => setSecondsBeforeCancelling(secondsBeforeCancelling - 1), 1000);
        } else {
            setSecondsBeforeCancelling(0);
        }
    }, [secondsBeforeCancelling]);


    /**
     * Bet your chess piece with the other player in case of a multiplayer game.
     * 
     */
    const betSolanaMultiplayer = async () => {

        console.log('Game ID', gameID);

        if (!publicKey || !signTransaction) {

            toast.error('Wallet is not connected properly. Re-connect your wallet.', {
                position: "top-right",
                autoClose: 5000,
                closeOnClick: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }


        const bodyRequestGameStatus: BodyRequestStatusGame = {
            // @ts-ignore
            game_website_host: gameWebsiteHost, game_id: gameID
        }

        console.log('Checking the status of the game.', bodyRequestGameStatus);

        // TODO: Move the logic of checking the game status in the backend.

        // Checking the status of the game
        fetch('/api/game-status', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyRequestGameStatus)
        })
            .then(response => response.json())
            .then(async data => {
                console.log('Game Status', data);

                // TODO: Simplify this part by harmonizing the response
                if ('error' in data) {
                    console.log('Game Does not exist, creating it.');


                    // In this case the username is the public key of the player
                    initiateBetting(connection, wallet, signTransaction, gameWebsiteHost, gameID, playerUID, publicKey?.toBase58(),
                     gameType, blockchainType, network, amountBet)
                        .then((res: any) => {
                            // TODO: Verify that there are no errors after the initiation of betting
                            console.log('Results from betting:::', res)
                            playerOneHasBet();

                            // TODO: In case of an error, display the error message.
                            // toast.error((e as Error).message);
                        })

                } else if ('status_game' in data) {
                    console.log('Game already exists checking the status of the game');

                    if (data.status_game == gameAPIStatusEnum.PlayerOneHasBet) {
                        console.log('The player two is now betting.');

                        acceptBetting(connection, wallet, signTransaction, gameWebsiteHost, gameID, playerUID, publicKey?.toBase58(), amountBet, blockchainType)
                            .then((res: any) => {
                                console.log('results', res);
                                console.log('Signature of the betting: ', res)
                                handleGameStarting();

                            })
                    }

                }
            })
            .catch((error) => {
                console.log("Error: ", error);
                toast.error((error as Error).message);
            });
    }

    /**
     * Bet SOL money in a solo game by sending a JSON request to the backend.
     */
    const betSolanaSolo = async () => {
        setIsSpinnerLoading(true);

        if (!publicKey || !signTransaction) {

            toast.error('Wallet is not connected properly. Re-connect your wallet.', {
                position: "top-right",
                autoClose: 5000,
                closeOnClick: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        initiateBetting(connection, wallet, signTransaction, gameWebsiteHost, gameID, playerUID, publicKey?.toBase58(), gameType, blockchainType, network, amountBet)
        .then((res: any) => {
            // TODO: Verify that there are no errors after the initiation of betting
            console.log('Results from betting for a solo game:::', res)
            setIsSpinnerLoading(false);
            handleGameStarting();
        }).catch((error) => {
            console.log("Error: ", error);
            toast.error(error);
        });
    }

    // Just return a spinnner in case it is loading.
    if (isSpinnerLoading) {
        return (
            <FidgetSpinner
                visible={true}
                height="80"
                width="80"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
                ballColors={['#ff0000', '#00ff00', '#0000ff']}
                backgroundColor="#F4442E"
            />
        )
    }


    return (
        <>
            {!wallet.connected &&
                <>
                    <p style={{ fontSize: '22px', fontStyle: 'italic' }} className="mt-4">
                        Please connect your Solana wallet first.
                    </p>
                    <WalletMultiButton />
                </>
            }
            {wallet.connected &&
                <div
                    className="border-4 border-yellow-700 rounded-xl my-16 p-12 flex flex-col justify-center items-center">
                    <div className="p-4 sm:px-0">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Time to bet some Solana.
                    </h3>
                    </div>

                    {isPlayerOneHasBet ?
                        <button
                            className="cursor-pointer py-2 px-4 rounded transition text-center text-purple-50 bg-yellow-700 disabled:opacity-30"
                            onClick={() => handleCancelBetting()}
                            disabled={secondsBeforeCancelling > 0}>Cancel betting.
                                    ({secondsBeforeCancelling} seconds)
                        </button>
                        :
                        <button
                            className="cursor-pointer py-2 px-4 rounded transition text-center text-purple-50 bg-yellow-700 disabled:opacity-30"
                            onClick={() => {
                                if (gameType === gameTypeEnum.Multiplayer) {
                                    betSolanaMultiplayer();
                                } else {
                                    betSolanaSolo();
                                }
                            }}>
                            Bet {amountBet} SOL.
                        </button>
                    }
                </div>}
            <ToastContainer />
        </>
    )
}
