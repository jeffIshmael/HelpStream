"use client";

import { contractAbi, contractAddress } from "@/Blockchain/abi/HelpStream";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { processCheckout } from "@/lib/TokenTransfer";
import { getBalance } from "@/lib/CheckBalance";

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

interface FundModalProps {
  id: number;
  title: string;
  remaining: number;
  loading: boolean; // Accept loading as a prop
  setLoading: (loading: boolean) => void; // Function to update loading state
}

const FundModal = ({
  id,
  title,
  remaining,
  loading, // Now passed as a prop
  setLoading,
}: FundModalProps) => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [balance, setBalance] = useState(0);
  const { data: stream } = useReadContract({
    abi: contractAbi,
    address: contractAddress,
    functionName: "getHelpStream",
    args: [BigInt(id)],
  });
  const router = useRouter();

  const details = (stream as Stream) || null;

  useEffect(() => {
    if (details) {
      console.log(details);
    }
  }, [details]);

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

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (address === details?.creator) {
      toast.error("You cannot fund your own helpstream");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    console.log(details.creator);

    if (Number(data.amount) > remaining) {
      toast(`Input amount not exceeding ${remaining} cUSD`);
      return;
    }

    if (details.fullyFunded == true){
      toast.error("Stream is fully funded.");
      return;
    }

    try {
      setLoading(true); // Set loading state when processing starts
      const paid = await processCheckout(
        details.creator as `0x${string}`,
        Number(data.amount)*10**18
      );

      if (paid) {
        try {
          const hash = await writeContractAsync({
            address: contractAddress,
            abi: contractAbi,
            functionName: "fund",
            args: [BigInt(id), BigInt(Number(data.amount) * 10 ** 18)],
          });
          toast.success("Funded successfully!");
          setLoading(false);
          router.refresh();
          console.log(hash);
        } catch (error) {
          toast.error("Error while funding the stream");
          console.log(error);
        }
      } else{
        toast.error("Error while funding the stream");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // Reset loading state when done
    }
  }

  return (
    <form onSubmit={submit}>
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p>Amount remaining: {remaining} cUSD</p>
  
      <div className="space-y-4">
        <input
          required
          className="border border-gray-300 rounded-md p-2 w-full"
          placeholder="Enter Amount"
          name="amount"
          type="number"
          step={0.001}  
          min={0.01}
        />
        <p className="flex justify-end text-gray-500">
          Balance: {(balance / 10 ** 18).toFixed(2)} cUSD
        </p>
  
        <button
          type="submit"
          disabled={loading}  
          className={`w-full bg-primary text-gray-700 bg-another py-2 rounded-md ${
            loading ? "opacity-30 cursor-not-allowed hover:opacity-30" : "hover:opacity-80"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center text-gray-800">
              Funding
              <svg
                className="animate-spin h-5 w-5 text-gray-800 ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
          ) : (
            "Fund this Stream"
          )}
        </button>
      </div>
    </div>
    
  </form>
  
  );
};

export default FundModal;
