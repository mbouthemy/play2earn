# Play2Earn


Play2earn is a pacjage used to convert any Nextjs game into a play2earn game with Solana blockchain integration.

- Integrate with solo games
- Integrate with multiplayer games
- No knowledge of Solana / Rust / Blockchain required
- Possibility to switch between Devnet and Mainnet easily

## Demonstration

An example of a chess game converted to a chess2earn game (between two players) can be found here:

[Chess2Earn Demonstration](https://github.com/mbouthemy/chess2earn-example)

The code associated is available here:

[Code](https://docs.web-2-to-3.com)

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
<Play2EarnModal gameWebsiteHost={process.env.NEXT_PUBLIC_WEBSITE_HOST} 
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



## Memo to update and publish the package

    npm login
    npm version patch
    npm publish

## Useful links

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
