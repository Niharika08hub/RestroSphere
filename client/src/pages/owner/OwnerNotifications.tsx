import { useEffect, useState } from "react";
import {
  Bell,
  ShoppingBag,
  Armchair,
  Utensils,
  CalendarDays,
  Package,
  UserRound,
  Info,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
} from "lucide-react";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type NotificationItem,
  type NotificationType,
} from "../../services/notificationService";

function OwnerNotifications() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState<"all" | "unread">("all");

  // =====================================
  // LOAD NOTIFICATIONS
  // =====================================

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response =
        await getNotifications();

      setNotifications(
        response.data || []
      );

      setUnreadCount(
        response.unreadCount || 0
      );
    } catch (error: any) {
      console.error(
        "LOAD NOTIFICATIONS ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // =====================================
  // FILTER
  // =====================================

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter(
          (notification) =>
            !notification.isRead
        )
      : notifications;

  // =====================================
  // ICON
  // =====================================

  const getNotificationIcon = (
    type: NotificationType
  ) => {
    switch (String(type)) {
      case "order":
        return <ShoppingBag size={19} />;

      case "reservation":
        return <CalendarDays size={19} />;

      case "inventory":
        return <Package size={19} />;

      case "employee":
        return <UserRound size={19} />;

      case "table":
        return <Armchair size={19} />;

      case "menu":
        return <Utensils size={19} />;

      case "payment":
        return <Check size={19} />;

      default:
        return <Info size={19} />;
    }
  };

  // =====================================
  // ICON STYLE
  // =====================================

  const getNotificationIconStyle = (
    type: NotificationType
  ) => {
    switch (String(type)) {
      case "order":
        return "bg-blue-50 text-blue-600";

      case "reservation":
        return "bg-purple-50 text-purple-600";

      case "inventory":
        return "bg-red-50 text-red-500";

      case "employee":
        return "bg-green-50 text-green-600";

      case "table":
        return "bg-blue-50 text-blue-600";

      case "menu":
        return "bg-orange-50 text-orange-600";

      case "payment":
        return "bg-emerald-50 text-emerald-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // =====================================
  // SUMMARY COUNTS
  // =====================================

  const orderNotifications =
    notifications.filter(
      (notification) =>
        String(notification.type) === "order" ||
        String(notification.type) === "payment"
    ).length;

  const alertNotifications =
    notifications.filter(
      (notification) =>
        String(notification.type) === "inventory" ||
        String(notification.type) === "menu"
    ).length;

  const peopleNotifications =
    notifications.filter(
      (notification) =>
        String(notification.type) === "employee"
    ).length;

  const tableNotifications =
    notifications.filter(
      (notification) =>
        String(notification.type) === "table"
    ).length;

  // =====================================
  // TIME
  // =====================================

  const getTimeAgo = (
    dateString: string
  ) => {
    const date = new Date(
      dateString
    );

    const now = new Date();

    const diff =
      now.getTime() -
      date.getTime();

    const minutes = Math.floor(
      diff / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================
  // MARK ONE READ
  // =====================================

  const handleMarkRead = async (
    notification: NotificationItem
  ) => {
    if (notification.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(
        notification._id
      );

      setNotifications(
        (current) =>
          current.map((item) =>
            item._id ===
            notification._id
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
      );

      setUnreadCount(
        (count) =>
          Math.max(count - 1, 0)
      );
    } catch (error: any) {
      console.error(
        "MARK READ ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to update notification."
      );
    }
  };

  // =====================================
  // MARK ALL READ
  // =====================================

  const handleMarkAllRead =
    async () => {
      if (unreadCount === 0) {
        return;
      }

      try {
        await markAllNotificationsAsRead();

        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                isRead: true,
              })
            )
        );

        setUnreadCount(0);
      } catch (error: any) {
        console.error(
          "MARK ALL READ ERROR:",
          error
        );

        alert(
          error?.message ||
            "Unable to mark notifications as read."
        );
      }
    };

  // =====================================
  // DELETE
  // =====================================

  const handleDelete = async (
    id: string
  ) => {
    try {
      await deleteNotification(id);

      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item._id !== id
          )
      );

      const deletedNotification =
        notifications.find(
          (item) =>
            item._id === id
        );

      if (
        deletedNotification &&
        !deletedNotification.isRead
      ) {
        setUnreadCount(
          (count) =>
            Math.max(count - 1, 0)
        );
      }
    } catch (error: any) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete notification."
      );
    }
  };

  return (
    <div
      className="
        w-full
        min-h-screen
        bg-[#f7f7f8]
        -mt-8
      "
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <div
        className="
          w-full
          px-4 sm:px-6 lg:px-8
          pt-0
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-end
            lg:justify-between
            gap-5
          "
        >
          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-[0.16em]
                text-orange-500
                font-semibold
              "
            >
              OWNER OPERATIONS
            </p>

            <h1
              className="
                mt-1
                text-2xl
                sm:text-3xl
                font-extrabold
                text-[#172033]
              "
            >
              Notifications
            </h1>

            <p
              className="
                mt-2
                text-sm
                sm:text-base
                text-gray-500
              "
            >
              View important restaurant activity and alerts from all operations.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="
                  h-11
                  px-5
                  rounded-xl
                  bg-orange-500
                  text-white
                  text-sm
                  font-semibold
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-orange-600
                  transition
                "
              >
                <CheckCheck size={17} />
                Mark all as read
              </button>
            )}

            <button
              type="button"
              onClick={loadNotifications}
              disabled={loading}
              className="
                h-11
                px-5
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-700
                text-sm
                font-semibold
                inline-flex
                items-center
                justify-center
                gap-2
                hover:border-orange-300
                hover:text-orange-600
                disabled:opacity-60
                transition
              "
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* =====================================
          SUMMARY
      ===================================== */}

      <div
        className="
          px-4 sm:px-6 lg:px-8
          pt-6
        "
      >
        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-4
          "
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Total
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[#172033]">
              {notifications.length}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              All notifications
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Unread
            </p>
            <p className="mt-1 text-2xl font-extrabold text-orange-500">
              {unreadCount}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Need attention
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Orders
            </p>
            <p className="mt-1 text-2xl font-extrabold text-blue-600">
              {orderNotifications}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Orders & payments
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Alerts
            </p>
            <p className="mt-1 text-2xl font-extrabold text-red-500">
              {alertNotifications}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Inventory & menu
            </p>
          </div>
        </div>
      </div>

      {/* =====================================
          NOTIFICATIONS
      ===================================== */}

      <div
        className="
          px-4 sm:px-6 lg:px-8
          py-6
        "
      >
        <div
          className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            shadow-sm
            overflow-hidden
          "
        >
          {/* FILTER BAR */}

          <div
            className="
              p-4 sm:p-6
              border-b
              border-gray-100
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  sm:text-xl
                  font-bold
                  text-gray-800
                "
              >
                Recent Notifications
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                {notifications.length} notifications
                {peopleNotifications > 0
                  ? ` • ${peopleNotifications} staff`
                  : ""}
                {tableNotifications > 0
                  ? ` • ${tableNotifications} tables`
                  : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setFilter("all")
                }
                className={`
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-semibold
                  transition
                  ${
                    filter === "all"
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }
                `}
              >
                All
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilter("unread")
                }
                className={`
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-semibold
                  transition
                  ${
                    filter === "unread"
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-500 hover:bg-gray-50"
                  }
                `}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 text-xs">
                    ({unreadCount})
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div
              className="
                min-h-[420px]
                flex
                items-center
                justify-center
              "
            >
              <div className="text-center">
                <RefreshCw
                  size={32}
                  className="
                    mx-auto
                    text-orange-500
                    animate-spin
                  "
                />
                <p
                  className="
                    mt-3
                    text-sm
                    text-gray-500
                  "
                >
                  Loading notifications...
                </p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div
              className="
                min-h-[420px]
                flex
                items-center
                justify-center
                text-center
                px-4
              "
            >
              <div>
                <div
                  className="
                    w-16
                    h-16
                    mx-auto
                    rounded-2xl
                    bg-orange-50
                    text-orange-500
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Bell size={28} />
                </div>

                <h3
                  className="
                    mt-5
                    text-lg
                    font-semibold
                    text-gray-700
                  "
                >
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-400
                    max-w-sm
                  "
                >
                  {filter === "unread"
                    ? "You're all caught up."
                    : "New restaurant activity will appear here."}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {filteredNotifications.map(
                (notification) => (
                  <div
                    key={notification._id}
                    className={`
                      group
                      p-4 sm:p-5
                      border-b
                      border-gray-100
                      last:border-0
                      transition
                      ${
                        notification.isRead
                          ? "bg-white"
                          : "bg-orange-50/40"
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        items-start
                        gap-3 sm:gap-4
                      "
                    >
                      <div
                        className={`
                          w-10 h-10
                          sm:w-11 sm:h-11
                          shrink-0
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          ${getNotificationIconStyle(
                            notification.type
                          )}
                        `}
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                            gap-1 sm:gap-3
                          "
                        >
                          <div className="min-w-0">
                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                flex-wrap
                              "
                            >
                              <h3
                                className={`
                                  text-sm
                                  sm:text-base
                                  ${
                                    notification.isRead
                                      ? "font-semibold text-gray-700"
                                      : "font-bold text-gray-800"
                                  }
                                `}
                              >
                                {notification.title}
                              </h3>

                              {!notification.isRead && (
                                <span
                                  className="
                                    w-2
                                    h-2
                                    rounded-full
                                    bg-orange-500
                                  "
                                />
                              )}
                            </div>

                            <p
                              className="
                                mt-1
                                text-sm
                                leading-6
                                text-gray-500
                              "
                            >
                              {notification.message}
                            </p>
                          </div>

                          <span
                            className="
                              shrink-0
                              text-xs
                              text-gray-400
                            "
                          >
                            {getTimeAgo(
                              notification.createdAt
                            )}
                          </span>
                        </div>

                        <div
                          className="
                            mt-3
                            flex
                            items-center
                            gap-2
                            flex-wrap
                          "
                        >
                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkRead(
                                  notification
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                px-3
                                py-1.5
                                rounded-lg
                                bg-white
                                border
                                border-gray-200
                                text-xs
                                font-semibold
                                text-gray-600
                                hover:border-green-300
                                hover:text-green-600
                                transition
                              "
                            >
                              <Check size={14} />
                              Mark as read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                notification._id
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              px-3
                              py-1.5
                              rounded-lg
                              text-xs
                              font-semibold
                              text-gray-400
                              hover:bg-red-50
                              hover:text-red-500
                              transition
                            "
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default OwnerNotifications;