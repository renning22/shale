import { Web3Provider } from '@ethersproject/providers'
import { Interface, Result } from '@ethersproject/abi'
import { BigNumber, BigNumberish, ethers } from 'ethers'

export interface TransactionInput {
  to: string
  from: string
  value: string
  data: string
}

export default abstract class ContractWrapper {
  protected readonly address: string
  protected readonly web3Provider: Web3Provider

  protected abstract readonly _interface: Interface

  constructor(web3Provider_: Web3Provider, address_: string) {
    this.web3Provider = web3Provider_
    this.address = address_
  }

  protected async getConnectedAccount(): Promise<string> {
    const addresses: string[] = await this.web3Provider.send('eth_accounts', [])
    // console.log('getConnectedAccount', addresses);

    return addresses[0]
  }

  protected async read(methodName: string, params: any[]): Promise<Result> {
    const callData = this._interface.encodeFunctionData(methodName, params)
    // console.log(methodName + '.callData', callData);

    const input: TransactionInput = await this.buildDefaultTxInput(callData)
    // console.log(methodName + '.input', input);

    const result = await this.ethCall(input)
    // console.log(methodName + '.result', result);

    const decodedResult = this._interface.decodeFunctionResult(
      methodName,
      result
    )
    // console.log(methodName + '.decodedResult', decodedResult);

    return decodedResult
  }

  protected async write(
    methodName: string,
    params: any[],
    value?: string
  ): Promise<string> {
    const callData = this._interface.encodeFunctionData(methodName, params)
    // console.log(methodName + '.callData', callData);

    const input: TransactionInput = await this.buildDefaultTxInput(
      callData,
      value
    )
    // console.log(methodName + '.input', input);

    const txHash = await this.sendTransaction(input)
    // console.log(methodName + '.txHash', txHash);

    return txHash
  }

  protected fromWei(wei: BigNumber, unitName?: string | BigNumberish): number {
    return parseFloat(ethers.utils.formatUnits(wei, unitName))
  }

  protected ethCall(input: TransactionInput): Promise<string> {
    // console.log('eth_call:input', input);
    return this.web3Provider.send('eth_call', [input, 'latest'])
  }

  protected sendTransaction(input: TransactionInput): Promise<string> {
    // console.log('eth_sendTransaction:input', input);
    return this.web3Provider.send('eth_sendTransaction', [input])
  }

  protected buildTxInput(from: string, data: string, value?: string) {
    return {
      from: from, // must match user's active address.
      to: this.address, // Required except during contract publications.
      value: value ?? '0x0', // Only required to send ether to the recipient from the initiating external account.
      data: data, // Optional, but used for defining smart contract creation and interaction.
    } as TransactionInput
  }

  protected async buildDefaultTxInput(
    data: string,
    value?: string
  ): Promise<TransactionInput> {
    const from = await this.getConnectedAccount()
    return {
      from: from, // must match user's active address.
      to: this.address, // Required except during contract publications.
      value: value ?? '0x0', // Only required to send ether to the recipient from the initiating external account.
      data: data, // Optional, but used for defining smart contract creation and interaction.
    } as TransactionInput
  }
}
