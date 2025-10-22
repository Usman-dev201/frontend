import { useMemo, useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender
} from "@tanstack/react-table";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../pages/CRM/LoyaltyProgram.css";
import { useLoyaltyPrograms } from "../../context/CrmContext";


export default function LoyaltyPrograms() {
  const { fetchLoyaltyPrograms, 
    loyaltyPrograms, 
    addLoyaltyProgram, 
    updateLoyaltyProgram,
     deleteLoyaltyProgram ,
     redemptionTypes,
      fetchRedemptionTypes
    } =
    useLoyaltyPrograms();

  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    programName: "",
    description: "",
    startDate: "",
    endDate: "",
    redemptionType: "",
    valuePerPoint: 0,
    discountPercentagePerPoint: 0,
    pointsPrePurchase: 0,
    status: "",
  });

  useEffect(() => {
    fetchLoyaltyPrograms();
    fetchRedemptionTypes();
  }, [fetchLoyaltyPrograms,fetchRedemptionTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleEdit = useCallback((program) => {
  // Convert status safely to lowercase for comparison
  const status = program.status?.toLowerCase();

  // Prevent editing if program is already active or expired
  if (status === "active" || status === "expired") {
    alert(
      `Loyalty Program "${program.programName}" cannot be updated because its status is already ${program.status}.`
    );
    return; // stop execution here
  }

  // Otherwise, allow editing
  setFormData({ ...program });
  setEditingId(program.loyaltyProgramId);
  setShowForm(true);
}, []);


const handleDelete = useCallback(
  async (id) => {
    // Find the program to check its status
    const program = loyaltyPrograms.find((p) => p.loyaltyProgramId === id);
    const status = program?.status?.toLowerCase();

    // Prevent deletion if status is Active or Expired
    if (status === "active" || status === "expired") {
      alert(
        `Loyalty Program "${program.programName}" cannot be deleted because its status is already ${program.status}.`
      );
      return;
    }

    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await deleteLoyaltyProgram(id);
        alert(`Loyalty Program "${program.programName}" deleted successfully!`);
        fetchLoyaltyPrograms();
      } catch (error) {
        console.error("Error deleting program:", error);
        alert("Failed to delete the program. Please try again.");
      }
    }
  },
  [deleteLoyaltyProgram, fetchLoyaltyPrograms, loyaltyPrograms]
);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateLoyaltyProgram(editingId, formData);
      alert("Loyalty program updated successfully!");
    } else {
      await addLoyaltyProgram(formData);
      alert("Loyalty program added successfully!");
    }
    setShowForm(false);
    setEditingId(null);
    fetchLoyaltyPrograms();
  };

  const filteredPrograms = useMemo(() => {
    if (!searchQuery.trim()) return loyaltyPrograms;
    return loyaltyPrograms.filter((p) =>
      p.programName.toLowerCase().includes(searchQuery.toLowerCase())||
    p.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, loyaltyPrograms]);

const columns = useMemo(
  () => [
    { header: "ID", accessorKey: "loyaltyProgramId" },
    { header: "Program Name", accessorKey: "programName" },
       {
      header: "Customer Name(s)",
      accessorFn: (row) =>
        row.customers && row.customers.length > 0
          ? row.customers.map((c) => c.customerName).join(", ")
          : "—",
    },
    { header: "Description", accessorKey: "description" },
    { header: "Start Date", accessorKey: "startDate" },
    { header: "End Date", accessorKey: "endDate" },
    { header: "Redemption Type", accessorKey: "redemptionType" },
    { header: "Value Per Point", accessorKey: "valuePerPoint" },
    { header: "Discount % Per Point", accessorKey: "discountPercentagePerPoint" },
    { header: "Points Per Purchase", accessorKey: "pointsPrePurchase" },

    // 🟢 NEW: Customer Names
 

    // 🟢 NEW: Total Points (sum of all customers or list)
    {
      header: "Total Points Earned",
      accessorFn: (row) =>
        row.customers && row.customers.length > 0
          ? row.customers
              .map((c) => ` ${c.totalPointsEarned}`)
              .join(" | ")
          : "—",
    },

    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue()?.toLowerCase();
        let className = "status-badge";
        if (status === "active") className += " active";
        else if (status === "expired") className += " expired";
        else if (status === "upcoming") className += " upcoming";
        return <span className={className}>{status}</span>;
      },
    },

    {
      header: "Actions",
      accessorFn: (row) => row.loyaltyProgramId,
      cell: (info) => (
        <div className="action-buttons">
          <button
            className="btn-edit"
            onClick={() =>
              handleEdit(loyaltyPrograms.find((p) => p.loyaltyProgramId === info.getValue()))
            }
          >
            Edit
          </button>
          <button className="btn-delete" onClick={() => handleDelete(info.getValue())}>
            Delete
          </button>
        </div>
      ),
    },
  ],
  [loyaltyPrograms, handleDelete, handleEdit]
);


  const table = useReactTable({
    data: filteredPrograms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="loyalty-page">
      <Topbar />
      <Sidebar />

      <div className="loyalty-container">
        <div className="loyalty-header">
          <h2>Loyalty Programs</h2>
          <button
            className="add-loyalty-btn"
            onClick={() => {
              setFormData({
                programName: "",
                description: "",
                startDate: "",
                endDate: "",
                redemptionType: "",
                valuePerPoint: 0,
                discountPercentagePerPoint: 0,
                pointsPrePurchase: 0,
                status: "",
              });
              setEditingId(null);
              setShowForm(true);
            }}
          >
            Add Program
          </button>
        </div>

        {/* Table Section */}
        <div className="loyalty-table-container">
       <div className="table-controls">
  <div className="search-wrapper">
    <input
      type="text"
      placeholder="Search LoyaltyPrograms..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <span className="search-icon"></span>
  </div>

  <div className="page-size-control">
    <label htmlFor="pageSize">Show</label>
    <select
      id="pageSize"
      value={table.getState().pagination.pageSize}
      onChange={e => table.setPageSize(Number(e.target.value))}
    >
      {[5, 10, 25, 50, 100].map(size => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
    <span>entries</span>
  </div>
</div>
  {/* Table */}
  <table className="customer-table">
    <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody>
      {table.getRowModel().rows.map(row => (
        <tr key={row.id}>
          {row.getVisibleCells().map(cell => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>

 {/* Pagination */}
  <div className="pagination-controls">
    <button 
      className="pagination-button"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Previous
    </button>
    <span className="pagination-info">
      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
    </span>
    <button 
      className="pagination-button"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      Next
    </button>
  </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? "Edit Loyalty Program" : "Add Loyalty Program"}</h3>
          <form onSubmit={handleSubmit}>
  <div className="form-grid">
    <div className="form-group">
      <label>Program Name</label>
      <input
        type="text"
        name="programName"
        placeholder="Enter Program Name"
        value={formData.programName}
        onChange={handleChange}
        required
      />
    </div>

    <div className="form-group">
      <label>Description</label>
      <input
        type="text"
        name="description"
        placeholder="Enter Description"
        value={formData.description}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>Start Date</label>
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>End Date</label>
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>Redemption Type</label>
      <select
        name="redemptionType"
        value={formData.redemptionType}
        onChange={handleChange}
        required
      >
        <option value="">Select Redemption Type</option>
        {redemptionTypes.map((type, idx) => (
          <option key={idx} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Value Per Point</label>
      <input
        type="number"
        name="valuePerPoint"
        placeholder="e.g. 1.5"
        value={formData.valuePerPoint}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>Discount Percentage Per Point</label>
      <input
        type="number"
        name="discountPercentagePerPoint"
        placeholder="e.g. 10"
        value={formData.discountPercentagePerPoint}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>Points Per Purchase</label>
      <input
        type="number"
        name="pointsPrePurchase"
        placeholder="e.g. 5"
        value={formData.pointsPrePurchase}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="modal-footer">
    <button type="submit" className="btn-save">Save</button>
    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
      Cancel
    </button>
  </div>
</form>
          </div>
        </div>
      )}
    </div>
  );
}
