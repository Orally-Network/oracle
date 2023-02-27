import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FileUploader } from "react-drag-drop-files";

import Modal from 'Components/Modal';
import Input from 'Components/Input';
import Button from 'Components/Button';
import logger from 'Utils/logger';
import { remove0x } from 'Utils/addressUtils';

import styles from './Control.scss';

const fileTypes = ["JSON"];

const SubscribeModal = ({ isSubscribeModalOpen, setIsSubscribeModalOpen, addressData, oracle }) => {
  const [abi, setAbi] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [methodName, setMethodName] = useState('');
  
  const setFile = useCallback((file) => {
    const reader = new FileReader();

    reader.onload = function(e) {
      const bytes = e.target.result;

      setAbi(new Uint8Array(bytes));
    }

    reader.readAsArrayBuffer(file);
  }, []);

  const subscribe = useCallback(async () => {
    setIsSubscribeModalOpen(false);
    
    console.log({ destinationAddress, methodName, abi: [...abi], addressData })
    
    const res = await toast.promise(
      oracle.subscribe(destinationAddress, methodName, [...abi], addressData.message, remove0x(addressData.signature)),
      {
        pending: `Subscribe ${destinationAddress}:${methodName} to oracle`,
        success: `Subscribed successfully`,
        error: {
          render({ error }) {
            logger.error(`Subscribe ${destinationAddress}:${methodName} to oracle`, error);

            return 'Something went wrong. Try again later.';
          }
        },
      }
    );
    
    console.log({ res });
    
    setFile(null);
    setDestinationAddress('');
    setMethodName('');
  }, [methodName, destinationAddress, addressData, abi]);

  return (
    <Modal
      isOpen={isSubscribeModalOpen}
      onClose={useCallback(() => setIsSubscribeModalOpen(false), [])}
    >
      <div className={styles.subscribeModal}>
        <FileUploader
          hanldeChange={setFile}
          name="file"
          types={fileTypes}
          label="Upload ABI"
          onSizeError={() => toast.error('File size is too big')}
          onDrop={setFile}
          onSelect={setFile}
          maxSize={1}
        />
        
        <Input
          className={styles.input}
          value={destinationAddress}
          placeholder="0x..."
          onChange={useCallback((e) => setDestinationAddress(e.target.value), [])}
        />

        <Input
          className={styles.input}
          value={methodName}
          placeholder="method_name"
          onChange={useCallback((e) => setMethodName(e.target.value), [])}
        />

        <Button
          className={styles.subscribeBtn}
          onClick={subscribe}
        >
          Subscribe
        </Button>
      </div>
    </Modal>
  )
};

export default SubscribeModal;
