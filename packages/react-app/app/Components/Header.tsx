"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getBalance } from "@/lib/CheckBalance";

export default function Header() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const [balance, setBalance] = useState(0);
  const [shouldAutoConnect, setShouldAutoConnect] = useState(true);

  // useEffect(() => {
  //   if (shouldAutoConnect && !isConnected && openConnectModal) {
  //     openConnectModal();
  //   }
  // }, [shouldAutoConnect, isConnected, openConnectModal]);

  useEffect(() => {
    if (isConnected && address) {
      const fetchBalance = async () => {
        const result = await getBalance(address);
        if (result !== null) {
          setBalance(result);
        } else {
          console.error("Error fetching balance: result is null");
        }
      };
      fetchBalance();
    }
  }, [isConnected, address]);

  const handleConnectClick = () => {
    setShouldAutoConnect(false); // Disable auto-connect on manual action
    if (openConnectModal) openConnectModal();
  };

  // Helper function to format the address
  const formatAddress = (addr: `0x${string}`) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div>
      <div className="flex items-center space-x-6 md:hidden justify-center mt-2">
        {isConnected && (
          <div className="relative flex items-center space-x-2 bg-gray-100 p-2 rounded-md shadow-md">
            {/* Wallet Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
            </svg>
            {/* Wallet Balance */}
            <p className="text-gray-800 font-medium">
              {(Number(balance) / 10 ** 18).toFixed(2)} cUSD
            </p>
          </div>
        )}

        {/* Custom Connect and Disconnect Button */}
        <button
          onClick={isConnected ? () => disconnect() : handleConnectClick}
          className="text-gray-600 border border-rounded-md border-another p-2 hover:shadow-lg shadow-gray hover:bg-gray-300 rounded-full"
        >
          {isConnected && address ? `Disconnect (${formatAddress(address)})` : "Connect Wallet"}
        </button>
      </div>
      <nav className="flex items-center justify-between py-4 px-8">
        <div className="flex space-x-6">
          <Link
            href="/Create"
            className="text-gray-600 border border-rounded-md border-another p-2 hover:shadow-lg shadow-gray hover:bg-gray-300 rounded-full animate-bounce"
          >
            Start a helpStream
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Image
              src="/static/images/logo.png"
              alt="Logo"
              width={200}
              height={200}
            />
          </Link>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center space-x-6">
            {isConnected && (
              <div className="relative flex items-center space-x-2 bg-gray-100 p-2 rounded-md shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-gray-700"
                >
                  <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
                </svg>
                <p className="text-gray-800 font-medium">
                  {(Number(balance) / 10 ** 18).toFixed(2)} cUSD
                </p>
              </div>
            )}
            <button
              onClick={isConnected ? () => disconnect() : handleConnectClick}
              className="text-white border border-rounded-md bg-another p-2 hover:shadow-lg shadow-gray hover:opacity-80 rounded-full"
            >
              {isConnected && address ? `Disconnect (${formatAddress(address)})` : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
