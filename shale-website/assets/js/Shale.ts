import { Interface } from '@ethersproject/abi'
import { Web3Provider } from '@ethersproject/providers'
import { BigNumber, ethers } from 'ethers'
import ContractWrapper from './ContractWrapper'

export enum EGoodStatus {
  Default,
  Listed,
  ToBeInitialize,
  InUse,
  End,
}

export interface IDatasetOrImage {
  cid: string
  filename: string
}
export interface ViewMinerInfo {
  miner: string
  datasets: IDatasetOrImage[]
  images: IDatasetOrImage[]
}

export interface DatasetOption {
  label: string
  value: string
}

// Union the fields of product and orders
export type ShaleItemType = 'Order' | 'Product'
export interface ShaleItem {
  Type: ShaleItemType
  OrderId?: string
  User?: string
  EthUser?: string // user eth address
  OrderBalance?: BigNumber
  LoginInfo?: string
  UserInfo?: UserInfo
  ProductId: string
  Owner: string
  EthOwner: string
  FixedPrice: BigNumber
  Specs: ShaleSpec
  Status: EGoodStatus // [Product/Order] status
  // other info
  CreateOn?: number
  BeginOn?: number
  FinishOn?: number
  MinerInfo?: ViewMinerInfo
}

export interface ShaleOrder {
  OrderId: string
  User: string
  ProductId: string
  ProductOwner: string
  ProductSpecs: ShaleSpec
  ProductFixedPrice: BigNumber
  OrderBalance: BigNumber
  LoginInfo: string
  UserInfo: string
  Confirm: boolean
  BeginOn: number
  FinishOn: number
  CreateOn: number
}

export interface ShaleProduct {
  ProductId: string
  Specs: ShaleSpec
  FixedPrice: BigNumber
  Owner: string
  Used: boolean
  Listed: boolean
}

export interface ShaleSpec {
  data: string
  cpu: {
    cores: string
    frequency: string
  }
  gpu: {
    process: string
    vram: string
  }
  ram: {
    total: string
  }
  disk: {
    total: string
    free: string
  }
}

export function instanceOfShaleSpec(obj: any): obj is ShaleSpec {
  if (typeof obj != 'object') return false
  return 'cpu' in obj && 'gpu' in obj && 'ram' in obj && 'disk' in obj
}

export interface UserInfo {
  pubkey: string
  dataset: IDatasetOrImage
  image: IDatasetOrImage
  [key: string]: any
}

export default class Shale extends ContractWrapper {
  protected readonly _interface: Interface
  private readonly _abi = [
    'function putProduct(uint256 fixedPrice,string specs) returns (uint256)',
    'function takeProduct(uint256 productId,uint256 hrs,string userInfo) view returns (uint256)',
    'function setupOrder(uint256 orderId,bool confirm,string loginInfo)',
    'function closeOrder(uint256 orderId)',
    'function modifyProduct(uint256 productId,bool listed)',
    'function getOrder(uint256 orderId) view returns (tuple(uint256 OrderId,address User,uint256 ProductId,address ProductOwner,string ProductSpecs,uint256 ProductFixedPrice,uint256 OrderBalance,string LoginInfo,string UserInfo,bool Confirm,uint256 BeginOn,uint256 FinishOn,uint256 CreateOn))',
    'function getProduct(uint256 productId) view returns (tuple(uint256 ProductId,string Specs,uint256 FixedPrice,address Owner,bool Used,bool Listed))',
    'function getRentOutProduct(address addr) view returns (tuple(uint256 ProductId,string Specs,uint256 FixedPrice,address Owner,bool Used,bool Listed)[])',
    'function getRentOutOrders(address addr) view returns (tuple(uint256 OrderId,address User,uint256 ProductId,address ProductOwner,string ProductSpecs,uint256 ProductFixedPrice,uint256 OrderBalance,string LoginInfo,string UserInfo,bool Confirm,uint256 BeginOn,uint256 FinishOn,uint256 CreateOn)[])',
    'function getRentOrders(address addr) view returns (tuple(uint256 OrderId,address User,uint256 ProductId,address ProductOwner,string ProductSpecs,uint256 ProductFixedPrice,uint256 OrderBalance,string LoginInfo,string UserInfo,bool Confirm,uint256 BeginOn,uint256 FinishOn,uint256 CreateOn)[])',
    'function getMarketList(address owner) view returns (tuple(uint256 ProductId,string Specs,uint256 FixedPrice,address Owner,bool Used,bool Listed)[])',
  ]

  constructor(web3Provider_: Web3Provider, address_: string) {
    super(web3Provider_, address_)
    this._interface = new Interface(this._abi)
  }

  /**
   * @param fixedPrice FIL/H/Instance
   * @param spec Machine info
   * @returns tx hash
   */
  public putProduct(
    fixedPrice: number | string,
    spec: ShaleSpec
  ): Promise<string> {
    if (typeof fixedPrice === 'number') {
      fixedPrice = fixedPrice.toString()
    }

    return this.write('putProduct', [
      ethers.utils.parseEther(fixedPrice),
      JSON.stringify(spec),
    ])
  }

  /**
   * @param productId
   * @param hrs
   * @param userInfo
   * @returns tx hash
   */
  public async takeProduct(
    productId: number | string,
    hrs: number | string,
    userInfo: UserInfo
  ): Promise<string> {
    if (typeof productId === 'number') {
      productId = productId.toString()
    }

    if (typeof hrs === 'number') {
      hrs = hrs.toString()
    }

    const product = await this.getProduct(productId)
    const fixedPrice = ethers.utils.formatEther(product.FixedPrice)
    const payment = (parseFloat(fixedPrice) * parseFloat(hrs)).toString()

    return this.write(
      'takeProduct',
      [productId, hrs, JSON.stringify(userInfo)],
      ethers.utils.parseEther(payment).toHexString()
    )
  }

  /**
   * @param orderId OrderID
   * @param confirm
   * @param loginInfo
   * @returns tx hash
   */
  public setupOrder(
    orderId: number | string,
    confirm: boolean,
    loginInfo: string
  ): Promise<string> {
    if (typeof orderId === 'number') {
      orderId = orderId.toString()
    }

    return this.write('setupOrder', [orderId, confirm, loginInfo])
  }

  /**
   * @param orderId OrderID
   * @returns tx hash
   */
  public closeOrder(orderId: number | string): Promise<string> {
    if (typeof orderId === 'number') {
      orderId = orderId.toString()
    }

    return this.write('closeOrder', [orderId])
  }

  /**
   * @param productId
   * @param listed
   * @returns tx hash
   */
  public modifyProduct(
    productId: number | string,
    listed: boolean
  ): Promise<string> {
    if (typeof productId === 'number') {
      productId = productId.toString()
    }

    return this.write('modifyProduct', [productId, listed])
  }

  /**
   * @param orderId OrderID
   * @returns Order
   */
  public async getOrder(orderId: number | string): Promise<ShaleOrder> {
    const result = await this.read('getOrder', [orderId])

    return this.toShaleOrder(result[0])
  }

  /**
   * @param orderId OrderID
   * @returns Order Info
   */
  public async getProduct(productId: number | string): Promise<ShaleProduct> {
    const result = await this.read('getProduct', [productId])

    return this.toShaleProduct(result[0])
  }

  /**
   * @param addr
   * @returns
   */
  public async getRentOutProduct(addr: string): Promise<ShaleProduct[]> {
    const result = await this.read('getRentOutProduct', [addr])

    if (result && result.length > 0) {
      return result[0]
        .map((c: any) => this.toShaleProduct(c))
        .sort(
          (a: ShaleProduct, b: ShaleProduct) =>
            parseInt(b.ProductId) - parseInt(a.ProductId)
        )
    } else {
      return []
    }
  }

  /**
   * @param addr
   * @returns
   */
  public async getRentOutOrders(addr: string): Promise<ShaleOrder[]> {
    const result = await this.read('getRentOutOrders', [addr])

    if (result && result.length > 0) {
      return result[0]
        .map((c: any) => this.toShaleOrder(c))
        .sort((a: ShaleOrder, b: ShaleOrder) => b.CreateOn - a.CreateOn)
    } else {
      return []
    }
  }

  /**
   * @param addr
   * @returns
   */
  public async getRentOrders(addr: string): Promise<ShaleOrder[]> {
    const result = await this.read('getRentOrders', [addr])

    if (result && result.length > 0) {
      return result[0]
        .map((c: any) => this.toShaleOrder(c))
        .sort((a: ShaleOrder, b: ShaleOrder) => b.CreateOn - a.CreateOn)
    } else {
      return []
    }
  }

  /**
   * @param addr
   * @returns
   */
  public async getMarketList(
    owner: string = '0x0000000000000000000000000000000000000000'
  ): Promise<ShaleProduct[]> {
    const result = await this.read('getMarketList', [owner])

    if (result && result.length > 0) {
      return result[0]
        .filter((p: any) => p.Listed)
        .map((c: any) => this.toShaleProduct(c))
        .sort(
          (a: ShaleProduct, b: ShaleProduct) =>
            parseInt(b.ProductId) - parseInt(a.ProductId)
        )
    } else {
      return []
    }
  }

  private toShaleProduct(result: ethers.utils.Result): ShaleProduct {
    return {
      ProductId: (<BigNumber>result[0]).toString(),
      Specs: JSON.parse(<string>result[1]),
      FixedPrice: <BigNumber>result[2],
      Owner: <string>result[3],
      Used: <boolean>result[4],
      Listed: <boolean>result[5],
    }
  }

  private toShaleOrder(result: ethers.utils.Result): ShaleOrder {
    return {
      OrderId: (<BigNumber>result[0]).toString(),
      User: <string>result[1],
      ProductId: (<BigNumber>result[2]).toString(),
      ProductOwner: <string>result[3],
      ProductSpecs: JSON.parse(<string>result[4]),
      ProductFixedPrice: <BigNumber>result[5],
      OrderBalance: <BigNumber>result[6],
      LoginInfo: <string>result[7],
      UserInfo: <string>result[8],
      Confirm: <boolean>result[9],
      BeginOn: (<BigNumber>result[10]).toNumber(),
      FinishOn: (<BigNumber>result[11]).toNumber(),
      CreateOn: (<BigNumber>result[12]).toNumber(),
    }
  }
}
