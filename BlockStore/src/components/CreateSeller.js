import React, { Component } from 'react';
import { withRouter } from "react-router";
import Web3 from 'web3';
import BlockStore from '../abis/BlockStore.json'
import bg from './Assets/bg.png'
import { FingerprintSpinner } from 'react-epic-spinners'
import styles from './App.module.css';
let ContractKit = require("@celo/contractkit")

let kit

class CreateSeller extends Component {

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
          const blockStore = new web3.eth.Contract(BlockStore.abi, networkData && networkData.address)
          this.setState({ blockStore })

          this.setState({ loading: false})

          this.setState({ account: accounts[0] })
        } 
      } catch (error) {
        console.log(`⚠️ ${error}.`)
      }
    } else {
      console.log("⚠️ Please install the CeloExtensionWallet.")
    }
  }

  createSeller(name) {
    this.setState({ loading: true })
    this.state.blockStore.methods.createSeller(name).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.loading)
    })
  }

  constructor(props) {
    super(props)

    this.state = {
      account: '',
      blockStore: null,
      authenticated: false,
      seller: [],
      loading: true
    }
    
    this.createSeller = this.createSeller.bind(this)
  }
  
  render() {
    return (
      <div styles={{ backgroundImage:`url(${bg})`}}>
        { this.state.loading
          ?  
          <div className="center mt-19">
            {/* loader */}
              <FingerprintSpinner
                style={{width: "100%"}}
                color='white'
                size='200'
	            />
          </div>
          : 
          <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '800px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <p class="m-0 text-center text-dark" className={styles.footerHeader}>
                Welcome, {this.props.payload.identifier}
              </p>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  this.createSeller(this.props.payload.identifier)
                }}>
                <button type="submit" className="btn btn btn-outline-light btn-block">Send Seller Creation Request</button>
              </form>
              <p>&nbsp;</p>
            </div>
          </main>
        </div>
      </div>
        }
      </div>
    );
  }
}

const CreateSellerWithRouter = withRouter(CreateSeller);

export default CreateSellerWithRouter;