"use client";

require("dotenv").config();
import React, { useRef, useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { contractAbi, contractAddress } from "@/Blockchain/abi/HelpStream";

interface EditModalProps {
  id: number;
  title: string;
  ipfsHash: string;
  description: string;
  targetAmount: number;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const EditModal = ({
  id,
  title,
  ipfsHash,
  description,
  targetAmount,
  loading,
  setLoading,
}: EditModalProps) => {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");
  const [upLoaded, setUpLoaded] = useState(false);
  const inputFile = useRef(null);
  const { writeContractAsync } = useWriteContract();
  const { address, isConnected } = useAccount();
  const [invalid, setInvalid] = useState(false);
  const router = useRouter();

  const initialValues = {
    title: title,
    ipfsHash: ipfsHash,
    description: description,
    targetAmount: Number(targetAmount) / 10 ** 18,
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if form values differ from initial values
  useEffect(() => {
    setHasChanges(JSON.stringify(formValues) !== JSON.stringify(initialValues));
  }, [formValues]);

  const uploadFile = async (fileToUpload: any) => {
    try {
      const data = new FormData();
      data.set("file", fileToUpload);
      const res = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const resData = await res.json();
      setCid(resData.IpfsHash);
      setUpLoaded(true);
    } catch (e) {
      console.log(e);
      alert("Trouble uploading file");
    }
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (invalid) {
      toast.error("Please upload JPG,PNG and GIF");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    // Validate the form data
    const title = formValues.title.toString().trim();
    const description = formValues.description.toString().trim();
    const targetAmount = Number(formValues.targetAmount);

    // Title validation
    if (title.length < 3 || title.length > 50) {
      toast.error("Title must be between 3 and 50 characters.");
      return;
    }

    // Description validation
    if (description.length < 10 || description.length > 200) {
      toast.error("Description must be between 10 and 200 characters.");
      return;
    }

    // Target amount validation
    if (targetAmount <= 0 || isNaN(targetAmount)) {
      toast.error("Target amount must be a positive number.");
      return;
    }

    try {
      setLoading(true);
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: "editHelpStream",
        args: [
          BigInt(id),
          title,
          upLoaded ? cid : formValues.ipfsHash,
          description,
          BigInt(targetAmount * 10 ** 18),
        ],
      });
      if (hash) {
        console.log(hash);
        toast(`${title} has been updated!`);
        setLoading(false);
        router.push("/");
      } else {
        toast("Something happened, try again.");
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to update, try again.");
      return;
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: any) => {
    const selectedFile = e.target.files[0];
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type)) {
      setInvalid(true);
      toast.error("Only JPG, PNG, and GIF files are allowed.");
      return;
    }

    if (selectedFile.size > maxSize) {
      setInvalid(true);
      toast.error("File size must be less than 5 MB.");
      return;
    }

    setFile(selectedFile);
    uploadFile(selectedFile);
    setInvalid(false);
    setHasChanges(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  return (
    <div>
      <section className="bg-white rounded-lg mx-auto max-w-lg space-y-2 px-8 py-10 shadow-lg shadow-gray-300">
        <div className="text-center space-y-2">
          <h1 className="text-lg font-semibold text-gray-900">
            Edit {initialValues.title}
          </h1>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-1">
            <label
              htmlFor="poster"
              className="text-sm font-medium text-gray-700"
            >
              Poster
            </label>
            <p className="text-xs text-gray-400 mb-2">
              (Upload a poster for your helpstream)
            </p>
            <input
              id="poster"
              type="file"
              ref={inputFile}
              onChange={handleChange}
              className="block w-full text-gray-600 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-another"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Title
                <p className="text-xs text-gray-400 mb-2">
              (3 - 50 characters)
            </p>
              </label>
              <input
                id="name"
                name="title"
                value={formValues.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter helpstream title"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700"
              >
                Target (amount in cUSD)
              </label>
              <input
                id="amount"
                name="targetAmount"
                type="number"
                value={formValues.targetAmount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-another"
                placeholder="Enter target amount"
                step={0.01}
                min={0.1}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description
              <p className="text-xs text-gray-400 mb-2">
              (10 - 200 characters)
            </p>
            </label>
            <textarea
              id="description"
              name="description"
              value={formValues.description}
              onChange={handleInputChange}
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-another"
              placeholder="Enter description"
              required
            />
          </div>

          <button
            className={`w-full py-3 bg-another text-white font-medium rounded-lg transition-all duration-300 ease-in-out focus:ring-2 focus:ring-another focus:outline-none ${
              !hasChanges || loading 
                ? "bg-opacity-60 hover:bg-opacity-60 cursor-not-allowed"
                : "hover:bg-opacity-80"
            }`}
            type="submit"
            disabled={!hasChanges || loading }
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default EditModal;
