import { useState, useCallback, useMemo } from 'react';
import { Select, SelectItem, Card, CardFooter, Switch, Snippet, Link } from '@nextui-org/react';

// import config from 'Constants/config';
import { useApiKeyStore } from 'Stores/useApiKeyStore';
import { useFetchApiKeys } from 'Services/sybilService';

// https://tysiw-qaaaa-aaaak-qcikq-cai.icp0.io/get_xrc_data_with_proof?id=DOGE/LINK
// const host = `https://${config.sybil_canister_id}.icp0.io/`;

const feeds = [
  {
    key: 'BTC/ETH',
    label: 'BTC/ETH',
  },
  {
    key: 'DOGE/SHIB',
    label: 'DOGE/SHIB',
  },
  {
    key: 'ETH/USD',
    label: 'ETH/USD',
  },
  {
    key: 'ETH/ARB',
    label: 'ETH/ARB',
  },
  {
    key: 'ICP/USD',
    label: 'ICP/USD',
  },
  {
    key: 'DOT/LINK',
    label: 'DOT/LINK',
  },
  // ...
];

const methods = [
  {
    key: 'get_dxr_data_batch',
    label: 'get_dxr_data_batch',
  },
  {
    key: 'get_dxr_data_batch_with_proof',
    label: 'get_dxr_data_batch_with_proof',
  },
  // {
  //   key: 'get_xrc_data_with_proof',
  //   label: 'get_xrc_data_with_proof',
  // },
  // {
  //   key: 'read_logs_with_proof',
  //   label: 'read_logs_with_proof',
  // },
  // {
  //   key: 'read_contract_with_proof',
  //   label: 'read_contract_with_proof',
  // },
];

const getDxrDataBatchExtraFields = ['chain_id', 'pool_addresses[]', 'dex_type'];

const readLogsExtraFields = ['chain_id', 'block_from', 'block_to', 'topics', 'limit', 'addresses'];

const readContractExtraFields = [
  'chain_id',
  'function_signature',
  'contract_addr',
  'method',
  'params',
  'block_number',
];

export const Example = () => {
  const selectedApiKey = useApiKeyStore.use.selectedApiKey();
  const updateSelectedApiKey = useApiKeyStore.use.updateSelectedApiKey();
  const selectedCanister = useApiKeyStore.use.selectedCanister();
  const host = `https://${selectedCanister}.icp0.io/`;
  const { data: apiKeys } = useFetchApiKeys();

  const [feed] = useState<string>(feeds[0].key);
  const [method, setMethod] = useState<string>(methods[0].key);
  const [bytes, setBytes] = useState<boolean>(true);
  const [cacheTtl, setCacheTtl] = useState<boolean>(true);

  const handleSelectionChange = useCallback(
    (items: any[], handleChange: (arg0: any) => void) => (e: any) => {
      const item = items.find((item) => item.key == e.target.value);

      handleChange(item.key);
    },
    [],
  );

  const handleApiKeyChange = useCallback(() => {
    if (selectedApiKey) {
      updateSelectedApiKey(null);
    } else if (apiKeys && apiKeys.length > 0) {
      updateSelectedApiKey(apiKeys[0].key);
    }
  }, [apiKeys, selectedApiKey]);

  // const selectedFeed = useMemo(() => [feed], [feed]);
  const selectedMethod = useMemo(() => [method], [method]);

  const codeString = useMemo(() => {
    console.log({ method, getDxrDataBatchExtraFields });
    if (method === 'get_xrc_data_with_proof') {
      return `${host}${method}?id=${feed}${selectedApiKey ? `&api_key=${selectedApiKey}` : ''}${bytes ? `&bytes=true` : ''}${cacheTtl ? `&cache_ttl=1800` : ''}`;
    } else if (method === 'read_logs_with_proof') {
      return `${host}${method}?${readLogsExtraFields.map((field) => `${field}={}`).join('&')}${selectedApiKey ? `&api_key=${selectedApiKey}` : ''}${bytes ? `&bytes=true` : ''}${cacheTtl ? `&cache_ttl=1800` : ''}`;
    } else if (method === 'read_contract_with_proof') {
      return `${host}${method}?${readContractExtraFields.map((field) => `${field}={}`).join('&')}${selectedApiKey ? `&api_key=${selectedApiKey}` : ''}${bytes ? `&bytes=true` : ''}${cacheTtl ? `&cache_ttl=1800` : ''}`;
    } else if (method === 'get_dxr_data_batch_with_proof') {
      return `${host}${method}?${getDxrDataBatchExtraFields.map((field) => `${field}={}`).join('&')}${selectedApiKey ? `&api_key=${selectedApiKey}` : ''}${bytes ? `&bytes=true` : ''}${cacheTtl ? `&cache_ttl=1800` : ''}`;
    }

    return '';
  }, [host, method, feed, selectedApiKey, bytes, cacheTtl]);

  return (
    <Card isFooterBlurred radius="lg" className="border-none">
      <div className="p-4 flex-col">
        <div className="flex gap-4 justify-center">
          {/*<Select*/}
          {/*  items={feeds}*/}
          {/*  label="Feed Id"*/}
          {/*  className="w-36"*/}
          {/*  selectedKeys={selectedFeed}*/}
          {/*  onChange={handleSelectionChange(feeds, setFeed)}*/}
          {/*>*/}
          {/*  {(feed) => <SelectItem key={feed.key}>{feed.label}</SelectItem>}*/}
          {/*</Select>*/}

          <Select
            items={methods}
            label="Method"
            className="w-56"
            selectedKeys={selectedMethod}
            onChange={handleSelectionChange(methods, setMethod)}
          >
            {(method) => <SelectItem key={method.key}>{method.label}</SelectItem>}
          </Select>
        </div>

        <div className="flex pt-6 justify-center gap-6">
          <Switch isSelected={bytes} onValueChange={setBytes}>
            Bytes
          </Switch>

          <Switch isSelected={cacheTtl} onValueChange={setCacheTtl}>
            Cache TTL
          </Switch>

          <Switch isSelected={Boolean(selectedApiKey)} onValueChange={handleApiKeyChange}>
            API Key
          </Switch>
        </div>
      </div>

      <CardFooter className="flex flex-col gap-3">
        <Snippet codeString={codeString} symbol="" size="md">
          <span className="max-w-2xl break-all inline-block">{host}</span>
          <span>{method}</span>
          {method === 'get_xrc_data_with_proof' && <span>?id={feed}</span>}
          {method === 'read_logs_with_proof' &&
            readLogsExtraFields.map((field) => (
              <span key={field}>
                &{field}={'{}'}
              </span>
            ))}
          {method === 'read_contract_with_proof' &&
            readContractExtraFields.map((field) => (
              <span key={field}>
                &{field}={'{}'}
              </span>
            ))}
          {method.includes('get_dxr_data_batch') &&
            getDxrDataBatchExtraFields.map((field) => (
              <span key={field}>
                &{field}={'{}'}
              </span>
            ))}
          <span>{selectedApiKey && `&api_key=${selectedApiKey}`}</span>
          <span>{bytes && `&bytes=true`}</span>
          {cacheTtl && <span>&cache_ttl=1800 // 30 minutes</span>}
        </Snippet>

        <Snippet className="flex align-middle" size="md">
          <span className="">npm i @orally-network/solidity-sdk</span>
        </Snippet>

        <div className="flex gap-4 mt-2">
          <Link
            isExternal
            href="https://www.npmjs.com/package/@orally-network/solidity-sdk"
            showAnchorIcon
          >
            Lib Details
          </Link>

          <Link
            isExternal
            // todo: change link if changed in docs
            href="https://docs.orally.network/getting-started/sybil-data-feeds"
            showAnchorIcon
          >
            Sybil Docs
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
