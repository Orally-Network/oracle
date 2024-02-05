import { Space, Typography, Input, Card, Flex } from 'antd';
import Button from 'Components/Button';
import React, { useEffect, useState, useMemo } from 'react';
import { useWeatherData } from 'Providers/WeatherAuctionData/useWeatherData';
import { toast } from 'react-toastify';
import pythiaCanister from 'Canisters/pythiaCanister';
import { Subscription } from 'Interfaces/subscription';
import { ARBITRUM_CHAIN_ID } from 'Providers/WeatherAuctionData/WeatherAuctionProvider';
import { LoadingOutlined } from '@ant-design/icons';
import useWindowDimensions from 'Utils/useWindowDimensions';
import { BREAK_POINT_MOBILE } from 'Constants/ui';

const CLOSE_AUCTION_SUBSCRIPTION_ID = 57;

const PROVIDE_TEMPERATURE_SUBSCRIPTION_ID = 59;

export const PredictWidget = () => {
  const [temperatureGuess, setTemperatureGuess] = useState<string>('');
  const [ticketAmount, setTicketAmount] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const [closeSubscriptionData, setCloseSubscriptionData] = useState<Subscription | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<Subscription | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState<boolean>(false);
  // const [nextUpdateDateTime, setNextUpdateDateTime] = useState<string | null>(null);

  const { sendAuctionData, isAuctionOpen, getBids, currentDay } = useWeatherData();
  const { width } = useWindowDimensions();
  const isMobile = width < BREAK_POINT_MOBILE;

  const fetchSubscription = async () => {
    try {
      setIsSubscriptionLoading(true);
      const closeSubResponse: any = await pythiaCanister.get_subscription(ARBITRUM_CHAIN_ID, CLOSE_AUCTION_SUBSCRIPTION_ID);
      const provideTempSubResponse: any = await pythiaCanister.get_subscription(ARBITRUM_CHAIN_ID, PROVIDE_TEMPERATURE_SUBSCRIPTION_ID);
      if (provideTempSubResponse.Err) {
        setSubscriptionData(null);
        throw new Error(provideTempSubResponse.Err);
      } else {
        setCloseSubscriptionData(closeSubResponse.Ok);
        setSubscriptionData(provideTempSubResponse.Ok);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  const makeBidAndVerify = async () => {
    setIsConfirming(true);
    try {
      const { hash } = await toast.promise(sendAuctionData(+temperatureGuess * 10, +ticketAmount), {
        pending: 'Confirming transaction...',
        success: 'Transaction confirmed!',
        error: 'Transaction failed',
      });
      console.log({ hash });
      getBids({ variables: { day: currentDay } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const nextCloseDateTime = useMemo(() => {
    if (!closeSubscriptionData) return;
    const {
      method: { exec_condition },
      status: { last_update },
    } = closeSubscriptionData as Subscription;

    const frequency = exec_condition[0]?.Frequency || BigInt(3600);

    const lastUpdateDateTime = new Date(Number(last_update) * 1000);
    const nextCloseDateTime = new Date(lastUpdateDateTime.getTime() + Number(frequency) * 1000);

    return nextCloseDateTime.toLocaleString();
  }, [closeSubscriptionData]);

  const nextUpdateDateTime = useMemo(() => {
    if (!subscriptionData) return;
    const {
      method: { exec_condition },
      status: { last_update },
    } = subscriptionData as Subscription;

    const frequency = exec_condition[0]?.Frequency || BigInt(3600);

    const lastUpdateDateTime = new Date(Number(last_update) * 1000);
    const nextUpdateDateTime = new Date(lastUpdateDateTime.getTime() + Number(frequency) * 1000);

    return nextUpdateDateTime.toLocaleString();
  }, [subscriptionData]);

  return (
    <Card>
      <Flex gap="large" vertical>
        <Typography.Title level={5}>How much degree will be today at {isSubscriptionLoading ? (
          <LoadingOutlined />
        ) : (nextUpdateDateTime)}?</Typography.Title>
        <Flex
          gap={isMobile ? 'middle' : 'large'}
          align={isMobile ? 'flex-start' : 'center'}
          vertical={isMobile}
        >
          <Flex vertical gap="middle">
            <div>Write the weather degree</div>
            <Space size="middle">
              <Input
                value={temperatureGuess}
                placeholder="20℃ or 16.6℃"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTemperatureGuess(e.target.value)
                }
                style={{ width: '133px' }}
              />
              <Input
                value={ticketAmount}
                placeholder="Ticket amount"
                type="number"
                min="1"
                max="100"
                style={{ width: '133px' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTicketAmount(e.target.value)
                }
              />
            </Space>
            <Typography.Text>
              {isAuctionOpen
                ? 'Auction will close at '
                : 'Auction closed, winner will be chosen at '}
              <strong>
                {isSubscriptionLoading ? (
                  <LoadingOutlined />
                ) : (
                  isAuctionOpen ? nextCloseDateTime : nextUpdateDateTime
                )}
              </strong>
            </Typography.Text>
            <Button
              type="primary"
              onClick={makeBidAndVerify}
              loading={isConfirming}
              disabled={!temperatureGuess || !isAuctionOpen}
            >
              Bid
            </Button>
          </Flex>
          <div>
            There might be few winners in one auction. <br />
            The more tickets you buy, the higher chance you win.
          </div>
        </Flex>
      </Flex>
    </Card>
  );
};
