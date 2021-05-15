import React, { Component } from 'react';
import { withRouter } from "react-router";
import Web3 from 'web3';
import BlockStore from '../abis/BlockStore.json'
import bg from './Assets/bg.png'
import { FingerprintSpinner } from 'react-epic-spinners'
import styles from './App.module.css';

class CreateBuyer extends Component {

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
    //   if(!this.state.authenticated){
    //     this.props.history.push('/')
    //   }

    

    } else {
      window.alert('BlockStore contract not deployed to detected network.')
    }
  }

  createBuyer(name, address) {
    this.setState({ loading: true })
    this.state.blockStore.methods.createBuyer(name, address).send({ from: this.state.account })
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

    
    

    this.createBuyer = this.createBuyer.bind(this)
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
                  const address = this.address.value
                  this.createBuyer(this.props.payload.identifier, address)
                }}>
                    <div class="input-group mb-3">
                    <input
                        id="address"
                        type="text"
                        ref={(input) => { this.address = input }}
                        className="form-control"
                        placeholder="Please enter your shipping address"
                        required />
                    </div>
                <button type="submit" className="btn btn btn-outline-light btn-block">Create Buyer Profile</button>
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

const CreateBuyerWithRouter = withRouter(CreateBuyer);

export default CreateBuyerWithRouter;