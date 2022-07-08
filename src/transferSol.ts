import {
    Connection,
    LAMPORTS_PER_SOL,
    SystemProgram,
    PublicKey,
    Transaction,
  } from "@solana/web3.js";
import { signAndSendTransaction } from "./transaction";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";


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
