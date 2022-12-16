export const SHALE_CONTRACT_ADDRESS =
  '0x23AFd158DCb69268B4DB5834Dc59Fde0B7759CC2'

export const getMinerBrowserUrl = (miner?: string): string => {
  if (!miner) return ''
  return `https://wallaby.filfox.info/en/address/${miner}`
}
