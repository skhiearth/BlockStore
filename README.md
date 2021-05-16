# BlockStore
Code repository, UI elements and supporting documents for the BlockStore project by The Misfits at BhilaiHacks

BlockStore is a platform where individuals and small businesses can kickstart their digital stores on the blockchain. Cryptocurrency Transactions and status tracking would ensure transparency.

![App Screenshots](https://github.com/skhiearth/BlockStore/blob/main/Screenshots/Cover%20Page.png?raw=true)

With the ongoing NFT boom, everyone is talking about making quick bucks on the blockchain. While NFT has been mostly restricted to digital artists and collectibles, we want to create a platform that allows small stores and individuals to sell their physical creations directly to the public.

BlockStore uses the Celo blockchain to deliver the platform where sellers can directly list their products on the blockchain for everyone to see and purchase. All users, buyers, and sellers alike are authenticated using the emails via the SawoLabs SDK. 

### Global 
Using Cryptocurrencies like CELO allows sellers to transact across borders, reaching a wider audience.

### Transparency 
Order status updates, product lists, authentication, prices - everything is handled publicly on the blockchain, no databases.

![App Screenshots](https://github.com/skhiearth/BlockStore/blob/main/Screenshots/E-Commerce%20meets%20Blockchain.png?raw=true)

## Features :-

#### 1. Scalability: 
No databases. Zip, nothing, nada.
We use the Celo blockchain for maintaining authentication of users and use SawoLabs for registering new sellers and buyers allowing for limitless scalability.

#### 2. Order Status: 
Sellers can use the platform to update the status of the orders, letting the buyers know on the fly. This feature allows for complete transparency between the sellers and the buyers. 

#### 3. Authentication:
When Sawo's easy no password login meets the security of the blockchain, magic happens. The Web App handles all authentication with Celo - the users just have to deal with the simple Sawo form. Integration of passwordless login system on top of Blockchain means no more unreadable addresses - just a simple email-based login. 

![App Screenshots](https://github.com/skhiearth/BlockStore/blob/main/Screenshots/SawoLabs.png?raw=true)

## Instructions to run the project locally 
1. Go into the root folder of the project, named `BlockStore` and run `npm install`.
2. Inside the root folder, run `truffle compile` to compile the Solidity smart contract to their JSON ABIs.
3. Run `truffle migrate --reset --network alfajores` to migrate the smart contracts to the Celo Alfajores test network.
4. After migration, run `npm start` to start the Web Application.

Note: If you deploy using a personal account, CELO tokens are required in your account. You can request tokens using the publically available [faucet for the Alfajores test network](https://celo.org/developers/faucet).

## Tech Stack:
* Smart Contracts: [Solidity](https://solidity.readthedocs.io/en/v0.7.3/)
* Blockchain Network: [Celo](https://celo.org/)
* Front-end: [React](https://reactjs.org/)
* Package Manager: [npm](https://www.npmjs.com/)
* Some open source libraries: [Epic React Spinners](https://github.com/bondz/react-epic-spinners), and [Identicon](https://github.com/stewartlord/identicon.js/tree/master)

![App Screenshots](https://github.com/skhiearth/BlockStore/blob/main/Screenshots/Tech%20Stack.png?raw=true)

Made by The Misfits - [Simran](https://simmsss.github.io/) and [Utkarsh](https://skhiearth.github.io/)
