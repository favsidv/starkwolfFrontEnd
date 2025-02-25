import { connect as connectWallet, disconnect as disconnectWallet } from 'get-starknet';
import { Contract, RpcProvider, AccountInterface } from 'starknet';

// État global pour stocker l'adresse et le compte connecté
let currentAddress: string | undefined;
let currentAccount: AccountInterface | undefined;

/**
 * Connecte le wallet et retourne l'adresse et le compte
 */
export async function connect() {
  try {
    const starknet = await connectWallet();
    
    if (!starknet?.isConnected) {
      throw new Error("Failed to connect wallet");
    }
    
    currentAddress = starknet.selectedAddress;
    currentAccount = starknet.account;
    
    return {
      address: currentAddress,
      account: currentAccount,
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

/**
 * Déconnecte le wallet
 */
export async function disconnect() {
  try {
    await disconnectWallet();
    currentAddress = undefined;
    currentAccount = undefined;
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    throw error;
  }
}

/**
 * Retourne l'état actuel de la connexion
 */
export function getWalletState() {
  return {
    address: currentAddress,
    account: currentAccount,
    isConnected: !!currentAddress,
  };
}

/**
 * Crée un contrat connecté au compte actuel
 */
export function createContract(abi: any, address: string) {
  if (!currentAccount) {
    const provider = new RpcProvider({ nodeUrl: 'https://api.cartridge.gg/x/starkwolf/katana' });
    // @ts-expect-error - Le type de l'ABI est complexe mais fonctionne à l'exécution
    return new Contract(abi, address, provider);
  }
  
  // @ts-expect-error - Le type de l'ABI est complexe mais fonctionne à l'exécution
  return new Contract(abi, address, currentAccount);
} 