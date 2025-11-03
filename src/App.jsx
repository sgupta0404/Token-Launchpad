import './App.css'
import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'
import { TokenLaunchpad } from './components/TokenLaunchpad'
import { Buffer } from 'buffer'
import '@solana/wallet-adapter-react-ui/styles.css'

window.Buffer=Buffer

function App() {
  
  //You can also add custom RPC URL
  const network =WalletAdapterNetwork.Devnet;

  const endpoint=useMemo(()=> clusterApiUrl(network),[network]);

  return (
    
    <div style={{width:'90vw'}}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div style={{
              display:'flex',
              justifyContent:'space-between', 
              padding:'20px'
              }}>
              <WalletMultiButton/>
              <WalletDisconnectButton/>
            </div>
            <TokenLaunchpad/>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>

  )
}

export default App
