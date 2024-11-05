"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import FundModal from "./FundModal";
import { useAccount, useWriteContract } from "wagmi";
import { contractAbi, contractAddress } from "@/Blockchain/abi/HelpStream";
import { toast } from "sonner";

import EditModal from "./EditModal";
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

const StreamCard = ({
  streamDetails,
  index,
}: {
  streamDetails: Stream;
  index: number;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Lifting loading state
  const [percentage, setPercentage] = useState(0);
  const [fullyFunded, setFullyFunded] = useState(false);
  const { writeContractAsync, isPending } = useWriteContract();
  const { address, isConnected } = useAccount();
  const [whoCreated, setWhoCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);

  useEffect(() => {
    const getPercentage = () => {
      const goal = Number(streamDetails.targetAmount);
      const raised = Number(streamDetails.raisedAmount);
      const result = (raised / goal) * 100;
      setPercentage(result);
      if (result === 100 || streamDetails.fullyFunded == true) {
        setFullyFunded(true);
      }
      // Set who created
      if (streamDetails.creator == address) {
        setWhoCreated(true);
      }
    };
    getPercentage();
  }, []);

  useEffect(() => {
   for(let i = 0 ; i < streamDetails.contributors.length; i++){
    if(streamDetails.contributors[i] == address){
      setHasContributed(true);
    }
   }
  }, [streamDetails]);

  useEffect(() => {
    if (isConnected && address) {
      console.log(address);
    }
  }, [isConnected, address]);

  // Delete handler
  const handleDelete = async (id: number, creatorAddress: string) => {
    console.log(id);
    console.log(creatorAddress);
    console.log(address);
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    if (address !== creatorAddress) {
      toast.error("Only the creator can delete");
      return;
    }

    try {
      setIsLoading(true); // Set loading state when processing starts
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: "deleteHelpStream",
        args: [BigInt(id)],
      });
      toast("Successfully deleted!", {
        description: "Reload page.",
      });
      setIsLoading(false);
      console.log(hash);
    } catch (error) {
      toast.error("Error occured, try again.");
      console.log(error);
    } finally {
      setIsLoading(false); // Reset loading state when done
    }
  };

  return (
    <div className="relative group">
      {" "}
      {/* Add relative and group class */}
      {/* Delete Icon */}
      {whoCreated && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 absolute top-1 right-1 text-red-600 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300"
          onClick={async (event) => {
            await handleDelete(index, streamDetails.creator);
            console.log("Delete successful");
          }}
        >
          <path
            fillRule="evenodd"
            d="M9.75 3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v1.5h5.25a.75.75 0 0 1 0 1.5h-.416l-.508 12.178a3.75 3.75 0 0 1-3.744 3.572H8.918a3.75 3.75 0 0 1-3.744-3.572L4.666 6H4.25a.75.75 0 0 1 0-1.5H9.75V3Zm1.5 1.5h3V4.5h-3V4.5ZM7.166 6l.508 12.14a2.25 2.25 0 0 0 2.246 2.14h5.138a2.25 2.25 0 0 0 2.246-2.14L16.834 6H7.166Zm2.084 3.5a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .745.753l-.005 7.75a.75.75 0 1 1-1.5 0l.005-7.75Zm4.5-.75a.75.75 0 0 1 .75.75v7.75a.75.75 0 0 1-1.5 0v-7.75a.75.75 0 0 1 .75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <div
        className={`bg-white rounded-lg shadow-md p-6 space-y-4 w-full min-h-[400px] flex flex-col justify-between ${
          fullyFunded ? "border border-another" : ""
        }`}
      >
        <Link href={`/Stream/${index}`}>
          {/* Image */}
          <div className="h-48 w-full relative">
            <Image
              src={`https://ipfs.io/ipfs/${streamDetails.ipfsHash}`}
              alt={"Stream Image"}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
          {/* Content */}
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {streamDetails.title}
            </h3>
            {/* Description */}
            <p className="text-sm text-gray-500 max-h-16 overflow-hidden">
              {streamDetails.description}
            </p>
            {/* Progress */}
            <div>
              <h1 className="text-sm font-medium text-gray-900 flex justify-end">
                {percentage}%
              </h1>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-normal text-gray-600 mt-2">
              <div>
                Goal: {Number(streamDetails.targetAmount) / 10 ** 18} cUSD
              </div>
              <div>
                Raised: {Number(streamDetails.raisedAmount) / 10 ** 18} cUSD
              </div>
            </div>
          </div>
        </Link>
        {/* Button */}
        {fullyFunded ? (
          <div className="flex justify-center items-center hover:cursor-not-allowed bg-gray-500 w-full py-2 rounded-md text-sm font-medium text-white">
            <span>Fully funded</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-2 h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : (
          <button
            onClick={
              whoCreated ? () => setEditOpen(true) : () => setModalOpen(true)
            }
            className={` w-full py-3 rounded-md text-normal font-medium text-gray-700  ${
              whoCreated
                ? "border border-another hover:bg-gray-300"
                : "bg-another hover:bg-opacity-80"
            }`}
          >
            {whoCreated ? "Edit helpstream" : hasContributed ? "Fund again": "Fund this HelpStream"}
          </button>
        )}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Close Button */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-6 h-6 text-gray-900  rounded-lg bg-gray-300  absolute top-20 right-50  ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-another hover:text-gray-700"
            }`}
            onClick={!loading ? () => setModalOpen(false) : undefined} // Prevent closing when loading
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
          <FundModal
            id={Number(index)}
            title={streamDetails.title}
            remaining={Number(streamDetails.remaining) / 10 ** 18}
            setLoading={setLoading} // Pass setLoading as a prop
            loading={loading}
          />
        </div>
      )}
      {editOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          {/* Close Button */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-6 h-6 text-gray-900  rounded-lg bg-gray-300  absolute top-5 right-50  ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-another hover:text-gray-700"
            }`}
            onClick={!loading ? () => setEditOpen(false) : undefined} // Prevent closing when loading
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
          <EditModal
            id={Number(index)}
            title={streamDetails.title}
            ipfsHash={streamDetails.ipfsHash}
            description={streamDetails.description}
            targetAmount={streamDetails.targetAmount}
            setLoading={setLoading} // Pass setLoading as a prop
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default StreamCard;
