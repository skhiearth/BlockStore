import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Navigation, Footer, Main, Orders, Seller, CreateSeller, SellerAuth, CreateBuyer, BuyerAuth } from ".";
import BlockStore from '../abis/BlockStore.json'
import Web3 from 'web3';
let ContractKit = require("@celo/contractkit")

let kit

class App extends Component {

  async componentWillMount() {
    // await this.loadBlockchainData()
    this.connectCeloWallet()
  }

  async connectCeloWallet() {
    if (window.celo) {
      try {
        await window.celo.enable()
  
        const web3 = new Web3(window.celo)
        kit = ContractKit.newKitFromWeb3(web3)
  
        const accounts = await kit.web3.eth.getAccounts()
        kit.defaultAccount = accounts[0]

        this.setState({ account: accounts[0] })
        // Network ID
        const networkId = await web3.eth.net.getId()
        const networkData = BlockStore.networks[networkId]
        if(networkData) {
          const blockStore = new web3.eth.Contract(BlockStore.abi, networkData.address)
          this.setState({ blockStore })

          this.setState({ loading: false})

        } else {
          window.alert('BlockCred contract not deployed to detected network.')
        }
      } catch (error) {
        console.log(`⚠️ ${error}.`)
      }
    } else {
      console.log("⚠️ Please install the CeloExtensionWallet.")
    }
  }

  // async loadBlockchainData() {
  //   const web3 = window.web3
  //   // Load account
  //   const accounts = await web3.eth.getAccounts()
  //   this.setState({ account: accounts[0] })
  //   // Network ID
  //   const networkId = await web3.eth.net.getId()
  //   const networkData = BlockStore.networks[networkId]
  //   if(networkData) {
  //     const blockStore = new web3.eth.Contract(BlockStore.abi, networkData.address)
  //     this.setState({ blockStore })

  //     this.setState({ loading: false})

  //   } else {
  //     window.alert('BlockCred contract not deployed to detected network.')
  //   }
  // }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      blockStore: null
    }
  }

  render() {
    return (
      <div className="App" style={{height:800}}>
        <Router>
          <Navigation account={this.state.account}/>
          <Switch>
            <Route path="/" exact component={() => <Main />} />
            <Route path="/Orders" exact component={() => <Orders />} />
            <Route path="/Seller" exact component={() => <Seller />} />
            <Route path="/SellerAuth" exact component={() => <SellerAuth />} />
            <Route path="/CreateSeller" exact component={() => <CreateSeller />} />
            <Route path="/BuyerAuth" exact component={() => <BuyerAuth />} />
            <Route path="/CreateBuyer" exact component={() => <CreateBuyer />} />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App;