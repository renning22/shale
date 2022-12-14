import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const PRIVATE_KEY = process.env.PRIVATE_KEY

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    wallaby: {
      url: 'https://wallaby.node.glif.io/rpc/v0',
      accounts: [PRIVATE_KEY || ''],
    }
  }
};

export default config;
