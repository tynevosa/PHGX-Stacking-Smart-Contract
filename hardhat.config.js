/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");

const endpointUrl = "https://sepolia.infura.io/v3/b9a8f4aa04924f3a976274ffcc4fc343"
const privateKey = ""

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: endpointUrl,
      accounts: [privateKey]
    }
  }
};
