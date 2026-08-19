import { useEffect, useState } from "react";
import {
  getOwnerOrders,
  updateOrderStatus,
} from "../../services/orderService";

type Order = {
  _id: string;
  customerName?: string;
  customerId?: {
    fullName?: string;
    name?: string;
  };
  items?: {
    name?: string;
    quantity?: number;
    price?: number;
  }[];
  totalAmount?: number;
  status?: string;
  orderType?: string;
  tableNumber?: string | number;
  createdAt?: string;
};

const statusOptions = [
  "pending",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOwnerOrders();
      setOrders(data || []);
    } catch (err: any) {
      console.error("Orders loading error:", err);
      setError(err.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    status: string
  ) => {
    try {
      setUpdatingId(orderId);

      const updatedOrder = await updateOrderStatus(orderId, status);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      );
    } catch (err: any) {
      console.error("Status update error:", err);
      alert(err.message || "Unable to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getCustomerName = (order: Order) => {
    return (
      order.customerName ||
      order.customerId?.fullName ||
      order.customerId?.name ||
      "Guest Customer"
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "pending":
        return "status pending";

      case "preparing":
        return "status preparing";

      case "ready":
        return "status ready";

      case "completed":
        return "status completed";

      case "cancelled":
        return "status cancelled";

      default:
        return "status";
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <p className="eyebrow">ORDER MANAGEMENT</p>

          <h1>Orders</h1>

          <p className="subtitle">
            View and manage orders from your restaurant.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadOrders}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="order-summary">
        <div className="summary-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="summary-card">
          <span>Pending</span>
          <strong>
            {orders.filter((o) => o.status === "pending").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Preparing</span>
          <strong>
            {orders.filter((o) => o.status === "preparing").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Ready</span>
          <strong>
            {orders.filter((o) => o.status === "ready").length}
          </strong>
        </div>
      </div>

      <div className="orders-container">
        <div className="orders-title">
          <div>
            <h2>Restaurant Orders</h2>
            <p>Live orders from your restaurant</p>
          </div>
        </div>

        {loading && (
          <div className="orders-message">
            Loading orders...
          </div>
        )}

        {!loading && error && (
          <div className="orders-message error-message">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-message">
            <div className="empty-icon">☰</div>

            <h3>No orders yet</h3>

            <p>
              Orders placed by customers will appear here.
            </p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>
                        #{order._id.slice(-6).toUpperCase()}
                      </strong>
                    </td>

                    <td>
                      {getCustomerName(order)}
                    </td>

                    <td>
                      <div className="items-list">
                        {order.items?.length ? (
                          order.items.map((item, index) => (
                            <div key={index}>
                              {item.name || "Item"} ×{" "}
                              {item.quantity || 1}
                            </div>
                          ))
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div>
                        {order.orderType || "Dine-in"}

                        {order.tableNumber && (
                          <small>
                            Table {order.tableNumber}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <strong>
                        ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      {formatDate(order.createdAt)}
                    </td>

                    <td>
                      <select
                        className={getStatusClass(order.status)}
                        value={order.status || "pending"}
                        disabled={updatingId === order._id}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value
                          )
                        }
                      >
                        {statusOptions.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .orders-page {
          padding: 32px;
          min-height: 100%;
          background: #f8f9fb;
          color: #10203b;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 30px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #ff6500;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .orders-header h1 {
          margin: 0;
          font-size: 36px;
          font-weight: 700;
        }

        .subtitle {
          margin: 8px 0 0;
          color: #71809a;
          font-size: 16px;
        }

        .refresh-btn {
          border: 1px solid #dce2eb;
          background: white;
          color: #10203b;
          padding: 13px 20px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        .refresh-btn:hover {
          border-color: #ff6500;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .order-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 28px;
        }

        .summary-card {
          background: white;
          border: 1px solid #e1e5eb;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .summary-card span {
          display: block;
          color: #71809a;
          font-size: 15px;
          margin-bottom: 12px;
        }

        .summary-card strong {
          font-size: 28px;
        }

        .orders-container {
          background: white;
          border: 1px solid #e1e5eb;
          border-radius: 18px;
          overflow: hidden;
        }

        .orders-title {
          padding: 24px;
          border-bottom: 1px solid #edf0f4;
        }

        .orders-title h2 {
          margin: 0;
          font-size: 21px;
        }

        .orders-title p {
          margin: 6px 0 0;
          color: #71809a;
        }

        .orders-message {
          padding: 70px 20px;
          text-align: center;
          color: #71809a;
        }

        .orders-message h3 {
          color: #10203b;
          margin: 12px 0 5px;
        }

        .empty-icon {
          font-size: 30px;
          color: #ff6500;
        }

        .error-message {
          color: #d93025;
        }

        .orders-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 950px;
        }

        .orders-table th {
          text-align: left;
          padding: 16px 18px;
          background: #fafbfc;
          color: #71809a;
          font-size: 13px;
          font-weight: 600;
          border-bottom: 1px solid #e5e9ef;
        }

        .orders-table td {
          padding: 18px;
          border-bottom: 1px solid #edf0f4;
          vertical-align: middle;
          font-size: 14px;
        }

        .orders-table tbody tr:hover {
          background: #fffaf6;
        }

        .items-list {
          color: #4f6079;
          line-height: 1.6;
        }

        .orders-table small {
          display: block;
          margin-top: 4px;
          color: #8a96a8;
        }

        .status {
          border: 1px solid #dce2eb;
          border-radius: 8px;
          padding: 8px 10px;
          background: white;
          font-weight: 600;
          cursor: pointer;
        }

        .status.pending {
          border-color: #f0b429;
        }

        .status.preparing {
          border-color: #ff8a00;
        }

        .status.ready {
          border-color: #2e9e5b;
        }

        .status.completed {
          border-color: #2563eb;
        }

        .status.cancelled {
          border-color: #dc3545;
        }

        @media (max-width: 900px) {
          .orders-page {
            padding: 22px;
          }

          .order-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .orders-page {
            padding: 16px;
          }

          .orders-header {
            flex-direction: column;
          }

          .orders-header h1 {
            font-size: 30px;
          }

          .refresh-btn {
            width: 100%;
          }

          .order-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;