import React, { Component } from 'react';
import Identicon from 'identicon.js';
import Web3 from 'web3';
import BlockStore from '../abis/BlockStore.json'

class Main extends Component {

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

    } else {
      window.alert('BlockStore contract not deployed to detected network.')
    }
  }

  createOrder(name, description, value) {
    this.setState({ loading: true })
    this.state.blockStore.methods.createOrder(name, description, value).send({ from: this.state.account })
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
      productCount: 0,
      products: [],
      loading: true,
      notrequest: true
    }

    this.createOrder = this.createOrder.bind(this)
  }

  render() {
    return (
      // Purchased Certificates column & Identicons
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '800px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
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
                          Price: {window.web3.utils.fromWei(product.price.toString(), 'Ether')} ETH
                        </small>

                        <button
                          className="btn btn-outline-success btn-sm float-right pt-0"
                          name={product.productId}
                          onClick={(event) => {
                            let cost = product.price
                            // this.props.purchaseCertificate(event.target.name, cost.toString())
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
          </main>
        </div>
      </div>
    );
  }
}

export default Main;