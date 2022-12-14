# Play2Earn


Play2earn is a package used to convert any Nextjs game into a play2earn game with Solana blockchain integration.

- Integrate with solo games
- Integrate with multiplayer games
- No knowledge of Solana / Rust / Blockchain required
- Possibility to switch between Devnet and Mainnet easily


You can read the documentation here:

[Documentation Web2To3](https://docs.web-2-to-3.com)


## Demonstration

### Solo Game

An example of a 2048 Game (solo) converted into play2earn (if you finish it under a time period) can be found here:

[2048 To Earn Demo](https://2048-to-earn.web-2-to-3.com)

The code can be found here:

[2048 To Earn - Code](https://github.com/mbouthemy/2048-to-earn)


### Multiplayer Game

An example of a chess game converted to a chess2earn game (between two players) can be found here:

[Chess2Earn Demonstration](https://chess2earn.web-2-to-3.com)

The code associated is available here:

[Chess2Earn - Code](https://github.com/mbouthemy/chess2earn-example)


More examples of integration to come!

## Getting Started

### Compatibility

Your project needs to use React 17 or later.
For deployment and production use cases, you also need to use Nextjs 12.2 or later to secure the transaction.

### Installation

Add Play2Earn modal to your project by executing `npm install play2earn` or `yarn add play2earn`.

### Usage

Here's an example of basic usage:

```js
import { Play2EarnModal, finishGameAndGetMoneyWebThree } from "play2earn";
```

```js
<Play2EarnModal gameWebsiteHost="chess2earn.com" 
                gameID={gameID}
                playerUID={user?.uid} 
                handleGameStarting={() => handleGameStarting()}
                secondsBeforeCancellation={60} />
```

You also need to add the function which is triggers when the game is starting (i.e after the one/two players have bet in case of 
solo/multiplayer game).

```js
async function handleGameStarting() {
    console.log('Updating when the second player has accepted the bet.');
    // WRITE_YOUR_LOGIC_HERE...
}
```

Then, you need to add the function to end the game when one player has won.

```js
// Call this function when the game is finished with the winnerID
finishGameAndGetMoneyWebThree(process.env.NEXT_PUBLIC_WEBSITE_HOST, gameID, winnerID, winnerID, false)
    .then(resultSignature => {
        console.log('The money has been transferred to your account, the signature is: ', resultSignature);
    });
}
```



### Backend Set-up

In order to make the transaction secure and verify that no one is cheating, play2earn needs to integrate with the backend of [Web2To3](https://web-2-to-3.com).
Read the [documentation here](https://docs.web-2-to-3.com) to see how to create a game and use the API key associated.



## Props

|Name|Type|Default|Description|
|:--|:--:|:-----:|:----------|
|[**gameWebsiteHost**](#gameWebsiteHost)|`string`|required|The ID of your website, needs to match the one added in the backend.|
|[**gameID**](#gameID)|`string`|required|A unique ID to identify each game, you can use the Date().|
|[**playerUID**](#playerUID)|`string`|required|The ID or username of the player. Better if it is unique.|
|[**handleGameStarting**](#handleGameStarting) |`function`|`undefined`|Callback when player have bet.|
|[**gameType**](#gameType)|`string`|`solo`|The game type, `solo` or `multiplayer`.|
|[**numberMultiplayers**](#numberMultiplayers)|`number`|`2`|The number of players in case of multiplayer game.|
|[**blockchainType**](#blockchainType)|`string`|`solana`|The blockchain used for the betting.|
|[**network**](#network) |`string`|`devnet`|The network used, choice between `devnet` and `mainnet`.|
|[**amountBet**](#amountBet)|`number`|`0.1`|The amount bet of blockchain's currency.|
|[**secondsBeforeCancellation**](#secondsBeforeCancellation)|`number`|`60`|The number of seconds before cancellation of betting in multiplayer game.|

### `gameWebsiteHost`
`gameWebsiteHost` is the ID to identify your game application. You need to register it in the backend of [Web2to3](https://www.web-2-to-3.com) first and match the one registered there.

### `gameID`
`gameID` is the identifier of a game started by a player. It needs to be unique. You can use the timestamp to generate unicity. 

### `playerUID`
`playerUID` is the I### `onTick`
`onTick` is a callback and triggered every time a new period is started, based on what the D or username of the player. In case of multiplayer, make sure that it is unique within the game started.

### `handleGameStarting`
`handleGameStarting` is a callback and triggered after all players have bet and the game is ready to start.

### `gameType`
`gameType` specifies the type of game played, i.e `solo` or `multiplayer`. 

### `numberMultiplayers`
`numberMultiplayers` is the number of players in case the [`gameType`](#gametype) is set to `multiplayer`. Default is 2 players.

### `blockchainType`
`blockchainType` is the type of Blockchain used for currency and transaction. At the moment only `solana` option is available.

### `network`
`devnet` network is used for testing or demonstration while `mainnet` network is used with real cryptocurrencies. 

### `amountBet`
In case the `solana` blockchain network is used, the amount bet is in SOL currency.

### `secondsBeforeCancellation`
The number of seconds the player 1 has to wait before cancelling his bet in case player 2 is not willing to bet.



## Memo to update and publish the package

    npm login
    npm version patch
    npm publish

## Useful links - Documentation

- [Documentation Web2To3](https://docs.web-2-to-3.com)

## License

The MIT License.

## Author

<table>
  <tr>
    <td>
      <img src="https://github.com/mbouthemy.png?s=100" width="100">
    </td>
    <td>
      Marin Bouthemy<br />
    </td>
  </tr>
</table>
