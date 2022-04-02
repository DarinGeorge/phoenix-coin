import {Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {useState} from 'react';
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
  const [requestedInitialMintAmount, setRequestedInitialMintAmount] = useState(0);
  const [isCoinCreated, setIsCoinCreated] = useState(false);
  const [createdCoinPublicKey, setCreatedCoinPublicKey] = useState();
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

      console.log(
        `${amount ? amount : requestedSOLAmount} SOL airdropped to your wallet: ${
          !isOnClickFunc ? account : provider.publicKey.toString()
        } successfully`
      );
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
      console.log('mint unique ID: ', mint.toBase58());

      // 2. Verify new supply is 0, then create coin account & mint initial amount
      const mintInfo = await getMint(connection, mint);
      console.log('current supply: ', mintInfo.supply); // 0

      const masterCoinAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintAuthority,
        mint,
        mintAuthority.publicKey
      );
      console.log('coin account address:', masterCoinAccount.address.toBase58());

      const sigTxHashMint = await mintTo(
        connection,
        mintAuthority,
        mint,
        masterCoinAccount.address,
        mintAuthority.publicKey,
        1000000
      );

      console.log('Minted', 1000000, 'coins successfully!');
      console.log(
        'View transaction via Solana Explorer here: https://explorer.solana.com/tx/' + sigTxHashMint + '?cluster=devnet'
      );

      // (Optional) Print Balances
      const info = await getMint(connection, mint);
      console.log('new supply:', info.supply);

      const tokenAccountInfo = await getAccount(connection, masterCoinAccount.address);
      console.log('verified supply in account:', tokenAccountInfo.amount);

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

      console.log('Transferred', 1000000, 'coins successfully to', toCoinAccount.address.toBase58());
      console.log(
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

      const accountInfo = await getAccount(connection, mintingAccount.address);
      console.log('success! new amount added to address', accountInfo.address.toBase58());
      console.log(accountInfo.amount, 'SOL');

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
      console.log('Transferred', 100, 'SOL to', toCoinAccount.address.toBase58());
      console.log(
        'View transaction via Solana Explorer here: https://explorer.solana.com/tx/' + sigTxHash + '?cluster=devnet'
      );

      setLoading(false);
    } catch (err) {
      console.log(err);
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

      console.log('Minted & Transferred', 10, 'SOL to', toAccount.address.toBase58());
      console.log(
        'View transaction via Solana Explorer here: https://explorer.solana.com/tx/' + sigTxHash + '?cluster=devnet'
      );

      setLoading(false);
    } catch (err) {
      console.log(err);
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
      console.log(err);
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
  };
}
