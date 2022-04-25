import { useState, useEffect } from "react";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { useWeb3React } from "@web3-react/core";
import { web3BNToFloatString, ZERO_ADDRESS } from "../utilities";
import ERC20ABI from "../assets/abi-erc20.json";

export function getERC20Contract(tokenAddress: any, web3: any, account: any) {
  return web3
    ? new web3.eth.Contract(ERC20ABI, tokenAddress, {
        from: account,
      })
    : null;
}

interface IBalance {
  tokenAddress: string;
  decimals: any;
}

export const useBalance = ({ tokenAddress, decimals }: IBalance) => {
  const [balance, setBalance] = useState("0");

  const { account, library } = useWeb3React();

  useEffect(() => {
    let isCancelled = false;

    function getBalance() {
      return new Promise((resolve) => {
        if (!library || !tokenAddress) {
          resolve(new BN("0"));
          return;
        }
        try {
          if (tokenAddress === ZERO_ADDRESS) {
            library.eth
              .getBalance(account)
              .then((value: any) => {
                resolve(new BN(value));
              })
              .catch((error: any) => {
                resolve(new BN("0"));
              });
          } else {
            const contract = getERC20Contract(tokenAddress, library, account);
            contract?.methods
              .balanceOf(account)
              .call()
              .then((value: any) => {
                resolve(new BN(value));
              })
              .catch((error: any) => {
                resolve(new BN("0"));
              });
          }
        } catch (error) {
          resolve(new BN("0"));
        }
      });
    }

    async function run() {
      const bn = await getBalance();

      if (!isCancelled) {
        const pow = new BigNumber("10").pow(new BigNumber(decimals));
        setBalance(web3BNToFloatString(bn, pow, 4, BigNumber.ROUND_DOWN));
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, [tokenAddress, library, decimals, account]);

  return [balance];
};

export const showAddress = (address: string) => {
  return `${address.substring(0, 8)}....${address.substring(
    address.length - 8,
    address.length
  )}`;
};
