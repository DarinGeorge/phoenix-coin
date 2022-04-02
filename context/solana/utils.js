import {useState} from 'react';

export default function ProviderUtils() {
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState();
  const [loading, setLoading] = useState();

  return {
    connected,
    provider,
    loading,
  };
}
