import { createPublicClient, http } from "viem";
import { celoAlfajores } from "viem/chains";
import erc20Abi from "../Blockchain/abi/erc20abi.json";

export async function getBalance(address: string) {
  // Create a public client connected to Celo Alfajores
  const client = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
  });

  try {
    // Read the balanceOf function from the ERC20 contract
    const data = await client.readContract({
      address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // cUSD contract on Celo Alfajores
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });

    return Number(data); // Return the balance as a number
  } catch (error) {
    console.error("Error fetching balance:", error);
    return null; // Return null if there's an error
  }
}
