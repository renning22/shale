import { onMounted } from 'vue'
import { delegatedFromEthAddress } from '@glif/filecoin-address'
import { dappCtx } from '@/assets/js/contract'

async function testPut() {
  const list = await dappCtx.Shale?.getMarketList()
  // const list = await dappCtx.Shale?.getRentOrders('0x2c3856a31901cfa06e1e6a9ba04f57d0431555a5');
  // const list = await dappCtx.Shale?.getRentOutOrders('0x2c3856a31901cfa06e1e6a9ba04f57d0431555a5');
  // const list = await dappCtx.Shale?.getRentOutProduct('0x2c3856a31901cfa06e1e6a9ba04f57d0431555a5');
  // await dappCtx.Shale?.setupOrder('10001670497012', true, '12.1212.121:22');
  // await dappCtx.Shale?.takeProduct('20001670492842');
  // await dappCtx.Shale?.closeOrder('10001670497012');
  // await dappCtx.Shale?.modifyProduct('20001670499862', false);
  // await dappCtx.Shale?.putProduct('0.25', {
  //   id: 'Test5',
  //   data: 'Filecoin is an open-source cloud storage marketplace, protocol, and incentive layer.',
  //   cpu: {
  //     cores: "2",
  //     frequency: "2.9GHz"
  //   },
  //   gpu: {
  //     process: "RTX 2060",
  //     vram: "8GB"
  //   },
  //   ram: {
  //     total: "16GB"
  //   },
  //   disk: {
  //     total: "256GB",
  //     free: "220GB"
  //   }
  // });

  // console.log(list)
}

export function useUser() {
  const userEthAccount = useState('userEthAccount', () => '')
  const userAccount = useState('userAccount', () => '')

  const setUserAccount = (account: string) => {
    userEthAccount.value = account
    userAccount.value = delegatedFromEthAddress(account)
  }

  return { userEthAccount, userAccount, setUserAccount }
}

export function useWallet() {
  const { userAccount, setUserAccount } = useUser()

  onMounted(async () => {
    if (process.client) {
      try {
        const connected = await dappCtx.connect()
        if (connected && dappCtx.connectedAccounts.length > 0) {
          setUserAccount(dappCtx.connectedAccounts[0])
        } else {
          // console.log('not connect or install metamask')
        }
      } catch (err) {
        console.error("[userWallet's onMounted err]", err)
      }
    }
    // ethereum.on('accountsChanged', walletConnect.onAccountChange)
    // ethereum.on('chainChanged', walletConnect.onChainChange)
  })

  // onUnmounted(() => {
  //   ethereum.removeListener('accountsChanged', walletConnect.onAccountChange)
  //   ethereum.removeListener('chainChanged', walletConnect.onChainChange)
  // })

  return { userAccount }
}
