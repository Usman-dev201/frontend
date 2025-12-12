import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../pages/Expense/AddExpense.css";
import { useExpense } from "../../context/ExpenseContext";

export default function AddExpense() {
    const navigate = useNavigate(); 
  const {
    parentCategories,
    filteredSubCategories,
    setSelectedParentId,
    locations,
    paymentStatuses,
    paymentMethods,
    taxes,
    fetchTaxesByLocation,
    addExpense,
    addExpenseTaxes,
  } = useExpense();

  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split("T")[0],
    expenseCategoryId: "",
    expenseSubCategoryId: "",
    locationId: "",
    totalAmount: "",
    amountPaid: "",
    expenseFor: "",
    paymentStatus: "",
    paymentMethod: "",
  });

  const [selectedTaxes, setSelectedTaxes] = useState([]);

  // 🔹 Tax total calculation
  const taxTotal = selectedTaxes.reduce((acc, tax) => {
    const taxAmount =
      (parseFloat(formData.totalAmount || 0) * tax.taxPercentage) / 100;
    return acc + taxAmount;
  }, 0);

  // 🔹 Grand total
  const grandTotal = parseFloat(formData.totalAmount || 0) + taxTotal;

  // 🔹 Payment due
  const paymentDue = grandTotal - parseFloat(formData.amountPaid || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "expenseCategoryId") {
      setSelectedParentId(Number(value));
      setFormData({ ...formData, [name]: value, expenseSubCategoryId: "" });
    } else if (name === "locationId") {
      setFormData({ ...formData, [name]: value });
      fetchTaxesByLocation(Number(value));
      setSelectedTaxes([]);
    } else if (name === "taxId") {
      const selectedTax = taxes.find((t) => t.taxId === Number(value));
      if (selectedTax && !selectedTaxes.some((t) => t.taxId === selectedTax.taxId)) {
        setSelectedTaxes([...selectedTaxes, selectedTax]);
      }
      setFormData({ ...formData, [name]: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDeleteTax = (taxId) => {
    setSelectedTaxes(selectedTaxes.filter((t) => t.taxId !== taxId));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Prepare expense data for backend
  const expenseData = [
    {
      expenseDate: formData.expenseDate,
      expenseCategoryId: Number(formData.expenseCategoryId),
      expenseSubCategoryId: Number(formData.expenseSubCategoryId),
      locationId: Number(formData.locationId),
      totalAmount: parseFloat(formData.totalAmount) || 0,
      grandTotal: parseFloat(grandTotal) || 0,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod,
      amountPaid: parseFloat(formData.amountPaid) || 0,
      paymentDue: parseFloat(paymentDue) || 0,
      expenseFor: formData.expenseFor,
    },
  ];

  try {
    // ✅ 1. Create expense record
    const createdExpense = await addExpense(expenseData);

    // Handle both single object or array response
    const expenseId = Array.isArray(createdExpense)
      ? createdExpense[0]?.expenseRecordId
      : createdExpense?.expenseRecordId;

    // ✅ 2. Create related expense tax records (if any taxes selected)
    if (expenseId && selectedTaxes.length > 0) {
      await addExpenseTaxes(expenseId, selectedTaxes);
    }

    alert("✅ Expense added successfully!");

    // ✅ 3. Navigate to expense list after success
    navigate("/expense/list");

    // ✅ 4. Reset form and state
    setFormData({
      expenseDate: new Date().toISOString().split("T")[0],
      expenseCategoryId: "",
      expenseSubCategoryId: "",
      locationId: "",
      totalAmount: "",
      amountPaid: "",
      expenseFor: "",
      paymentStatus: "",
      paymentMethod: "",
    });
    setSelectedTaxes([]);
  } catch (err) {
    console.error("Add expense error:", err);
    alert("❌ Failed to add expense. Check console for details.");
  }
};

  return (
    <div className="add-expense-page">
      <Topbar />
      <Sidebar />

      <div className="add-expense-container">
        <div className="add-expense-header">
          <h2>Add Expense</h2>
        </div>

        <form className="add-expense-form" onSubmit={handleSubmit}>
          {/* 🔹 Row 1: Date + Category + Subcategory */}
          <div className="form-row">
            <div className="expform-group">
              <label>Expense Date</label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
              />
            </div>

            <div className="expform-group">
              <label>Expense Category</label>
              <select
                name="expenseCategoryId"
                value={formData.expenseCategoryId}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {parentCategories.map((cat) => (
                  <option key={cat.expenseCategoryId} value={cat.expenseCategoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="expform-group">
              <label>Expense SubCategory</label>
              <select
                name="expenseSubCategoryId"
                value={formData.expenseSubCategoryId}
                onChange={handleChange}
                disabled={!filteredSubCategories.length}
              >
                <option value="">Select SubCategory</option>
                {filteredSubCategories.map((sub) => (
                  <option key={sub.expenseCategoryId} value={sub.expenseCategoryId}>
                    {sub.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🔹 Row 2 */}
          <div className="form-row">
            <div className="expform-group">
              <label>Location</label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.locationId} value={loc.locationId}>
                    {loc.locationName}
                  </option>
                ))}
              </select>
            </div>

            <div className="expform-group">
              <label>Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
              >
                <option value="">Select Payment Status</option>
                {paymentStatuses.map((status, index) => (
                  <option key={index} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="expform-group">
              <label>Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="">Select Payment Method</option>
                {paymentMethods.map((method, index) => (
                  <option key={index} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🔹 Row 3 */}
          <div className="form-row">
            <div className="exptotalform-group">
              <label>Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="Enter Total Amount"
              />
            </div>
          </div>

          {/* 🔹 Expense Purpose */}
          <div className="form-row">
            <div className="expform-group full-width">
              <label>Expense For</label>
              <textarea
                name="expenseFor"
                value={formData.expenseFor}
                onChange={handleChange}
                placeholder="Enter Expense Purpose or Details"
                rows={3}
              ></textarea>
            </div>
          </div>

          {/* 🔹 Tax Section */}
          <div className="form-row">
            <div className="expform-group">
              <label>Tax (for selected location)</label>
              <select
                name="taxId"
                value={formData.taxId || ""}
                onChange={handleChange}
                disabled={!formData.locationId}
              >
                <option value="">Select Tax</option>
                {taxes.map((tax) => (
                  <option key={tax.taxId} value={tax.taxId}>
                    {tax.taxName} ({tax.taxPercentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🔹 Tax Table */}
        <div className="tax-table-container">
  <table className="tax-table">
    <thead>
      <tr>
        <th>Tax Name</th>
        <th>Tax Percentage</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {selectedTaxes.length > 0 ? (
        selectedTaxes.map((tax) => (
          <tr key={tax.taxId}>
            <td>{tax.taxName}</td>
            <td>{tax.taxPercentage}%</td>
            <td>
              <button
                type="button"
                className="btn-delete"
                onClick={() => handleDeleteTax(tax.taxId)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="3" style={{ textAlign: "center", color: "#999" }}>
            No tax selected
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

          {/* 🔹 Summary Section */}
          <div className="summary-box">
            <h3>Expense Summary</h3>
            <div className="summary-content">
              <div className="summary-item">
                <span>Subtotal (Before Tax):</span>
                <span>Rs. {parseFloat(formData.totalAmount || 0).toFixed(2)}</span>
              </div>

              {selectedTaxes.map((tax) => (
                <div key={tax.taxId} className="summary-item tax">
                  <span>
                    {tax.taxName} ({tax.taxPercentage}%):
                  </span>
                  <span>
                    Rs.{" "}
                    {(
                      (parseFloat(formData.totalAmount || 0) * tax.taxPercentage) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="summary-item grand-total">
                <span>Grand Total:</span>
                <span>Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-section">
              <div className="payment-group">
                <label>Amount Paid</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  placeholder="Enter Amount Paid"
                  className="payment-input"
                />
              </div>

              <div className="payment-group">
                <label className="payment-due-label">Payment Due</label>
                <input
                  type="text"
                  value={`Rs. ${paymentDue.toFixed(2)}`}
                  readOnly
                  className="payment-input due"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="expbtn-save">
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}
