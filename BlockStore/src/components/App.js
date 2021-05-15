import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Navigation, Footer, Main, Verify, Seller, CreateSeller, SellerAuth } from ".";
import BlockStore from '../abis/BlockStore.json'
import Web3 from 'web3';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
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
  }

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
            <Route path="/verify" exact component={() => <Verify />} />
            <Route path="/Seller" exact component={() => <Seller />} />
            <Route path="/SellerAuth" exact component={() => <SellerAuth />} />
            <Route path="/CreateSeller" exact component={() => <CreateSeller />} />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App;