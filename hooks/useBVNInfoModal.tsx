import { useState } from 'react';

export const useBVNInfoModal = () => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const showBVNInfo = () => setShowInfoModal(true);
  const hideBVNInfo = () => setShowInfoModal(false);

  return {
    showInfoModal,
    showBVNInfo,
    hideBVNInfo,
  };
};
