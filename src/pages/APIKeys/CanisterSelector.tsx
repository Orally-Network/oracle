import { useCallback } from 'react';
import { Select, SelectItem } from '@nextui-org/react';

import config from 'Constants/config';
import { useApiKeyStore } from 'Stores/useApiKeyStore';

const items = config.sybilCansiters.map((canister) => ({
  key: canister,
  label: canister,
}));

export const CanisterSelector = () => {
  const selectedCanister = useApiKeyStore.use.selectedCanister();
  const setSelectedCanister = useApiKeyStore.use.updateSelectedCanister();

  const handleSelectionChange = useCallback(
    (items: any[], handleChange: (arg0: any) => void) => (e: any) => {
      const item = items.find((item) => item.key == e.target.value);

      handleChange(item.key);
    },
    [],
  );

  return (
    <Select
      items={items}
      label="Sybil canister"
      className="w-56"
      selectedKeys={[selectedCanister]}
      onChange={handleSelectionChange(items, setSelectedCanister)}
    >
      {(feed) => <SelectItem key={feed.key}>{feed.label}</SelectItem>}
    </Select>
  );
};
