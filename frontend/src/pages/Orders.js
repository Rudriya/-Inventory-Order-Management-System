import React, { useEffect, useState } from "react";
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from "../utils/api";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState("");
  const { addToast } = useToast();

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);

  const load = () => getOrders().then((r) => setOrders(r.data));

  useEffect(() => {
    load();
    getCustomers().then((r) => setCustomers(r.data));
    getProducts().then((r) => setProducts(r.data));
  }, []);

  const openAdd = () => {
    setCustomerId("");
    setItems([{ product_id: "", quantity: 1 }]);
    setFormError("");
    setShowForm(true);
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, [field]: val } : it)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!customerId) { setFormError("Select a customer"); return; }
    for (const it of items) {
      if (!it.product_id) { setFormError("Select a product for every line item"); return; }
    }
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: items.map((it) => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) })),
      });
      addToast("Order placed");
      setShowForm(false);
      load();
      getProducts().then((r) => setProducts(r.data));
    } catch (err) {
      setFormError(err.response?.data?.detail || "Something went wrong");
    }
  };

  const openDetail = (id) => {
    getOrder(id).then((r) => setDetailOrder(r.data));
  };

  const confirmDelete = async () => {
    try {
      await deleteOrder(deleteTarget);
      addToast("Order cancelled", "error");
      setDeleteTarget(null);
      load();
      getProducts().then((r) => setProducts(r.data));
    } catch {
      addToast("Cancel failed", "error");
    }
  };

  const estimatedTotal = () => {
    return items.reduce((sum, it) => {
      const p = products.find((x) => x.id === parseInt(it.product_id));
      return sum + (p ? p.price * parseInt(it.quantity || 0) : 0);
    }, 0);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ New Order</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
        <tr><th>#</th><th>Customer</th><th>Products</th><th>Qty Ordered</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th>
        </tr>
        </thead>
          <tbody>
            {orders.length === 0 && (
              <tr> <td colSpan={8} className="empty-cell">   No orders yet. </td>
          </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
  <td>#{o.id}</td>

  <td>{o.customer.full_name}</td>

  {/* Number of unique products */}
  <td>
    {o.items.length} product{o.items.length !== 1 ? "s" : ""}
  </td>

  {/* Total quantity ordered */}
  <td>
    {o.items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    )}
  </td>

  <td>₹{o.total_amount.toFixed(2)}</td>

  <td>
    <span className="badge badge-ok">{o.status}</span>
  </td>

  <td>{new Date(o.created_at).toLocaleDateString()}</td>

  <td className="action-cell">
    <button className="btn btn-sm btn-ghost" onClick={() => openDetail(o.id)}>
      Details
    </button>

    <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(o.id)}>
      Cancel
    </button>
    </td>
  </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">New Order</h2>
            {formError && <p className="form-error">{formError}</p>}
            <form onSubmit={handleSubmit} className="form">
              <label className="field">
                <span>Customer *</span>
                <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">Select customer…</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>
                  ))}
                </select>
              </label>

              <div className="order-items-header">
                <span className="field-label">Items *</span>
                <button type="button" className="btn btn-sm btn-ghost" onClick={addItem}>+ Add item</button>
              </div>

              {items.map((it, i) => {
                const selectedProduct = products.find((p) => p.id === parseInt(it.product_id));
                return (
                  <div key={i} className="order-item-row">
                    <select
                      value={it.product_id}
                      onChange={(e) => updateItem(i, "product_id", e.target.value)}
                      className="order-product-select"
                    >
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.quantity}) — ₹{p.price}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct ? selectedProduct.quantity : undefined}
                      value={it.quantity}
                      onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      className="order-qty-input"
                    />
                    {items.length > 1 && (
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(i)}>✕</button>
                    )}
                  </div>
                );
              })}

              <div className="order-total-preview">
                Estimated total: <strong>₹{estimatedTotal().toFixed(2)}</strong>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Place order</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Order #{detailOrder.id}</h2>
            <div className="detail-row"><span>Customer</span><strong>{detailOrder.customer.full_name}</strong></div>
            <div className="detail-row"><span>Email</span><strong>{detailOrder.customer.email}</strong></div>
            <div className="detail-row"><span>Status</span><span className="badge badge-ok">{detailOrder.status}</span></div>
            <div className="detail-row"><span>Date</span><strong>{new Date(detailOrder.created_at).toLocaleString()}</strong></div>
            <table className="table" style={{ marginTop: "1rem" }}>
              <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead>
              <tbody>
                {detailOrder.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.product.name}</td>
                    <td><code>{it.product.sku}</code></td>
                    <td>{it.quantity}</td>
                    <td>₹{it.unit_price.toFixed(2)}</td>
                    <td>₹{(it.quantity * it.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={4}><strong>Total</strong></td>
                  <td><strong>₹{detailOrder.total_amount.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setDetailOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Cancel this order? Stock will be restored automatically."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}