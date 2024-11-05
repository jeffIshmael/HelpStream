"use client";

import { contractAbi, contractAddress } from "@/Blockchain/abi/HelpStream";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import EditModal from "@/app/Components/EditModal";
import FundModal from "@/app/Components/FundModal";
import { useParams, useRouter } from "next/navigation";

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

interface Comment {
  commenter: string;
  message: string;
  timestamp: number;
}
interface StreamPageParams {
  id: string;
}

const Page = () => {
  // const { params } = props;
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const { isConnected, address } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);
  const [funded, setFunded] = useState(false);
  const [localParam, setLocalParam] = useState(0);
  const router = useRouter();
  const params = useParams();

  const { data } = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "getHelpStream",
    args: [BigInt(localParam)],
  });

  const { data: texts } = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "getComments",
    args: [BigInt(localParam)],
  });

  const { writeContractAsync } = useWriteContract();

  const streamDetails = data as Stream;
  const comments = (texts as Comment[]) || [];

  useEffect(() => {
    if (isConnected && address) {
      console.log("Connected address:", address);
      console.log(comments);
      // console.log(Number(params.id));
    }
  }, [isConnected, address, params]);

  useEffect(() => {
    if (params) {
      console.log(params);
      setLocalParam(Number(params?.id));
      console.log(Number(params?.id));
      
    }
    console.log(localParam);
  }, [params]);

  useEffect(() => {
    if (streamDetails && comments) {
      console.log(streamDetails);
      console.log(comments);
      if (streamDetails.creator == address) {
        setIsCreator(true);
      }
      if (streamDetails.fullyFunded == true) {
        setFunded(true);
      }
    }
  }, [streamDetails, comments, params]);

  const submitComment = async () => {
    if (!isConnected) {
      toast("Please connect wallet.");
      return;
    }
    try {
      setLoading(true);
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: "addComment",
        args: [BigInt(localParam), newComment],
      });
      if (hash) {
        toast.success("Comment sent");
        setNewComment(""); // Clear comment input after submission
        setLoading(false);
      } else {
        toast.error("Something happened. Try again.");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to send comment. Try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    for (let i = 0; i < streamDetails?.contributors?.length; i++) {
      if (streamDetails.contributors[i] === address?.toString()) {
        setHasContributed(true);
      }
    }
  }, [streamDetails , params]);

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
      router.push("/");
    } catch (error) {
      toast.error("Error occured, try again.");
      console.log(error);
    } finally {
      setIsLoading(false); // Reset loading state when done
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (newComment.trim()) {
        submitComment();
      }
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          HelpStream Details
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="w-full lg:w-1/2">
            <Image
              src={`https://ipfs.io/ipfs/${streamDetails?.ipfsHash}`}
              height={400}
              width={400}
              alt="stream"
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {streamDetails?.title}
            </h2>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Target Amount:</span>{" "}
              {Number(streamDetails?.targetAmount) / 10 ** 18} cUSD
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">% Funded:</span>{" "}
              {(
                (Number(streamDetails?.raisedAmount) /
                  10 ** 18 /
                  (Number(streamDetails?.targetAmount) / 10 ** 18)) *
                100
              ).toFixed(2)}{" "}
              %
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Funded By:</span>{" "}
              {streamDetails?.contributors?.length} contributors
            </p>
            {funded ? (
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
                  isCreator
                    ? () => {
                        setEditOpen(true);
                      }
                    : () => {
                        setModalOpen(true);
                      }
                }
                className="mt-3 px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 ease-in-out"
              >
                {isCreator ? "Edit" : hasContributed ? "Fund again" : "Fund"}
              </button>
            )}

            {isCreator && (
              <button
                onClick={async (event) => {
                  await handleDelete(Number(localParam), streamDetails.creator);
                  console.log("Delete successful");
                }}
                className={`mt-3 ml-3 px-5 py-2  text-white rounded-lg  transition duration-200 ease-in-out ${
                  isLoading
                    ? "bg-gray-300 hover:cursor-not-allowed"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            )}
            <p className="text-gray-600 mt-6">
              <span className="font-semibold">Description:</span>{" "}
              {streamDetails?.description}
            </p>
          </div>
        </div>
        {/* Comments Section */}
        <div className="border-t border-gray-300 pt-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
            Comments
          </h3>
          {/* Comment Input */}
          <div className="mb-6">
            <textarea
              className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown} // Submit on Enter
            ></textarea>
            <button
              className={`mt-3 px-5 py-2  text-white rounded-lg  transition duration-200 ease-in-out ${ loading ? "bg-opacity-70 hover:cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
              onClick={submitComment}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Comment"}
            </button>
          </div>
          {/* Display previous comments */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={index} className="border-b border-gray-200 py-2">
                  <p className="text-gray-800">
                    <small>
                      {comment.commenter == address
                        ? "You"
                        : `${comment.commenter.slice(0, 6)}...
                      ${comment.commenter.slice(-4)}`}
                    </small>
                    :
                  </p>
                  <p className="text-gray-600">{comment.message}</p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(
                      new Date(Number(comment.timestamp) * 1000),
                      {
                        addSuffix: true,
                      }
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>
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
            id={Number(localParam)}
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
            id={Number(localParam)}
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

export default Page;
