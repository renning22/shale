import { Web3Provider } from '@ethersproject/providers'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'
import Shale from './Shale'
import { SHALE_CONTRACT_ADDRESS } from './constant'

export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

export interface DappConnectEventHandler {
  onAccountsChanged?: (address: string[]) => void
  onNetworkChanged?: (chainId: number) => void
  onConnected?: () => void
  onDisconnect?: () => void
}

export default class DappContext {
  public isConnected: boolean
  public isInstalled: boolean

  public readonly SupportChains = ['0x7ab7']

  public connectedAccounts: string[] = []

  private _chainId: string
  private _eventHandler: DappConnectEventHandler
  private _web3Provider?: Web3Provider

  public Shale?: Shale

  constructor(eventHandler: DappConnectEventHandler) {
    this.isConnected = false
    this.isInstalled = false
    this._eventHandler = eventHandler
    this._chainId = this.SupportChains[0]
  }

  private onAccountsChanged(accounts: string[]) {
    // console.log('DappContext.onAccountsChanged', accounts)
    this.connectedAccounts = accounts
    process.client && window.location.reload()
  }

  private onChainChanged(chainId: number) {
    // console.log('DappContext.onChainChanged', chainId)
    this._eventHandler.onNetworkChanged?.(chainId)
    process.client && window.location.reload()
  }

  private onConnect(connectInfo: { chainId: string }) {
    // console.log('DappContext.onConnect', connectInfo.chainId)
    this.isConnected = true
    this._eventHandler.onConnected?.()
  }

  private onDisconnect(error: ProviderRpcError) {
    // console.log('DappContext.onDisconnect', error);
    this.isConnected = false
    this._eventHandler.onDisconnect?.()
  }

  public async init(): Promise<boolean> {
    const provider = await detectEthereumProvider()

    if (provider) {
      this._web3Provider = new ethers.providers.Web3Provider(
        provider as any,
        parseInt(this._chainId)
      )
      ;(this._web3Provider.provider as any).on(
        'accountsChanged',
        this.onAccountsChanged.bind(this)
      )
      ;(this._web3Provider.provider as any).on(
        'chainChanged',
        this.onChainChanged.bind(this)
      )
      ;(this._web3Provider.provider as any).on(
        'connect',
        this.onConnect.bind(this)
      )
      ;(this._web3Provider.provider as any).on(
        'disconnect',
        this.onDisconnect.bind(this)
      )

      this.isInstalled = true
    } else {
      // console.log('Please install MetaMask!');
    }

    return this.isInstalled
  }

  public async connect(): Promise<boolean> {
    if (this.isInstalled == false) {
      const installed = await this.init()
      if (installed == false) {
        return false
      }
    }

    if (this._web3Provider) {
      try {
        const currentChainId = await this._web3Provider.send('eth_chainId', [])
        if (this.SupportChains.some((v) => v === currentChainId)) {
          this.connectedAccounts = await this._web3Provider.send(
            'eth_requestAccounts',
            []
          )
          this.isConnected = true

          this.Shale = new Shale(this._web3Provider, SHALE_CONTRACT_ADDRESS)

          // console.log('DappContext.requestAccount', this.connectedAccounts);
          return true
        } else if (await this.switchNetwork(this._chainId)) {
          this.connectedAccounts = await this._web3Provider.send(
            'eth_requestAccounts',
            []
          )
          // console.log('DappContext.requestAccount', this.connectedAccounts);
          return true
        }
      } catch (error) {
        console.error(error)
      }
    }

    return false
  }

  public async switchNetwork(chainId: string): Promise<boolean> {
    if (this._web3Provider) {
      try {
        await this._web3Provider.send('wallet_switchEthereumChain', [
          { chainId },
        ])
        return true
      } catch (error) {
        console.error('wallet_switchEthereumChain', error)
      }
    }
    return false
  }
}
