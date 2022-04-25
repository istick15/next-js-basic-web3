import { NextPage } from "next";
import React from "react";
import dynamic from "next/dynamic";
import { useWeb3React } from "@web3-react/core";
const MetaMask = dynamic(import("../components/metamask"), { ssr: false });

const Web3Basic: NextPage = () => {
  const { account } = useWeb3React();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <div>
        <p>Hi {account ? account : ""}</p>
        <MetaMask />
      </div>
    </div>
  );
};

export default Web3Basic;
