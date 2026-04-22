import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

function DeliveryCountdown({ target }) {
  const [remaining, setRemaining] = useState('Calculating...');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = dayjs(target).diff(dayjs());
      if (diff <= 0) {
        setRemaining('Arriving now');
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${hours}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  return <Typography color="warning.main">ETA: {remaining}</Typography>;
}

export default DeliveryCountdown;
