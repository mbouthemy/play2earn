import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { BodyRequestStatusGame } from "./BodyRequest";
import { gameAPIStatusEnum } from "./Enums";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { initiateBetting } from "./initBetting";
import { acceptBetting } from "./AcceptBetting";

interface IProps {
    gameWebsiteHost: string;
    gameID: any;
    playerUID: any;
    handleGameStarting: any;
    secondsBeforeCancellation: number;
}


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
            game_website_host: gameWebsiteHost, game_id: gameID
        }

        console.log('Checking the status of the game.', bodyRequestGameStatus);


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
