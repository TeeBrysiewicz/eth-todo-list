App = {

  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  loadWeb3: async () => {
    const provider = await detectEthereumProvider()
    console.log(provider)
    if (provider) {

      console.log('Ethereum successfully detected!')

      App.provider = provider

      // From now on, this should always be true:
      // provider === window.ethereum

      // Access the decentralized web!

      // Legacy providers may only have ethereum.sendAsync
      const chainId = await provider.request({
        method: 'eth_chainId'
      })
    } else {

      // if the provider is not detected, detectEthereumProvider resolves to null
      console.error('Please install MetaMask!', error)
    }
  },

  loadAccount: async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    App.account = accounts[0]
    console.log(App.account)
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json')
    console.log(todoList)
    // var contract = require("@truffle-contract");
    App.contracts.TodoList = await TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.provider)

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed()
  },

  render: async () => {
    // Render Account
    $('#account').html(App.account)
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})