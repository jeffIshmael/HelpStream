"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { getBalance } from "@/lib/CheckBalance";

export default function Header() {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!isConnected) {
      // connect({ connector: injected({ target: "metaMask" }) });
    }
  }, [isConnected]);

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

            {/* Tag Icon positioned absolutely */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2 w-6 h-6 text-gray-700"
            >
              <path
                fillRule="evenodd"
                d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Connect Button */}
        <ConnectButton chainStatus="none" showBalance={false} />
      </div>
      <nav className="flex items-center justify-between py-4 px-8">
        {/* Navigation Links */}
        <div className="flex space-x-6">
          <Link
            href="/Create"
            className="text-gray-600 border border-rounded-md border-another p-2 hover:shadow-lg shadow-gray hover:bg-gray-300 rounded-full animate-bounce"
          >
            Start a helpStream
          </Link>
        </div>
        {/* Logo */}
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

        {/* Wallet and ConnectButton Section */}
        <div className="hidden sm:block">
          <div className="flex items-center space-x-6 ">
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
                {/* Tag Icon positioned absolutely */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2 w-6 h-6 text-gray-700"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {/* Connect Button */}
            <ConnectButton chainStatus="none" showBalance={false} />
          </div>
        </div>
      </nav>
    </div>
  );
}
