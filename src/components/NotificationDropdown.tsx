import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NotificationDropdownProps {
  show: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ show, onClose }) => {
  const { userData, markNotificationAsRead, clearNotifications } = useAuth();

  if (!show) return null;

  const handleNotificationClick = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    onClose();
  };

  const handleClearAll = async () => {
    await clearNotifications();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {userData?.notifications.length ? (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear all
          </button>
        ) : null}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {!userData?.notifications.length ? (
          <div className="px-4 py-3 text-sm text-gray-500">
            No notifications yet
          </div>
        ) : (
          userData.notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                !notification.read ? 'bg-red-50' : ''
              }`}
            >
              <p className="text-sm text-gray-900">
                <Link
                  to={`/profile/${notification.fromUserId}`}
                  className="font-medium text-red-600 hover:text-red-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{notification.fromUsername}
                </Link>
                {' '}{notification.content}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;