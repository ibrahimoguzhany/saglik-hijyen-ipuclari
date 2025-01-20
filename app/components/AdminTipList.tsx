import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const AdminTipList: React.FC = () => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Rest of the component content */}
    </div>
  );
};

export default AdminTipList; 