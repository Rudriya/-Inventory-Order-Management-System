import React, { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../utils/api";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";

const empty = { name: "", sku: "", price: "", quantity: "", description: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState("");
  const { addToast } = useToast();

  const load = () => getProducts().then((r) => setProducts(r.data));

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(empty);
    setEditing(null);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || "" });
    setEditing(p.id);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const payload = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };
    try {
      if (editing) {
        await updateProduct(editing, payload);
        addToast("Product updated");
      } else {
        await createProduct(payload);
        addToast("Product added");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Something went wrong");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteTarget);
      addToast("Product deleted", "error");
      setDeleteTarget(null);
      load();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={5} className="empty-cell">No products yet. Add one to get started.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}{p.description && <span className="row-sub">{p.description}</span>}</td>
                <td><code>{p.sku}</code></td>
                <td>₹{p.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ${p.quantity === 0 ? "badge-danger" : p.quantity <= 10 ? "badge-warn" : "badge-ok"}`}>
                    {p.quantity}
                  </span>
                </td>
                <td className="action-cell">
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editing ? "Edit Product" : "Add Product"}</h2>
            {formError && <p className="form-error">{formError}</p>}
            <form onSubmit={handleSubmit} className="form">
              <label className="field">
                <span>Name *</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="field">
                <span>SKU *</span>
                <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Price (₹) *</span>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </label>
                <label className="field">
                  <span>Quantity *</span>
                  <input required type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </label>
              </div>
              <label className="field">
                <span>Description</span>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{editing ? "Save changes" : "Add product"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Delete this product? This cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}