import React, { useEffect, useState } from "react";
import { getCustomers, createCustomer, deleteCustomer } from "../utils/api";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";

const empty = { full_name: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState("");
  const { addToast } = useToast();

  const load = () => getCustomers().then((r) => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(empty);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await createCustomer(form);
      addToast("Customer added");
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Something went wrong");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(deleteTarget);
      addToast("Customer removed", "error");
      setDeleteTarget(null);
      load();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr><td colSpan={4} className="empty-cell">No customers yet.</td></tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.full_name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "—"}</td>
                <td className="action-cell">
                  <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add Customer</h2>
            {formError && <p className="form-error">{formError}</p>}
            <form onSubmit={handleSubmit} className="form">
              <label className="field">
                <span>Full name *</span>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </label>
              <label className="field">
                <span>Email *</span>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="field">
                <span>Phone</span>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add customer</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message="Delete this customer? Their order history will also be removed."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}