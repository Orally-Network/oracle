import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { type Address, type Hash } from 'viem';
import sybilCanister from 'Canisters/sybilCanister';
import { GeneralResponse } from 'Interfaces/common';
import { remove0x } from 'Utils/addressUtils';
import { useGlobalState } from 'Providers/GlobalState';
import logger from 'Utils/logger';

import { okOrErrResponseWrapper, toastWrapper } from './utils';

// useQuery/useMutation + sybil request + toast

export interface AllowedToken {
  address: Address;
  symbol: string;
  decimals: number;
}

export interface AllowedChain {
  chainId: number;
  symbol: string;
  tokens: AllowedToken[];
}

export type AllowedDomain = {
  key: string;
  domain: string;
  ownerAddress: Address;
  lastRequest: number;
  requestCount: number;
  requestCountPerMethod: Record<string, number>;
  // requestLimit: number;
};

export type ApiKey = Omit<AllowedDomain, 'domain'> & {
  apiKey: string;
  bannedDomains: string[];
  requestCountPerDomain: Record<string, number>;
  requestLimit: number;
  requestLimitByDomain: Record<string, number>;
}

// query
export const useFetchApiKeys = () => {
  const { addressData } = useGlobalState();

  return useQuery({
    queryKey: ['apiKeys', addressData],
    queryFn: async () => {
      try {
        const promise = sybilCanister.get_api_keys(addressData.message, remove0x(addressData.signature)) as Promise<GeneralResponse>;
        const wrappedPromise = okOrErrResponseWrapper(promise);

        const res = await wrappedPromise;

        // formatter
        const apiKeys: ApiKey[] = res.map(([apiKey, keyData]: any) => {
          return {
            key: apiKey,
            apiKey,
            ownerAddress: keyData.address,
            bannedDomains: keyData.banned_domains,
            lastRequest: keyData.last_request,
            requestCount: Number(keyData.request_count),
            requestCountPerDomain: keyData.request_count_per_domain,
            requestCountPerMethod: keyData.request_count_per_method,
            requestLimit: Number(keyData.request_limit),
            requestLimitByDomain: Number(keyData.request_limit_by_domain),
          };
        });

        logger.log('[service] queried api keys', { res, apiKeys });

        return apiKeys;
      } catch (error) {
        logger.error('[service] Failed to query api keys', error);
      }

      return;
    },
    enabled: Boolean(addressData && addressData.signature),
  });
};

// query
export const useFetchAllowedDomains = () => {
  const { addressData } = useGlobalState();

  return useQuery({
    queryKey: ['allowedDomains', addressData],
    queryFn: async () => {
      try {
        const promise = sybilCanister.get_allowed_domains(addressData.message, remove0x(addressData.signature)) as Promise<GeneralResponse>;
        const wrappedPromise = okOrErrResponseWrapper(promise);

        const res = await wrappedPromise;

        // formatter
        const allowedDomains: AllowedDomain[] = res.map(([domain, domainData]: any) => {
          return {
            key: domain,
            domain,
            ownerAddress: domainData.grantor_address,
            lastRequest: domainData.last_request,
            requestCount: Number(domainData.request_count),
            requestCountPerMethod: domainData.request_count_per_method,
            // requestLimit: Number(domainData.request_limit),
          };
        });

        logger.log('[service] queried allowed domains', { res, allowedDomains });

        return allowedDomains;
      } catch (error) {
        logger.error('[service] Failed to query allowed domains', error);
      }

      return;
    },
    enabled: Boolean(addressData && addressData.signature),
  });
};

// mutate
export const useGenerateApiKey = () => {
  const { addressData } = useGlobalState();
  const queryClient = useQueryClient();

  return useMutation({
    // @ts-ignore
    mutationFn: async () => {
      const promise = sybilCanister.generate_api_key(addressData.message, remove0x(addressData.signature)) as Promise<GeneralResponse>;
      const wrappedPromise = okOrErrResponseWrapper(promise);

      const res = await toastWrapper(wrappedPromise);

      console.log('[service] generated api key', { res });

      return res;
    },
    onError: (error, variables, context) => {
      logger.error(`[service] Failed to generate api key`, error, variables, context);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
};

// mutate
export const useGrantDomain = () => {
  const { addressData } = useGlobalState();
  const queryClient = useQueryClient();

  return useMutation({
    // @ts-ignore
    mutationFn: async (domain: string) => {
      const promise = sybilCanister.grant(domain, addressData.message, remove0x(addressData.signature)) as Promise<GeneralResponse>;
      const wrappedPromise = okOrErrResponseWrapper(promise);

      const res = await toastWrapper(wrappedPromise, 'Grant Domain');

      console.log('[service] granted domain', { res });

      return res;
    },
    onError: (error, variables, context) => {
      logger.error(`[service] Failed to grant domain`, error, variables, context);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowedDomains'] });
    },
  });
};

// todo: add to tokens coin of the chain + change transfer for this case
// query
export const useFetchAllowedChains = () => useQuery({
  queryKey: ['allowedChains'],
  queryFn: async () => {
    try {
      const res: any = await sybilCanister.get_allowed_chains();

      // formatter
      const allowedChains: AllowedChain[] = res.map(([chainId, chainData]: any) => ({
        chainId: Number(chainId),
        symbol: chainData.coin_symbol,
        tokens: chainData.erc20_contracts.map((tokenData: any) => ({
          address: tokenData.erc20_contract,
          symbol: tokenData.token_symbol,
          decimals: tokenData.decimals,
        })),
      }));

      logger.log('[service] queried allowed chains', { res, allowedChains });

      return allowedChains;
    } catch (error) {
      logger.error('[service] Failed to query allowed chains', error);
    }

    return;
  },
});

// query
export const useFetchSybilTreasureAddress = () => useQuery({
  queryKey: ['treasureAddress'],
  queryFn: async () => {
    try {
      const res: Address = await sybilCanister.get_treasure_address() as Address;

      logger.log('[service] queried treasurer address', { res });

      return res;
    } catch (error) {
      logger.error('[service] Failed to query treasurer address', error);
    }

    return;
  },
});

// mutate
export const useDeposit = () => {
  const { addressData } = useGlobalState();
  const queryClient = useQueryClient();

  return useMutation({
    // @ts-ignore
    mutationFn: async ({ chainId, tx_hash }: { chainId: number, tx_hash: Hash }) => {
      const promise = sybilCanister.deposit(
        chainId,
        tx_hash,
        [], // grantee
        addressData.message,
        remove0x(addressData.signature)
      ) as Promise<GeneralResponse>;
      const wrappedPromise = okOrErrResponseWrapper(promise);

      // todo[1]: add logic for saving tx_hash to local storage for future checks if user close window, but deposit wasn't successful - to retry it

      const res = await toastWrapper(wrappedPromise, 'Deposit');

      logger.log('[service] deposited', { res });

      return res;
    },
    onError: (error: any, variables: any, context: any) => {
      logger.error(`[service] Failed to deposit`, error, variables, context);
    },
    onSuccess: () => {
      // todo[1]: clear localstorage here

      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
};

// query
export const useFetchBalance = () => {
  const { addressData } = useGlobalState();

  return useQuery({
    queryKey: ['balance', addressData.address],
    queryFn: async () => {
      try {
        const promise = sybilCanister.get_balance(addressData.address) as Promise<GeneralResponse>;
        const wrappedPromise = okOrErrResponseWrapper(promise);

        const res = await wrappedPromise;

        logger.log('[service] queried balance', { res });

        return Number(res);
      } catch (error) {
        logger.error('[service] Failed to query balance', error);
      }

      return;
    },
    enabled: Boolean(addressData && addressData.address),
  });
};

// query
export const useFetchBaseFee = () => useQuery({
  queryKey: ['baseFee'],
  queryFn: async () => {
    try {
      const res = await sybilCanister.get_base_fee() as bigint;

      logger.log('[service] queried base fee', { res });

      return res;
    } catch (error) {
      logger.error('[service] Failed to query base fee', error);
    }

    return;
  },
});

// mutate
export const useDeleteApiKey = () => {
  const { addressData } = useGlobalState();
  const queryClient = useQueryClient();

  return useMutation({
    // @ts-ignore
    mutationFn: async (apiKey: string) => {
      const promise = sybilCanister.revoke_key(
        apiKey,
        addressData.message,
        remove0x(addressData.signature),
      );
      const res = await toastWrapper(promise, 'Delete Key');

      logger.log('[service] delete key', { res });

      return res;
    },
    onError: (error: any, variables: any, context: any) => {
      logger.error(`[service] Failed to delete key`, error, variables, context);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
};

// mutate
export const useBanDomain = () => {
  const { addressData } = useGlobalState();
  const queryClient = useQueryClient();

  return useMutation({
    // @ts-ignore
    mutationFn: async (domain: string) => {
      const promise = sybilCanister.restrict(
        domain,
        addressData.message,
        remove0x(addressData.signature),
      );
      const res = await toastWrapper(promise, 'Ban Domain');

      logger.log('[service] ban domain', { res });

      return res;
    },
    onError: (error: any, variables: any, context: any) => {
      logger.error(`[service] Failed to ban domain`, error, variables, context);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowedDomains'] });
    },
  });
};
