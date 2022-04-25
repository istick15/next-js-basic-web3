import React, { Fragment, useEffect, useState } from "react";
import MetaMaskOnboarding from "@metamask/onboarding";
import { useWeb3React } from "@web3-react/core";
import { connectors } from "../connector";
import { parseCookies, setCookie } from "nookies";
import { tokenMeta } from "../assets/tokenList";
import { useBalance } from "../hooks/useBalance";
import { isValidChecksumAddress } from "ethereumjs-util";
import { ZERO_ADDRESS } from "../utilities";
import Web3 from "web3";
import ERC20ABI from "../assets/abi-erc20.json";

interface IState {
  networkID: any;
}
interface Idata {
  token: number;
  to: string;
  amount: any;
}
const Metamask = () => {
  const { activate, deactivate, active, library, account } = useWeb3React();
  const { isMetaMaskInstalled } = MetaMaskOnboarding;
  const [state, setState] = useState<IState>({ networkID: null });
  const [data, setData] = useState<Idata>({ token: 0, to: "", amount: 0 });
  const [balance] = useBalance({
    tokenAddress: tokenMeta[data.token].address,
    decimals: tokenMeta[data.token].decimals,
  });

  const onConnectMetaMask = async () => {
    activate(connectors.injected);

    const { ethereum } = window as any;
    const networkId = await ethereum.request({
      method: "net_version",
    });
    setState({ ...state, networkID: networkId });
    setCookie(null, "provider", "injected", { path: "/" });
  };

  const onDisconnect = () => {
    deactivate();
  };

  const handleNewNetwork = (networkId: any) => {
    setState({ ...state, networkID: Number(networkId) });
  };
  useEffect(() => {
    const cookies = parseCookies();
    cookies.provider && activate(connectors[cookies.provider]);

    const { ethereum } = window as any;
    if (ethereum) {
      const getNetwork = async () => {
        if (cookies.provider) {
          const networkId = await ethereum.request({
            method: "net_version",
          });

          handleNewNetwork(networkId);
        }
      };
      getNetwork();

      ethereum.on("chainChanged", handleNewNetwork);
    }
  }, []);

  const sendTranfer = async () => {
    if (tokenMeta[data.token].address === ZERO_ADDRESS) {
      const txtHash = await library?.eth.sendTransaction({
        from: account,
        to: data.to,
        value: Web3.utils.toWei(data.amount, "ether"),
      });

      //   const pending = library?.eth.getPendingTransactions();
      //   console.log(pending);
      if (txtHash) {
        console.log(txtHash);
        alert("Transaction complete !!!!!!");
      }
    } else {
      const contract = new library.eth.Contract(
        ERC20ABI,
        tokenMeta[data.token].address
      );

      const ddd = await contract.methods
        .transfer(data.to, Web3.utils.toWei(data.amount, "ether"))
        .send({
          from: account,
        });

      if (ddd) {
        alert("Transaction complete !!!!!!");
      }
    }
  };

  return (
    <Fragment>
      {isMetaMaskInstalled() ? (
        active ? (
          <button onClick={() => onDisconnect()}>Disconnect</button>
        ) : (
          <button onClick={() => onConnectMetaMask()}>Connect wallet</button>
        )
      ) : (
        <button>Install MetaMask</button>
      )}

      {active && (
        <div style={{ marginTop: "2rem" }}>
          <p>network : {state.networkID}</p>
          <p>balance : {balance}</p>
          <select
            id="token"
            value={data.token}
            onChange={(e) =>
              setData({ ...data, token: Number(e.target.value) })
            }
          >
            {tokenMeta.map((token, index) => {
              return (
                <option key={token.address} value={index}>
                  {token.name}
                </option>
              );
            })}
          </select>
          <br />
          <br />
          <p>Transfer</p>
          <input
            type="text"
            id="to"
            value={data.to}
            onChange={(e) => setData({ ...data, to: e.target.value })}
            style={{ width: 400 }}
            placeholder="address"
          />
          <br></br>
          <input
            type="number"
            id="amount"
            value={data.amount}
            onChange={(e) => {
              if (Number(e.target.value) <= Number(balance)) {
                setData({ ...data, amount: e.target.value });
              }
            }}
            style={{ width: 400 }}
          />
          <button
            disabled={!isValidChecksumAddress(data.to)}
            onClick={() => sendTranfer()}
          >
            send
          </button>
        </div>
      )}
    </Fragment>
  );
};

export default Metamask;
