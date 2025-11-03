import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";

export function TokenLaunchpad(){

    const {connection}=useConnection();
    const wallet=useWallet();

    async function createToken(){

        const name = document.getElementById('name').value.trim();
        const symbol = document.getElementById('symbol').value.trim();
        const uri = document.getElementById('imageuri').value.trim();

        const mintkeypair=Keypair.generate(); 
       
        const metadata={
            mint:mintkeypair.publicKey,
            name:name,
            symbol:symbol,
            uri:uri,
            additionalMetadata:[]
        };
        const mintLen= getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen= TYPE_SIZE+ LENGTH_SIZE+ pack(metadata).length;
        //you need to install @solana/spl-token-metadata to use pack and createInitializeInstruction
       
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen+metadataLen);
    

        const transaction=new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey:mintkeypair.publicKey,
                space:mintLen,
                lamports,
                programId:TOKEN_2022_PROGRAM_ID
            }),
            createInitializeMetadataPointerInstruction(mintkeypair.publicKey,wallet.publicKey,mintkeypair.publicKey,TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintkeypair.publicKey,9,wallet.publicKey,null,TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId:TOKEN_2022_PROGRAM_ID,
                metadata:mintkeypair.publicKey,
                updateAuthority:wallet.publicKey,
                mint:mintkeypair.publicKey,
                mintAuthority:wallet.publicKey,
                name:metadata.name,
                symbol:metadata.symbol,
                uri:metadata.uri
            })
        );

        transaction.feePayer=wallet.publicKey;
        transaction.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintkeypair);
       
        const signature = await wallet.sendTransaction(transaction, connection)
        console.log(`✅ Token mint created at: ${mintkeypair.publicKey.toBase58()}`);
        console.log(`Transaction1 Signature: ${signature}`);

        
        const associatedToken= getAssociatedTokenAddressSync(mintkeypair.publicKey,wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);

        console.log(associatedToken.toBase58());

        const transaction2=new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintkeypair.publicKey,
                TOKEN_2022_PROGRAM_ID
            )
        );

        const signature2= await wallet.sendTransaction(transaction2,connection);
        console.log(`Transaction2 (Associated Token creation) Signature: ${signature2}`);

        const supply=document.getElementById('supply').value;
        const amount=supply*LAMPORTS_PER_SOL;

        const transaction3=new Transaction().add(
            createMintToInstruction(mintkeypair.publicKey,associatedToken,wallet.publicKey,amount, [], TOKEN_2022_PROGRAM_ID)
        );

        const signature3 = await wallet.sendTransaction(transaction3,connection);
         console.log(`Transaction3 (Token Minted) Signature: ${signature3}`);


    }

    return <div style={{
        // height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
        }}>
        <h1>Solana Token Launchpad</h1>
        <input className='inputText' type="text" placeholder="Name" id='name'></input> <br />
        <input className='inputText' type="text" placeholder="Symbol" id='symbol'></input> <br />
        <input className='inputText' type="text" placeholder="imageUri" id='imageuri'></input> <br />
        <input className='inputText' type="text" placeholder="Supply" id='supply'></input> <br />
        <button className="button" onClick={createToken}>Create a Token</button>

    </div>
}