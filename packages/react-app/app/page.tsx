"use client";

import { contractAbi, contractAddress } from "@/Blockchain/abi/HelpStream";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

import StreamCard from "./Components/StreamCard";
import EditModal from "./Components/EditModal";
import Link from "next/link";


interface Stream {
  id: number;
  title: string;
  description: string;
  ipfsHash: string;
  targetAmount: number;
  raisedAmount: number;
  remaining: number;
  contributors: [];
  creator: string;
  fullyFunded: boolean;
}

export default function Home() {
  const [userAddress, setUserAddress] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const { address, isConnected } = useAccount();
  const { data, isPending, isError } = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: 'getAllHelpStreams',
    args: [],
  });

  const streams = (data as Stream[]) || [];

  // Ensure the component only mounts on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      setUserAddress(address);
    }
  }, [address, isConnected]);

  useEffect(() => {
    if (!isPending) {
      setLoading(false); // Set loading to false once data is fetched
    }
  }, [isPending]);

  // Avoid rendering content until the component is mounted
  if (!isMounted) {
    return null; // Render nothing on the server
  }

  return (
    <div> 
      <main className="flex-grow flex flex-col justify-center items-center">
        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            Loading ...
          </div>
        ) : (
          <>
            {!isConnected ? (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600">
                Connect your wallet to view available helpStreams.
              </div>
            ) : streams.length === 0 ? (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600">
                No helpStreams available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
                {streams.map((stream: Stream, id: number) => (
                  <div key={id}>
                    <StreamCard streamDetails={stream} index={id} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
