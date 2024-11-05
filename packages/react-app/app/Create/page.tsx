"use client";

require("dotenv").config();
import React, { useRef, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { contractAbi, contractAddress } from "@/Blockchain/abi/HelpStream";

const Create = () => {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputFile = useRef(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const { address, isConnected } = useAccount();
  const [invalid, setInvalid] = useState(false);
  const router = useRouter();

  const uploadFile = async (fileToUpload: any) => {
    try {
      setUploading(true);
      const data = new FormData();
      data.set("file", fileToUpload);
      const res = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const resData = await res.json();
      setCid(resData.IpfsHash);
      console.log(resData.IpfsHash);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e: any) => {
    const selectedFile = e.target.files[0];

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif"]; // Allowed file types
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!validTypes.includes(selectedFile.type)) {
      setInvalid(true);
      toast.error("Only JPG, PNG, and GIF files are allowed.");
      return; // Prevent further execution if the file type is invalid
    }

    if (selectedFile.size > maxSize) {
      setInvalid(true);
      toast.error("File size must be less than 5 MB.");
      return; // Prevent further execution if the file size exceeds the limit
    }

    setFile(selectedFile); // Only set the file if it's valid
    uploadFile(selectedFile); // Proceed with the upload
    setInvalid(false);
    console.log(invalid);
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
    const title = data.name.toString().trim();
    const description = data.description.toString().trim();
    const targetAmount = Number(data.amount);

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
        functionName: "registerHelpStream",
        args: [title, description, cid, BigInt(targetAmount * 10 ** 18)],
      });
      if (hash) {
        console.log(hash);
        toast("HelpStream has been created", {
          description: "Reload page.",
        });
        router.push("/");
      } else {
        toast("Something happened, try again.");
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to create event, try again.");
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="bg-white rounded-lg mx-auto max-w-lg space-y-2 px-8 py-10 shadow-lg shadow-gray-300">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Start a Helpstream
          </h1>
          <p className="text-gray-500">
            Fill out the details below to create a new helpstream.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-6">
          {/* Poster Upload */}
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
              required
            />
          </div>

          {/* Title and Description */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Title */}
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
                name="name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter helpstream title"
                required
              />
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700"
              >
                Target (amount in cUSD)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-another"
                placeholder="Enter target amount"
                step={0.01}
                min={0.1}
                required
              />
            </div>
          </div>
          {/* Description */}
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
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-another"
              placeholder="Enter description"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            className={`w-full py-3 bg-another text-white font-medium rounded-lg  transition-all duration-300 ease-in-out focus:ring-2 focus:ring-another focus:outline-none ${
              loading
                ? "bg-opacity-60 hover:cursor-not-allowed"
                : "hover:bg-opacity-80"
            }`}
            type="submit"
          >
            {loading ? "Creating..." : "Create Helpstream"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Create;
