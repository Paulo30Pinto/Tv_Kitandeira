import { useEffect, useState } from 'react';
import { Channel } from '../types';

interface UseTVNavigationProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  onClosePlayer?: () => void;
  isPlayerOpen?: boolean;
}

export const useTVNavigation = ({
  channels,
  onSelectChannel,
  onClosePlayer,
  isPlayerOpen = false,
}: UseTVNavigationProps) => {
  const [digitBuffer, setDigitBuffer] = useState<string>('');
  const [channelNotice, setChannelNotice] = useState<string | null>(null);

  useEffect(() => {
    let timeout: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Back/Escape Key Handling
      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (isPlayerOpen && onClosePlayer) {
          onClosePlayer();
        }
        return;
      }

      // 2. Direct Numeric Channel Tuning (0-9)
      if (e.key >= '0' && e.key <= '9') {
        const newBuffer = (digitBuffer + e.key).slice(-3);
        setDigitBuffer(newBuffer);
        setChannelNotice(`Canal #${newBuffer}`);

        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(() => {
          const foundChannel = channels.find(
            (c) => c.channelNumber === newBuffer || c.channelNumber === newBuffer.padStart(3, '0')
          );

          if (foundChannel) {
            onSelectChannel(foundChannel);
          }
          setDigitBuffer('');
          setChannelNotice(null);
        }, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeout) clearTimeout(timeout);
    };
  }, [digitBuffer, channels, isPlayerOpen, onSelectChannel, onClosePlayer]);

  return {
    digitBuffer,
    channelNotice,
  };
};
