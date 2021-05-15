import React, { Component } from 'react';
import  { Redirect } from 'react-router-dom'
import { withRouter } from "react-router";
import Web3 from 'web3';
import styles from './App.module.css';
import BlockStore from '../abis/BlockStore.json'
import bg from './Assets/bg.png'
import { FingerprintSpinner } from 'react-epic-spinners'

class Seller extends Component {

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

      const sellerCount = await blockStore.methods.sellerCount().call()

      for (var i = 0; i < sellerCount; i++) {
        const seller = await blockStore.methods.Sellers(accounts[0]).call()
        if(seller.publicAddress === this.state.account){
          this.setState({ authenticated: true })
            if(seller.created === true){
                this.setState({ seller })
                this.setState({ authenticated: true })
                this.setState({ loading: false})
            } else {
              return <Redirect to='/SellerAuth'/>
            }
        } else {
          return <Redirect to='/SellerAuth'/>
        }
      }

      this.setState({ loading: false})
      if(!this.state.authenticated){
        this.props.history.push('/SellerAuth')
      }

    } else {
      window.alert('BlockStore contract not deployed to detected network.')
    }
  }

  createProduct(name, description, value) {
    this.setState({ loading: true })
    this.state.blockStore.methods.createProduct(name, description, value).send({ from: this.state.account })
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
      certificates: [],
      requests: [],
      seller: [],
      loading: true
    }

    this.createProduct = this.createProduct.bind(this)
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
                <div style={{textAlign:"center", verticalAlign:"middle"}}>
                  <div className={styles.footerHeader} style={{textAlign:"center"}}>{this.state.seller.name}</div>
                </div>
                <p>&nbsp;</p>
                <div style={{textAlign:"center", verticalAlign:"middle"}}>
                  <div className={styles.verifyTitle} style={{textAlign:"center"}}>Create a new product</div>
                </div>
                <p></p>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const name = this.productName.value
                  const description = this.productDesc.value
                  const value = this.productValue.value
                  this.createProduct(name, description, window.web3.utils.toWei(value.toString(), 'Ether'))
                }}>
                <div className="form-group">
                  {/* Input for name of the certificate */}
                  <input
                    id="productName"
                    type="text"
                    ref={(input) => { this.productName = input }}
                    className="form-control"
                    placeholder="Product Name"
                    required />
                </div>
                <div className="form-group">
                  {/* Input for value of the certificate */}
                  <input
                    id="productDesc"
                    type="text"
                    ref={(input) => { this.productDesc = input }}
                    className="form-control"
                    placeholder="Product Description"
                    required />
                </div>
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <span class="input-group-text">ETH</span>
                    </div>
                    <input
                      id="productValue"
                      type="text"
                      ref={(input) => { this.productValue = input }}
                      className="form-control"
                      placeholder="Product Cost"
                      required />
                </div>
                <button type="submit" className="btn btn btn-outline-light btn-block">List Product</button>
              </form>
              <p>&nbsp;</p>
              <div style={{textAlign:"center", verticalAlign:"middle"}}>
                <div className={styles.verifyTitle} style={{textAlign:"center"}}>Orders</div>
              </div>
              <p></p>
              { this.state.requests.map((request, key) => {
                return(
                    
                  <div className="card mb-4" key={key} >
                    {/* Transaction Information */}
                    <div className="card-header">
                      <small className="text-muted">Request of ID: {request.id.toString()}</small>
                      <p></p>
                      <small className="text-muted">ID of Certificate: {(request.certificateId.toString())}</small>
                      <p></p>
                      <small className="text-muted">Applicant: {(request.studentId.toString())}</small>
                      <p></p>
                      <small className="text-muted">Value: {window.web3.utils.fromWei(request.value.toString(), 'Ether')} ETH</small>
                    </div>
                    <ul id="certificateList" className="list-group list-group-flush">
                      <li key={key} className="list-group-item py-3">
                        
                        <button
                          className="btn btn-outline-danger btn-sm float-right pt-0"
                          style={{marginLeft: 14}}
                          name={request.identity}
                          onClick={(event) => {
                            this.declineRequest(request.certificateId.toString(),
                            request.studentId.toString(), request.id.toString(), request.value.toString())
                          }}
                        >
                          Decline Request
                        </button>

                        <button
                          className="btn btn-outline-success btn-sm float-right pt-0"
                          name={request.identity}
                          onClick={(event) => {
                            this.approveRequest(request.certificateId.toString(),
                            request.studentId.toString(), request.id.toString())
                          }}
                        >
                          Approve Request
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
        }
      </div>
    );
  }
}

const SellerWithRouter = withRouter(Seller);

export default SellerWithRouter;