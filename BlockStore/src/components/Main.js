import React, { Component } from 'react';
import Identicon from 'identicon.js';
import Web3 from 'web3';
import BlockStore from '../abis/BlockStore.json'
import styles from './App.module.css';
import { withRouter } from "react-router";
import { FingerprintSpinner } from 'react-epic-spinners'
let ContractKit = require("@celo/contractkit")

let kit


const style = {
  content: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    color: "white",
    padding: 18,
    borderRadius: 20,
  }
}


class Main extends Component {

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
                      this.setState({ noaccount: false })
                      this.setState({ loading: false})
                  } else {
                    
                  }
              } else {
                
              }
            }

          const productCount = await blockStore.methods.productCount().call()
          this.setState({ productCount })

          // Load Products
          for (var i = 0; i < productCount; i++) {
            const prod = await blockStore.methods.ProductList(i).call()
            console.log(prod)
            this.setState({
              products: [...this.state.products, prod]
            })
          }

          // Sort products based on cost
          this.setState({
            certificates: this.state.products.sort((a,b) => b.price - a.price)
          })

          this.setState({ loading: false})
        } 
      } catch (error) {
        console.log(`⚠️ ${error}.`)
      }
    } else {
      console.log("⚠️ Please install the CeloExtensionWallet.")
    }
  }


  createOrder(id, value) {
    this.setState({ loading: true })
    this.state.blockStore.methods.createOrder(id).send({ from: this.state.account, value: value })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
      console.log(this.state.loading)
    })
  }

  handleClick() {
    this.props.history.push('/BuyerAuth')
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      blockStore: null,
      productCount: 0,
      products: [],
      loading: true,
      noaccount: true,
      buyer: [],
      notrequest: true
    }

    this.createOrder = this.createOrder.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  render() {
    return (

      <div>
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
                <div style={{padding: 16, fontSize: 12, fontWeight: 600, color: "white"}}>Logged in as: {this.state.account}</div>
                
                { this.state.noaccount
                    ?  
                    <div class="col-lg-12" >
                      <div style={style.content}>
                        <div style={{textAlign: 'center'}} className={styles.verifyMid}>No buyer account found! Create one to access product catalog.</div>
                        <button onClick={this.handleClick} className="btn btn-outline-warning btn-sm float-right pt-0">Create Account</button>
                        <p></p>
                        </div>
                      </div>
                    : 
                    <div>
                      <p>&nbsp;</p>
                { this.state.products.map((product, key) => {
                  return(
                    <div className="card mb-4" key={key} >
                      <div className="card-header">
                        <small>{product.name}</small>
                        <img
                          alt="identicon"
                          className='ml-2 float-right'
                          width='50'
                          height='50'
                          src={`data:image/png;base64,${new Identicon(product.seller, 50).toString()}`}
                        />
                        <small className="text-muted float-right">Seller: </small>
                        
                        <p></p>
                        <small style={{marginTop: -20}} className="text-muted float-right">{product.seller.toString()}</small>
                        <small className="text-muted">Product ID: {(product.productId.toString())}</small>
                      </div>
                      <ul id="certificateList" className="list-group list-group-flush">
                        <li key={key} className="list-group-item py-2">
                          <small className="float-left mt-1 text-muted">
                            Price: {window.web3.utils.fromWei(product.price.toString(), 'Ether')} CELO
                          </small>

                          <button
                            className="btn btn-outline-success btn-sm float-right pt-0"
                            name={product.productId}
                            onClick={(event) => {
                              let cost = product.price
                              this.createOrder(event.target.name, cost.toString())
                            }}
                          >
                          Buy
                          </button>

                        </li>
                      </ul>
                    </div>
                  )
                })}
                    </div>
                }
                
                
                
                
              </div>
            </main>
          </div>
        </div>
        }
      </div>
    );
  }
}

const MainWithRouter = withRouter(Main);

export default MainWithRouter;