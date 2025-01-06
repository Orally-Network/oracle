import { Tooltip } from '@nextui-org/react';
import { Typography } from 'antd';
import { formatBalance } from 'Utils/balance';
import { useFetchBalance } from 'Services/sybilService';

export const SybilBalance = () => {
  const { data: balance, isLoading: isBalanceLoading } = useFetchBalance();

  return (
    <Tooltip content={balance ? formatBalance(balance) : 0}>
      <Typography.Title level={3}>
        Balance:{' '}
        {(!balance || isBalanceLoading) && balance !== 0
          ? '...'
          : formatBalance(balance).toFixed(2)}{' '}
        USD
      </Typography.Title>
    </Tooltip>
  );
};
