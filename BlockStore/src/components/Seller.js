import React, { Component } from 'react';
import  { Redirect } from 'react-router-dom'
import { withRouter } from "react-router";
import Web3 from 'web3';
import styles from './App.module.css';
import BlockStore from '../abis/BlockStore.json'
import bg from './Assets/bg.png'
import { FingerprintSpinner } from 'react-epic-spinners'
let ContractKit = require("@celo/contractkit")

let kit

class Seller extends Component {

  async componentWillMount() {
    // await this.loadBlockchainData()
    this.connectCeloWallet()
  }

  async connectCeloWallet() {
    if (window.celo) {
      try {
        await window.celo.enable()
  
        const web3 = new Web3(window.celo)
        window.web3 = new Web3(window.celo)
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

          const sellerCount = await blockStore.methods.sellerCount().call()
          this.setState({ sellerCount })

          const productCount = await blockStore.methods.productCount().call()
          this.setState({ productCount })

          const orderCount = await blockStore.methods.orderCount().call()
          this.setState({ orderCount })

          for (var i = 0; i < sellerCount; i++) {
            const seller = await blockStore.methods.Sellers(accounts[0]).call()
            if(seller.publicAddress === this.state.account){
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

          // Load Orders
          for (var m = 0; m < orderCount; m++) {
            const order = await blockStore.methods.SellerOrders(this.state.account, m).call()
            console.log(order)
            this.setState({
              orders: [...this.state.orders, order]
            })
          }

          // Load Products
          for (var j = 0; j < productCount; j++) {
            const prod = await blockStore.methods.ProductList(j).call()
            console.log(prod)
            this.setState({
              products: [...this.state.products, prod]
            })
          }
          
        } 
      } catch (error) {
        console.log(`⚠️ ${error}.`)
      }
    } else {
      console.log("⚠️ Please install the CeloExtensionWallet.")
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

  updateOrderStatus(index, status) {
    this.setState({ loading: true })
    this.state.blockStore.methods.updateOrderStatus(index, status).send({ from: this.state.account })
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
      sellerCount: 0,
      orderCount: 0,
      productCount: 0,
      products: [],
      orders: [],
      seller: [],
      loading: true
    }

    this.createProduct = this.createProduct.bind(this)
    this.updateOrderStatus = this.updateOrderStatus.bind(this)
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
                        <span class="input-group-text">CELO</span>
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
              { this.state.orders.map((order, key) => {
                return(
                    
                  <div className="card mb-4" key={key} >
                    {/* Transaction Information */}
                    <div className="card-header">
                      <small className="text-muted">Order ID: {order.orderId.toString()}</small>
                      <p></p>
                      <small className="text-muted">Product ID: {(order.productId.toString())}</small>
                      <p></p>
                      <small className="text-muted">Buyer: {(order.buyer.toString())}</small>
                      <p></p>
                      <small className="text-muted">Value: {window.web3.utils.fromWei(order.price.toString(), 'Ether')} CELO</small>
                    </div>
                    <ul id="certificateList" className="list-group list-group-flush">
                      <li key={key} className="list-group-item py-3">

                      <small className="text-muted">Current Status: {(order.status.toString())}</small>

                        <form onSubmit={(event) => {
                            event.preventDefault()
                            const newStatus = this.newStatus.value
                            this.updateOrderStatus(key, newStatus)
                        }}>
                            <div style={{paddingTop: 14, marginLeft: 6, paddingBottom: 0}} class="input-group mb-3">
                            <input
                                style={{marginRight: 6, marginLeft: 6, width: "50%"}}
                                id="newStatus"
                                type="text"
                                ref={(input) => { this.newStatus = input }}
                                className="form-control"
                                placeholder="New Status"
                                required />
                                <button type="submit"  style={{marginRight: 16}} className="btn btn-outline-success btn-sm float-right pt-0">Update Order Status</button>
                            </div>
                        </form>

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
