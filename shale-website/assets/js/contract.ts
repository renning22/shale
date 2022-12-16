import DappContext from '@/assets/js/DappContext'

export const dappCtx = new DappContext({
  onAccountsChanged: onAccountsChanged,
})

function onAccountsChanged(address: string[]) {
  // console.log(address)
}
