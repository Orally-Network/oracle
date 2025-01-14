import { useMemo } from 'react';

import { createActor } from 'OD/createActor';
import config from 'Constants/config';
import { useApiKeyStore } from 'Stores/useApiKeyStore';

const sybilCanister = createActor(config.sybil_canister_id, 'sybil');

export const useSybilCanister = () => {
  const selectedCanister = useApiKeyStore.use.selectedCanister();

  return useMemo(() => {
    return createActor(selectedCanister, 'sybil');
  }, [selectedCanister]);
};

export default sybilCanister;
