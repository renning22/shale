import { delegatedFromEthAddress } from '@glif/filecoin-address'
import {
  ShaleOrder,
  ShaleProduct,
  ShaleItem,
  UserInfo,
  ShaleItemType,
  EGoodStatus,
  ViewMinerInfo,
  IDatasetOrImage,
} from '@/assets/js/Shale'
import { miners, datasets, images } from '@/assets/json/dataset.json'

type ShaleMixed = ShaleOrder | ShaleProduct

export function copyToItem<T extends ShaleMixed>(
  info: T,
  itemType: ShaleItemType
): ShaleItem {
  let item: ShaleItem
  let status: EGoodStatus = EGoodStatus.Default
  const isOrder = 'OrderId' in info
  if (!isOrder && info.Listed) {
    status = EGoodStatus.Listed
  } else if (isOrder) {
    if (!info.Confirm && info.FinishOn == 0) {
      status = EGoodStatus.ToBeInitialize
    } else if (info.Confirm && info.FinishOn == 0) {
      status = EGoodStatus.InUse
    } else if (info.FinishOn > 0) {
      status = EGoodStatus.End
    }
  }

  if (isOrder) {
    let userInfo: UserInfo = {
      pubkey: '',
      dataset: { cid: '', filename: '' },
      image: { cid: '', filename: '' },
    }
    let minerInfo: ViewMinerInfo = { miner: '', datasets: [], images: [] }
    try {
      userInfo = JSON.parse(info.UserInfo)
      minerInfo = JSON.parse(info.ProductSpecs.data)
    } catch (err) {
      // ...
    }
    // is order
    item = {
      ...info,
      ProductId: info.ProductId,
      Owner: delegatedFromEthAddress(info.ProductOwner),
      EthOwner: info.ProductOwner,
      User: delegatedFromEthAddress(info.User),
      EthUser: info.User,
      FixedPrice: info.ProductFixedPrice,
      Specs: info.ProductSpecs,
      Status: status,
      UserInfo: userInfo,
      MinerInfo: minerInfo,
      Type: itemType,
    }
  } else {
    let minerInfo: ViewMinerInfo = { miner: '', datasets: [], images: [] }
    try {
      minerInfo = JSON.parse(info.Specs.data)
    } catch (err) {
      // ...
    }
    item = {
      ...info,
      Owner: delegatedFromEthAddress(info.Owner),
      EthOwner: info.Owner,
      Status: status,
      MinerInfo: minerInfo,
      Type: itemType,
    }
  }
  return item
}

export function addrFilter(address: string): string {
  if (!address) return address
  return address.slice(0, 5) + '...' + address.slice(-4)
}

export function cidFilter(
  cid: string,
  len: [front: number, tail: number] = [4, 4]
): string {
  if (!cid) return cid
  return cid.slice(0, len[0]) + '...' + cid.slice(-len[1])
}

export const MINERS: string[] = miners
export const DATASETS: IDatasetOrImage[] = datasets
export const IMAGES: IDatasetOrImage[] = images

export async function sleepSomeTime(msTime: number = 300): Promise<void> {
  let resolve: () => void
  const p = new Promise<void>((rs) => {
    resolve = rs
  })
  setTimeout(() => {
    resolve()
  }, msTime)
  return p
}

export function getDatasetsOrImages(cids: string[]): IDatasetOrImage[] {
  const list = [...DATASETS, ...IMAGES]
  const cidToList: { [cid: string]: IDatasetOrImage } = {}
  list.forEach((item) => {
    cidToList[item.cid] = item
  })
  const ans: IDatasetOrImage[] = []
  cids.forEach((cid) => {
    if (cidToList[cid]) {
      ans.push(cidToList[cid])
    }
  })
  return ans
}

export const scrollToTop = () => {
  if (process.server) return
  let sTop = document.documentElement.scrollTop || document.body.scrollTop
  if (sTop > 0) {
    window.requestAnimationFrame(scrollToTop)
    window.scrollTo(0, sTop - sTop / 8)
  }
}
