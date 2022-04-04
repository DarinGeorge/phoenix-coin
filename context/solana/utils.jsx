import {Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {useState, useRef} from 'react';
import {
  createMint,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  transfer,
} from '@solana/spl-token';

const phantomURL = process.env.NEXT_PUBLIC_PHANTOM_URL;

const getProvider = () => {
  if ('solana' in window) {
    const provider = window.solana;

    if (provider.isPhantom) {
      return provider;
    }
  } else {
    window.open(phantomURL, '_blank');
  }
};

export default function ProviderUtils() {
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState();
  const [loading, setLoading] = useState(false);
  const [requestedSOLAmount, setRequestedSOLAmount] = useState(1);
  const [requestedInitialMintAmount, setRequestedInitialMintAmount] = useState(1000000);
  const [transferAddress, setTransferAddress] = useState();
  const [isCoinCreated, setIsCoinCreated] = useState(false);
  const [createdCoinPublicKey, setCreatedCoinPublicKey] = useState();
  const [createdCoinAddress, setCreatedCoinAddress] = useState('');
  const [mintingWalletSecretKey, setMintingWalletSecretKey] = useState('');
  const [supplyCapped, setSupplyCapped] = useState(false);

  const connectWallet = async () => {
    if (connected) return;

    try {
      setLoading(true);
      const userWallet = await getProvider();

      if (userWallet) {
        await userWallet.connect().then(wallet => {
          setProvider(wallet);
          setConnected(true);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    if (!connected) return;

    //Disconnect Wallet
    setProvider(undefined);
    setConnected(false);
  };

  const updateLogs = () => {};

  /** Airdrops SOL from the Solana blockchain, only works on the devnet & defaults to 1 SOL. */
  const airdropTestSOL = async (account, amount) => {
    const isOnClickFunc = account._reactName === 'onClick';
    try {
      // if account is actually an event from an onClick func, loading is handled here.
      isOnClickFunc && setLoading(true);

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const to = !isOnClickFunc ? account : provider.publicKey;
      const lamports =
        requestedSOLAmount === 0 ? LAMPORTS_PER_SOL : LAMPORTS_PER_SOL * (amount ? amount : requestedSOLAmount);
      const airdropSignature = await connection.requestAirdrop(to, lamports); // Defaults to 1 SOL

      await connection.confirmTransaction(airdropSignature);

      isOnClickFunc && setLoading(false);
    } catch (e) {
      console.error(e);

      // We still stop loading on error no matter what.
      setLoading(false);
    }
  };

  /** Mints new coins on the devnet. */
  const initialMintCoins = async () => {
    try {
      // 1. Create Connection to devnet & mint coin
      setLoading(true);
      const requestor = await provider.publicKey;
      const mintAuthority = Keypair.generate();
      const freezeAuthority = Keypair.generate();

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      setMintingWalletSecretKey(JSON.stringify(mintAuthority.secretKey));

      await airdropTestSOL(mintAuthority.publicKey, 1);

      const mint = await createMint(
        connection,
        mintAuthority,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        0 // We are using 9 to match the CLI decimal default exactly.
      );

      setCreatedCoinPublicKey(mint);

      // 2. Verify new supply is 0, then create coin account & mint initial amount
      const masterCoinAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintAuthority,
        mint,
        mintAuthority.publicKey
      );
      setCreatedCoinAddress(masterCoinAccount.address.toBase58());

      const sigTxHashMint = await mintTo(
        connection,
        mintAuthority,
        mint,
        masterCoinAccount.address,
        mintAuthority.publicKey,
        1000000
      );

      updateLogs(
        'Minted 1000000 coins successfully! View transaction via Solana Explorer here: https://explorer.solana.com/tx/' +
          sigTxHashMint +
          '?cluster=devnet'
      );

      // (Optional) Print Balances
      const info = await getMint(connection, mint);
      updateLogs('new supply:' + info.supply);

      const tokenAccountInfo = await getAccount(connection, masterCoinAccount.address);
      updateLogs('verified supply in account:' + tokenAccountInfo.amount);

      // 3. Transfer to Requesting User
      // Get the token account of the toWallet address, and if it does not exist, create it
      const toCoinAccount = await getOrCreateAssociatedTokenAccount(connection, mintAuthority, mint, requestor);

      const sigTxHash = await transfer(
        connection,
        mintAuthority,
        masterCoinAccount.address,
        toCoinAccount.address,
        mintAuthority.publicKey,
        1000000
      );

      updateLogs(
        'View transaction via Solana Explorer here: https://explorer.solana.com/tx/' + sigTxHash + '?cluster=devnet'
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsCoinCreated(true);
      setLoading(false);
    }
  };

  const mintMoreCoins = async () => {
    try {
      setLoading(true);

      // 1. Connect to devnet & Request airdrop
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const mintingAuthority = Keypair.fromSecretKey(
        Uint8Array.from(Object.values(JSON.parse(mintingWalletSecretKey)))
      );
      const mintRequestor = await provider.publicKey;

      await airdropTestSOL(mintingAuthority.publicKey, 1);

      const mintingAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintingAuthority,
        createdCoinPublicKey,
        mintingAuthority.publicKey
      );

      // 2. Mint the new amount of coins, 100 for now.
      await mintTo(connection, mintingAuthority, createdCoinPublicKey, mintingAccount.address, mintingAuthority, 100);

      // 3. Transfer to requesting user
      const toCoinAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintingAuthority,
        createdCoinPublicKey,
        mintRequestor
      );

      const sigTxHash = await transfer(
        connection,
        mintingAuthority,
        mintingAccount.address,
        toCoinAccount.address,
        mintingAuthority.publicKey,
        100
      );

      updateLogs(
        'View transaction via Solana Explorer here: https://explorer.solana.com/tx/' + sigTxHash + '?cluster=devnet'
      );

      setLoading(false);
    } catch (err) {
      updateLogs(err);
      setLoading(false);
    }
  };

  const transferCoins = async () => {
    try {
      setLoading(true);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      // TODO: Temp ID to be overriden by input
      const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(Object.values(JSON.parse(mintingWalletSecretKey))));
      const toWallet = Keypair.generate(); // would be changed to user's public key

      await airdropTestSOL(mintAuthority.publicKey, 1);

      const fromAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintAuthority,
        createdCoinPublicKey,
        mintAuthority.publicKey
      );
      const toAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintAuthority,
        createdCoinPublicKey,
        toWallet.publicKey
      );

      await mintTo(
        connection,
        mintAuthority,
        createdCoinPublicKey,
        fromAccount.address,
        mintAuthority.publicKey,
        LAMPORTS_PER_SOL
      );

      const sigTxHash = await transfer(
        connection,
        mintAuthority,
        fromAccount.address,
        toAccount.address,
        mintAuthority.publicKey,
        10
      );

      updateLogs('Minted & Transferred', 10, 'SOL to', toAccount.address.toBase58());
      updateLogs(
        'View transaction via Solana Explorer here: https://explorer.solana.com/tx/' + sigTxHash + '?cluster=devnet'
      );

      setLoading(false);
    } catch (err) {
      updateLogs(err);
      setLoading(false);
    } finally {
    }
  };

  const capSupply = async () => {
    try {
      setLoading(true);
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(Object.values(JSON.parse(mintingWalletSecretKey))));
      airdropTestSOL(mintAuthority.publicKey, 1);

      await setAuthority(connection, mintAuthority, createdCoinPublicKey, mintAuthority.publicKey, 'MintTokens', null, [
        mintAuthority,
      ]);
    } catch (err) {
      updateLogs(err);
      setLoading(false);
    } finally {
      setSupplyCapped(true);
      setLoading(false);
    }
  };

  return {
    connected,
    provider,
    loading,
    connectWallet,
    disconnectWallet,
    airdropTestSOL,
    requestedSOLAmount,
    setRequestedSOLAmount,
    initialMintCoins,
    mintMoreCoins,
    requestedInitialMintAmount,
    setRequestedInitialMintAmount,
    isCoinCreated,
    supplyCapped,
    capSupply,
    transferCoins,
    transferAddress,
    setTransferAddress,
    createdCoinAddress,
  };
}
