import { create } from 'zustand';

import config from 'Constants/config';

import { createSelectors } from './createSelectors';

type State = {
  selectedApiKey: string | null;
  selectedCanister: string;
};

type Action = {
  updateSelectedApiKey: (apiKey: string | null) => void;
  updateSelectedCanister: (canister: string) => void;
};

const useApiKeyStoreBase = create<State & Action>((set) => ({
  selectedApiKey: '',
  selectedCanister: config.sybilCansiters[0],

  updateSelectedApiKey: (apiKey) => set(() => ({ selectedApiKey: apiKey })),
  updateSelectedCanister: (canister) => set(() => ({ selectedCanister: canister })),
}));

export const useApiKeyStore = createSelectors(useApiKeyStoreBase);
