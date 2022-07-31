import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import * as anchor from "@project-serum/anchor";
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
  

// @ts-ignore
const idl = JSON.parse(process.env.NEXT_PUBLIC_IDL_STRINGIFY);
const programID = new PublicKey(idl.metadata.address);


export const addressChestPubKey: string = 'FAGSx7VdV8PZXfZs7n6NPYdt54uGHTykZ5WxzaUEaY91';


export interface Wallet {
    signTransaction(
      tx: anchor.web3.Transaction
    ): Promise<anchor.web3.Transaction>;
    signAllTransactions(
      txs: anchor.web3.Transaction[]
    ): Promise<anchor.web3.Transaction[]>;
    publicKey: anchor.web3.PublicKey;
  }
  
type ProgramProps = {
connection: Connection;
wallet: Wallet;
};

interface IProps {
    gameWebsiteHost: string;
    gameID: any;
    playerUID: any;
    handleGameStarting: any;
    secondsBeforeCancellation: number;
}


/**
 * Enum for the status of the Game API.
 */
export enum gameAPIStatusEnum {
    PlayerOneHasBet = 'player_one_has_bet'
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
export async function acceptBetting(connection: Connection, wallet: any, signTransaction: any, gameWebsiteHost: string, gameId: string, playerTwoUsername: string, playerTwoPublicKeyString: string) {
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



export const cancelBetting = () => {
    console.log('Cancel the betting');
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
}: {
    connection: Connection;
    receiverPublicKey: PublicKey;
    wallet: any;
    signTransaction: SignerWalletAdapterProps["signTransaction"];
}) {

    // Add transfer instruction to transaction
    var transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: receiverPublicKey,
        lamports: LAMPORTS_PER_SOL / 100,
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

export const useProgram = ({ connection, wallet }: ProgramProps) => {
    // @ts-ignore
      const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();
  
    useEffect(() => {
      const updateProgram = () => {
          const provider = new anchor.Provider(connection, wallet, {
            preflightCommitment: "recent",
            commitment: "processed",
          });
          console.log("provider", provider);
      
          //   const idl = await anchor.Program.fetchIdl(programID, provider);
          //   console.log("idl", idl);
      
          const program = new anchor.Program(idl as any, programID, provider);
      
          setProgram(program);
        };
  
      updateProgram();
    }, [connection, wallet]);
  
    return {
      program,
    };
  };
  



/**
 * Modal checking that both sides have the 16 chess pieces before starting the game.
 *
 * @param: gameWebsiteHost: the host of the game, used to distinguish the different requests
 * @param: gameID: any, the ID of the game
 * @param: playerUID: string, the name of the player
 * @param: secondsBeforeCancellation: number, the number of seconds before cancelling the game
 * @param: handleGameStarting: triggers the betting of the chess piece.
 *
 * @constructor
 */
export const Play2EarnModal = ({ gameWebsiteHost, gameID, playerUID, handleGameStarting, secondsBeforeCancellation }: IProps) => {


    const [rpc, setRpc] = useState<string | null>(null);
    const { connection } = useConnection();

    const [errorMessage, setErrorMessage] = useState("");
    const wallet = useWallet();
    const { publicKey, signTransaction } = useWallet();
    // @ts-ignore
    const { program } = useProgram({ connection, wallet });


    // Related to Solana Escrow
    const [secondsBeforeCancelling, setSecondsBeforeCancelling] = useState<number>(0);


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
     * Update the status of the player one in Firebase to change the thing so both player knows that he has bet.
     */
    const playerOneHasBet = async () => {
        setSecondsBeforeCancelling(secondsBeforeCancellation);
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
     * Bet your chess piece with the other player.
     * It is basically an escrow of the NFT (Alice) in exchange for 0 SOL. (Bob)
     */
    const betSolana = async () => {

        console.log('Game ID', gameID);

        setErrorMessage("");

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
            game_website_host: process.env.NEXT_PUBLIC_WEBSITE_HOST, game_id: gameID
        }

        console.log('Checking the status of the game.', bodyRequestGameStatus);


        // Checking the status of the game
        fetch(process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + '/game-status', {
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
                    initiateBetting(connection, wallet, signTransaction, gameWebsiteHost, gameID, playerUID, publicKey?.toBase58(), 'solana', '1')
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

                        acceptBetting(connection, wallet, signTransaction, gameWebsiteHost, gameID, playerUID, publicKey?.toBase58())
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

                        <button
                            className="cursor-pointer py-2 px-4 rounded transition text-center text-purple-50 bg-yellow-700 disabled:opacity-30"
                            onClick={() => betSolana()}>
                            Bet 10 Solana.
                        </button>

                </div>}
            <ToastContainer />
        </>
    )
}