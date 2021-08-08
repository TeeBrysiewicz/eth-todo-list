App = {
  loading: false,
  contracts: {},

  // This connect function may not be needed...
  connect: async () => {
    await ethereum
      .request({ method: 'eth_requestAccounts' })
      .catch((err) => {
        if (err.code === 4001) {
          // If this happens, the user rejected to connection request.
          console.log('Please connect to MetaMask')
        } else {
          console.error(err);
        }
      })
  },

  // This too...
  // handleAccountsChanged: async (accounts) => {
  //   if (accounts.length === 0) {
  //     // MetaMask is locked or the user has not connected any accounts
  //     console.log('Please connect to MetaMask.')
  //   } else if (accounts[0] !== currentAccount) {
  //     App.account = accounts[0]
  //   }
  // },

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  updateAccount: async (accounts) => {
    console.log('Account Found: ', accounts[0])
    App.account = accounts[0]
    // ethereum.defaultAccount = accounts[0]
    ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: accounts[0],
          value: '',
          gasPrice: '',
          gas: '',
        },
      ],
    })
    .catch((error) => console.error)
  },

  loadWeb3: async () => {
    const provider = await detectEthereumProvider()
    console.log(provider)

    if (provider) {
      console.log('Ethereum successfully detected!')
      App.provider = provider

      // Legacy providers may only have ethereum.sendAsync
      const chainId = await provider.request({
        method: 'eth_chainId'
      })

      // Access the decentralized web!
    } else {

      // if the provider is not detected, detectEthereumProvider resolves to null
      console.error('Please install MetaMask!', error)
    }
  },

  loadAccount: async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    App.account = accounts[0]
    console.log("Account Loaded: ", App.account)

    // await ethereum
    //   .request({ method: 'eth_requestAccounts' })
    //   .then(App.updateAccount)
    //   .catch((err) => {
    //     if (err.code === 4001) {
    //       // If this happens, the user rejected to connection request.
    //       console.log('Please connect to MetaMask')
    //     } else {
    //       console.error(err);
    //     }
    //   })

    // await ethereum.request({
    //   method: 'eth_sendTransaction',
    //   params: [
    //     {
    //       nonce: '0x00',
    //       gasPrice: '',
    //       gas: '',
    //       to: accounts[0],
    //       from: accounts[0],
    //       value: '0x00',
    //     },
    //   ],
    // })
    // .catch((error) => console.error)
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json')
    console.log(todoList)
    App.contracts.TodoList = await TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.provider)

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      const task = await App.todoList.tasks(i)
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]

      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      // .on('click', App.toggleCompleted)

      // Put the task in the correct list
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      // Show the task
      $newTaskTemplate.show()
    }
  },

  processTask: async () => {
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          nonce: '0x00',
          gasPrice: '',
          gas: '',
          to: App.account,
          from: App.account,
          value: '0x00',
        },
      ],
    })
    .catch((error) => console.error)
  },

  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    // await App.processTask()
    debugger;
    await App.todoList.createTask(content)
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})