import React from 'react';
import { Clock, CheckCircle2, CheckCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const getIcon = () => {
    switch (status) {
      case 'Pending':
        return <Clock size={13} />;
      case 'Confirmed':
        return <CheckCircle2 size={13} />;
      case 'Completed':
        return <CheckCheck size={13} />;
      case 'Cancelled':
        return <XCircle size={13} />;
      default:
        return null;
    }
  };

  return (
    <span className={`status-badge ${status || 'Pending'}`}>
      {getIcon()}
      {status || 'Pending'}
    </span>
  );
}
