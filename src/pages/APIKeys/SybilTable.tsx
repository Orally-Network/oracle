import { useCallback, useMemo, useState } from 'react';
import { Button, type TableProps, Snippet } from '@nextui-org/react';

import { useGlobalState } from 'Providers/GlobalState';
import { Table, type Column } from 'Components/Table';
import { DeleteIcon } from 'SVGICons/DeleteIcon';
import { Modal, useModal } from 'Components/Modal';
import { type ApiKey, useFetchBaseFee } from 'Services/sybilService';

const columns: Column[] = [
  {
    key: 'requestCount',
    label: 'Requests',
  },
  // {
  //   key: 'spent',
  //   label: 'Spent',
  // },
  // {
  //   key: 'limit',
  //   label: 'Limit (1d)',
  // },
  {
    key: 'actions',
    label: 'Actions',
    align: 'center',
  },
];

interface SybilTableProps
  extends Pick<TableProps, 'selectionMode' | 'onSelectionChange' | 'selectedKeys'> {
  items: any[];
  add: () => void;
  remove: (key: string) => void;
  isLoading: boolean;
  isAdding: boolean;
  addLabel: string;
  title: string;
  additionalColumns?: Column[];
}

export const SybilTable = ({
  items,
  add,
  remove,
  isLoading,
  isAdding,
  addLabel,
  title,
  additionalColumns,
  selectionMode,
  selectedKeys,
  onSelectionChange,
}: SybilTableProps) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const { isOpen, onOpenChange, onOpen, onClose } = useModal();

  const { addressData } = useGlobalState();

  const { data: baseFee, isLoading: isFeeLoading } = useFetchBaseFee();

  const renderCell = useCallback(
    (item: ApiKey, columnKey: string) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const cellValue = item[columnKey];

      switch (columnKey) {
        case 'apiKey':
          return (
            <div>
              <Snippet symbol="" className="truncate">
                {item.apiKey}
              </Snippet>
            </div>
          );
        // case 'spent':
        //   return item.requestCount && baseFee
        //     ? `$${formatUnits(BigInt(item.requestCount) * baseFee, BALANCE_USD_DECIMALS)}`
        //     : 0;
        // case 'limit':
        //   return (
        //     <Tooltip content={`${item.requestCountToday}/${item.requestLimit}`}>
        //       <Progress
        //         aria-label="Loading..."
        //         value={item.requestCountToday}
        //         maxValue={item.requestLimit}
        //       />
        //     </Tooltip>
        //   );
        case 'actions':
          return (
            <div className="flex items-center text-center">
              <span
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  setSelectedKey(item.apiKey ?? item.domain);
                  onOpen();
                }}
                className="text-lg text-danger cursor-pointer active:opacity-50"
              >
                <DeleteIcon />
              </span>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [onOpen, baseFee],
  );

  const deleteAction = useMemo(
    () => [
      {
        label: 'Delete',
        onPress: () => {
          if (selectedKey) {
            remove(selectedKey);
            setSelectedKey(null);
            onClose();
          }
        },
        variant: 'danger',
      },
    ],
    [selectedKey],
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex justify-between">
        <p className="text-lg">{title}</p>

        <Button
          className="min-w-36"
          color="primary"
          onClick={add as any}
          isLoading={isAdding}
          isDisabled={!addressData.signature}
        >
          {addLabel}
        </Button>
      </div>
    );
  }, [addressData.signature, isAdding, addLabel, title]);

  return (
    <>
      <Table
        ariaLabel="API Keys"
        columns={additionalColumns ? [...additionalColumns, ...columns] : columns}
        rows={isFeeLoading || !items ? [] : items}
        renderCell={renderCell}
        isLoading={isLoading || isFeeLoading}
        topContent={topContent}
        selectionMode={selectionMode}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
      />

      <Modal
        title="Are you sure?"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        actions={deleteAction}
      >
        <div>You will not be able to recover this key.</div>
      </Modal>
    </>
  );
};
