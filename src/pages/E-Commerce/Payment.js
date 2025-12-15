import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import api from "../../api/axios";
import "./Payment.css";

export default function ListPayment() {
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showModal, setShowModal] = useState(false);
  const [statuses, setStatuses] = useState([]);
useEffect(() => {
  const fetchStatuses = async () => {
    try {
      const response = await api.get("/Payment/status");
      setStatuses(response.data || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  fetchStatuses();
}, []);

  const [newPayment, setNewPayment] = useState({
    paymentDate: "",
    orderId: "",
    paymentMethod: "",
    amount: "",
    paymentStatus: "",
    billingAddressId: "",
  });

  // ✅ Fetch all payments with order & billing info
  const fetchPayments = useCallback(async () => {
    try {
      const response = await api.get("/Payment");
      setPayments(response.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      alert("Failed to load payments. Please try again.");
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ✅ Edit payment
  const handleEdit = async (id) => {
    try {
      const response = await api.get(`/Payment/${id}`);
      setNewPayment(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching payment:", error);
      alert("Failed to load payment details.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewPayment({
      paymentDate: "",
      orderId: "",
      paymentMethod: "",
      amount: "",
      paymentStatus: "",
      billingAddressId: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({ ...prev, [name]: value }));
  };

const handleEditPayment = async () => {
  try {
    await api.put(
      `/Payment/${newPayment.paymentId}`, // 👈 REQUIRED
      [newPayment]
    );

    alert("Payment updated successfully!");
    handleModalClose();
    fetchPayments();
  } catch (error) {
    console.error("Error updating payment:", error);
    alert("Failed to update payment. Please try again.");
  }
};

  // ✅ Delete payment
  // const handleDelete = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this payment?")) return;

  //   try {
  //     await api.delete(`/Payment/${id}`);
  //     setPayments((prev) => prev.filter((p) => p.PaymentId !== id));
  //     alert("Payment deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting payment:", error);
  //     alert("Failed to delete payment. Please try again.");
  //   }
  // };

  // ✅ Action Buttons
  const ActionCell = ({ paymentId }) => (
    <div className="action-buttons">
      <button className="btn btn-primary" onClick={() => handleEdit(paymentId)}>Edit</button>
      {/* <button className="btn btn-danger" onClick={() => handleDelete(paymentId)}>Delete</button> */}
    </div>
  );

  // ✅ Table Columns including order & billing info
  const columnsRef = useRef([
    { header: "Payment ID", accessorKey: "paymentId" },
    { header: "Order ID", accessorKey: "orderId" },
      { header: "Full Name", accessorFn: (row) => `${row.firstName} ${row.lastName}` },
    { header: "Payment Date", accessorKey: "paymentDate" },
    { header: "Payment Method", accessorKey: "paymentMethod" },
    { header: "Amount", accessorKey: "amount" },
  {
  header: "Payment Status",
  accessorKey: "paymentStatus",
  cell: ({ row }) => {
    const status = row.original.paymentStatus
      ?.toLowerCase()
      .replace(/ /g, "-"); // convert to CSS-friendly class

    return (
      <span className={`status-badge status-${status}`}>
        {row.original.paymentStatus}
      </span>
    );
  },
},

  
    { header: "Email", accessorKey: "email" },
    { header: "Billing Address", accessorFn: (row) => 
        row.billingAddress 
          ? `${row.billingAddress.address}`
          : "N/A"
    },
    { header: "Actions", id: "actions", cell: ({ row }) => <ActionCell paymentId={row.original.paymentId} /> },
  ]);
  const columns = columnsRef.current;

  // ✅ Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter(
      (p) =>
        String(p.PaymentId).includes(q) ||
        String(p.OrderId).includes(q) ||
        p.PaymentMethod?.toLowerCase().includes(q) ||
        p.PaymentStatus?.toLowerCase().includes(q) ||
        p.FirstName?.toLowerCase().includes(q) ||
        p.LastName?.toLowerCase().includes(q) ||
        p.Email?.toLowerCase().includes(q)
    );
  }, [searchQuery, payments]);

  // ✅ Table setup
  const table = useReactTable({
    data: filteredData || [],
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="payment-page">
      <Topbar />
      <Sidebar />

      <div className="payment-container">
        <div className="payment-header">
          <h2>Payments List</h2>
        </div>

        {/* Search + Pagination */}
        <div className="table-controls">
          <input type="text" placeholder="Search Payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div className="page-size-control">
            <label>Show</label>
            <select value={table.getState().pagination.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}>
              {[5, 10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getPaginationRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

         {/* Pagination */}
        <div className="orderpagination-controls">

  <button
    className="orderpagination-button"
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
  >
    Previous
  </button>

  <span className="orderpagination-info">
    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
  </span>

  <button
    className="orderpagination-button"
    onClick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
  >
    Next
  </button>

</div>

        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="paymentmodal-overlay">
          <div className="paymentmodal">
            <h3>Edit Payment</h3>
            <div className="paymentmodal-content">
              <label>Payment Date:</label>
              <input type="date" name="paymentDate" value={newPayment.paymentDate} onChange={handleInputChange} />

              <label>Order ID:</label>
              <input type="number" name="orderId" value={newPayment.orderId} onChange={handleInputChange} />

              <label>Payment Method:</label>
              <input type="text" name="paymentMethod" value={newPayment.paymentMethod} onChange={handleInputChange} placeholder="Enter payment method" />

              <label>Amount:</label>
              <input type="number" name="amount" value={newPayment.amount} onChange={handleInputChange} />

             <label>Payment Status:</label>
<select name="paymentStatus" value={newPayment.paymentStatus} onChange={handleInputChange}>
  <option value="">Select Status</option>
  {statuses.map((status) => (
    <option key={status} value={status}>{status}</option>
  ))}
</select>


              <label>Billing Address ID (optional):</label>
              <input type="number" name="billingAddressId" value={newPayment.billingAddressId} onChange={handleInputChange} />
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleEditPayment}>Update</button>
              <button className="btn btn-secondary" onClick={handleModalClose}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
