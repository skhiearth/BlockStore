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

class Orders extends Component {

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


            const buyerCount = await blockStore.methods.buyerCount().call()
            this.setState({ buyerCount })

            const orderCount = await blockStore.methods.orderCount().call()
            this.setState({ orderCount })

            for (var i = 0; i < buyerCount; i++) {
              const buyer = await blockStore.methods.Buyers(accounts[0]).call()
              if(buyer.publicAddress === this.state.account){
                  if(buyer.created === true){
                      this.setState({ buyer })
                      this.setState({ authenticated: true })
                      this.setState({ loading: false})
                      
                  } else {
                    return <Redirect to='/BuyerAuth'/>
                  }
              } else {
                return <Redirect to='/BuyerAuth'/>
              }
            }
            

            this.setState({ loading: false})
            if(!this.state.authenticated){
              this.props.history.push('/BuyerAuth')
            }

            // Load Orders
            for (var m = 0; m < orderCount; m++) {
              const order = await blockStore.methods.UserOrders(this.state.account, m).call()
              console.log(order)
              this.setState({
                orders: [...this.state.orders, order]
              })
            }

          } else {
            window.alert('BlockStore contract not deployed to detected network.')
          }

      } catch (error) {
        console.log(`⚠️ ${error}.`)
      }
    } else {
      console.log("⚠️ Please install the CeloExtensionWallet.")
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      blockStore: null,
      authenticated: false,
      orderCount: 0,
      orders: [],
      buyer: [],
      seller: [],
      loading: true
    }
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
                  <div className={styles.footerHeader} style={{textAlign:"center"}}>{this.state.buyer.name}</div>
                </div>
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
                      <small className="text-muted">Seller: {(order.seller.toString())}</small>
                      <p></p>
                      <small className="text-muted">Value: {window.web3.utils.fromWei(order.price.toString(), 'Ether')} CELO</small>
                    </div>
                    <ul id="certificateList" className="list-group list-group-flush">
                      <li key={key} className="list-group-item py-3">
                        <small className="text-muted">Current Status: {(order.status.toString())}</small>
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

const OrderWithRouter = withRouter(Orders);

export default OrderWithRouter;
