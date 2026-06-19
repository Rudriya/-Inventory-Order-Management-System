import React, { useEffect, useState } from "react";
import { getDashboard } from "../utils/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then((r) => setStats(r.data))
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  if (error) return <div className="page-error">{error}</div>;
  if (!stats) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-grid">
        <Link to="/products" className="stat-card">
          <span className="stat-label">Products</span>
          <span className="stat-value">{stats.total_products}</span>
        </Link>
        <Link to="/customers" className="stat-card">
          <span className="stat-label">Customers</span>
          <span className="stat-value">{stats.total_customers}</span>
        </Link>
        <Link to="/orders" className="stat-card">
          <span className="stat-label">Orders</span>
          <span className="stat-value">{stats.total_orders}</span>
        </Link>
        <div className="stat-card stat-card-warn">
          <span className="stat-label">Low Stock</span>
          <span className="stat-value">{stats.low_stock_products.length}</span>
        </div>
      </div>

      {stats.low_stock_products.length > 0 && (
        <section className="section">
          <h2 className="section-title">Low Stock Alerts</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id} className={p.quantity === 0 ? "row-danger" : "row-warn"}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? "badge-danger" : "badge-warn"}`}>
                        {p.quantity === 0 ? "Out of stock" : `${p.quantity} left`}
                      </span>
                    </td>
                    <td>₹{p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
