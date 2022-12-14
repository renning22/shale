import { ethers, network, config } from "hardhat";
import util from 'util';
import fa from '@glif/filecoin-address';

async function callRpc(method: any, params?: any) {
  var options = {
    method: "POST",
    url: "https://wallaby.node.glif.io/rpc/v0",
    // url: "http://localhost:1234/rpc/v0",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: 1,
    }),
  };

  const request = util.promisify(require("request"));
  const res = await request(options);
  return JSON.parse(res.body).result;
}

async function main() {
  const accounts: any = network.config.accounts;
  const deployer = new ethers.Wallet(accounts[0]);
  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.delegatedFromEthAddress(deployer.address).toString();

  console.log("priorityFee:", priorityFee);
  console.log("Wallet Ethereum Address:", deployer.address);
  console.log("Wallet f4Address: ", f4Address)

  const Shale = await ethers.getContractFactory("Shale");
  const shale = await Shale.deploy({ maxPriorityFeePerGas: priorityFee });

  await shale.deployed();

  console.log(`Shale deployed ${shale.address} (f4: ${fa.delegatedFromEthAddress(shale.address).toString()})`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
