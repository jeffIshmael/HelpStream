import { createPublicClient, createWalletClient, custom } from "viem";
import { celoAlfajores, celo} from "viem/chains";
import erc20Abi from "../Blockchain/abi/erc20abi.json";

//transfer function
export const processCheckout = async ( creator: `0x${string}` ,amount: number ) => {
    if (window.ethereum) {
      const privateClient = createWalletClient({
        chain: celoAlfajores,
        transport: custom(window.ethereum),
      });

      const publicClient = createPublicClient({
        chain: celo,
        transport: custom(window.ethereum),
      });

      const [address] = await privateClient.getAddresses();

      try {
        const checkoutTxnHash = await privateClient.writeContract({
          account: address,
          address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
          abi: erc20Abi,
          functionName: "transfer",
          args: [creator , BigInt(amount)],
        });

        const checkoutTxnReceipt = await publicClient.waitForTransactionReceipt(
          {
            hash: checkoutTxnHash,
          }
        );

        if (checkoutTxnReceipt.status == "success") {
          // console.log(checkoutTxnHash);
          // console.log(checkoutTxnReceipt.transactionHash);
          return checkoutTxnReceipt.transactionHash;
        }

        return false;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
    return false;
  };