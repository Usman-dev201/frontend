import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
import "./TaxPayable.css";

export default function TaxPayablePage() {
  const [taxPayables, setTaxPayables] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [salesRecords, setSalesRecords] = useState([]);
  const [salesTaxes, setSalesTaxes] = useState([]);
  const [taxLocations, setTaxLocations] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [newRecord, setNewRecord] = useState({
    taxPayableId: null,
    startDate: "",
    endDate: "",
    taxId: "",
    locationId: "",
    totalTaxAmount: 0,
    status: "",
  });

  // Fetch sales data
  const fetchSalesData = useCallback(async () => {
    try {
      const [salesRes, salesTaxesRes, taxLocationsRes] = await Promise.all([
        api.get("/SalesRecord"),
        api.get("/SalesTax"),
        api.get("/TaxLocation"),
      ]);

      setSalesRecords(salesRes.data || []);
      setSalesTaxes(salesTaxesRes.data || []);
      setTaxLocations(taxLocationsRes.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load Sales/Tax data.");
    }
  }, []);

  const fetchStatuses = useCallback(async () => {
    try {
      const response = await api.get("/TaxPayable/statuses");
      setStatuses(response.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load statuses.");
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Calculate totalTaxAmount whenever inputs change
  useEffect(() => {
    if (!newRecord.startDate || !newRecord.endDate || !newRecord.taxId || !newRecord.locationId) {
      setNewRecord(prev => ({ ...prev, totalTaxAmount: 0 }));
      return;
    }

    const start = new Date(newRecord.startDate);
    const end = new Date(newRecord.endDate);

    const filteredSalesTaxes = salesTaxes.filter(
      st => st.taxId === parseInt(newRecord.taxId)
    );

    let totalTax = 0;

    filteredSalesTaxes.forEach(st => {
      const sale = salesRecords.find(
        sr => sr.salesId === st.salesId && sr.locationId === parseInt(newRecord.locationId)
      );
      if (!sale) return;

      const saleDate = new Date(sale.date);
      if (saleDate < start || saleDate > end) return;

      const taxLoc = taxLocations.find(
        tl => tl.taxId === st.taxId && tl.locationId === sale.locationId
      );
      if (!taxLoc) return;

      totalTax += sale.totalAmount * (taxLoc.taxPercentage / 100);
    });

    setNewRecord(prev => ({ ...prev, totalTaxAmount: totalTax }));
  }, [newRecord.startDate, newRecord.endDate, newRecord.taxId, newRecord.locationId, salesRecords, salesTaxes, taxLocations]);

  // Fetch TaxPayables
  const fetchTaxPayables = useCallback(async () => {
    try {
      const response = await api.get("/TaxPayable");
      setTaxPayables(response.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load Tax Payables.");
    }
  }, []);

  // Fetch Taxes
  const fetchTaxes = useCallback(async () => {
    try {
      const response = await api.get("/Tax");
      setTaxes(response.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load Taxes.");
    }
  }, []);

  // Fetch Locations
  const fetchLocations = useCallback(async () => {
    try {
      const response = await api.get("/Location");
      setLocations(response.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load Locations.");
    }
  }, []);

  useEffect(() => {
    fetchTaxPayables();
    fetchTaxes();
    fetchLocations();
    fetchStatuses();
  }, [fetchTaxPayables, fetchTaxes, fetchLocations, fetchStatuses]);

  // Modal controls
  const handleAdd = () => {
    setIsEditing(false);
    setNewRecord({
      taxPayableId: null,
      startDate: "",
      endDate: "",
      taxId: "",
      locationId: "",
      totalTaxAmount: 0,
      status: "",
    });
    setShowModal(true);
  };
const handleEdit = async (id) => {
  try {
    const response = await api.get(`/TaxPayable/${id}`);
    const record = response.data;

    setNewRecord({
      taxPayableId: record.taxPayableId,
      startDate: record.startDate,
      endDate: record.endDate,
      // Ensure taxId is always a number
      taxId: record.taxId ?? record.tax?.taxId ?? "",
      // Ensure locationId is always a number
      locationId: record.locationId ?? record.location?.locationId ?? "",
      totalTaxAmount: record.totalTaxAmount || 0,
      status: record.status || "",
    });

    setIsEditing(true);
    setShowModal(true);
  } catch (error) {
    console.error(error);
    alert("Failed to load TaxPayable record.");
  }
};



  const handleModalClose = () => {
    setShowModal(false);
    setNewRecord({
      taxPayableId: null,
      startDate: "",
      endDate: "",
      taxId: "",
      locationId: "",
      totalTaxAmount: 0,
      status: "",
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "taxId" || name === "locationId"
        ? parseInt(value)
        : value;

    setNewRecord((prev) => ({ ...prev, [name]: newValue }));
  };

const handleSave = async () => {
  if (!newRecord.startDate || !newRecord.endDate || !newRecord.taxId || !newRecord.locationId) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    if (isEditing) {
      // ✅ PUT request with ID in URL
      await api.put(`/TaxPayable/${newRecord.taxPayableId}`, newRecord);
      alert("TaxPayable updated successfully!");
    } else {
      // POST new record
      await api.post("/TaxPayable", [newRecord]);
      alert("TaxPayable added successfully!");
    }

    handleModalClose();
    fetchTaxPayables();
  } catch (error) {
    console.error(error);
    alert("Failed to save TaxPayable.");
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this record?")) return;
    try {
      await api.delete(`/TaxPayable/${id}`);
      setTaxPayables((prev) => prev.filter((t) => t.taxPayableId !== id));
      alert("Deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete record.");
    }
  };

  // Action buttons
  const ActionCell = ({ id }) => (
    <div className="action-buttons">
      <button className="btn btn-primary" onClick={() => handleEdit(id)}>Edit</button>
      <button className="btn btn-danger" onClick={() => handleDelete(id)}>Delete</button>
    </div>
  );

  // Table columns
// Table columns
const columnsRef = useRef([
  { header: "ID", accessorKey: "taxPayableId" },
  { header: "Start Date", accessorKey: "startDate" },
  { header: "End Date", accessorKey: "endDate" },
  {
    header: "Tax",
    accessorKey: "taxId",
    cell: (info) => info.row.original.tax?.taxName || info.getValue()
  },
  {
    header: "Location",
    accessorKey: "locationId",
    cell: (info) => info.row.original.location?.locationName || info.getValue()
  },
  { header: "Total Tax Amount", accessorKey: "totalTaxAmount" },
  {
    header: "Status",
    accessorKey: "status",
    cell: (info) => {
      const status = info.getValue();
      const badgeColor =
        status?.toLowerCase() === "paid"
          ? "badge-paid"
          : "badge-unpaid";
      return <span className={`status-badge ${badgeColor}`}>{status}</span>;
    }
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => <ActionCell id={row.original.taxPayableId} />
  }
]);


  const columns = columnsRef.current;

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return taxPayables;
    const q = searchQuery.toLowerCase();
    return taxPayables.filter(t =>
      String(t.taxPayableId).includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  }, [searchQuery, taxPayables]);

  // React Table
  const table = useReactTable({
    data: filteredData || [],
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="taxpayable-page">
      <Topbar />
      <Sidebar />

      <div className="taxpayable-container">
        <div className="taxpayable-header">
          <h2>Tax Payable List</h2>
          <button className="btn btn-primary" onClick={handleAdd}>Add TaxPayable</button>
        </div>

        <div className="table-controls">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getPaginationRowModel().rows.map(row => (
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

        <div className="taxpayablepagination-controls">
  <button
    className="taxpayablepagination-button"
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
  >
    Previous
  </button>

  <span className="taxpayablepagination-info">
    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
  </span>

  <button
    className="taxpayablepagination-button"
    onClick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
  >
    Next
  </button>
</div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{isEditing ? "Edit TaxPayable" : "Add TaxPayable"}</h3>
              <div className="modal-content">
                <label>Start Date</label>
                <input type="date" name="startDate" value={newRecord.startDate} onChange={handleInputChange} />

                <label>End Date</label>
                <input type="date" name="endDate" value={newRecord.endDate} onChange={handleInputChange} />

                <label>Tax</label>
                <select name="taxId" value={newRecord.taxId} onChange={handleInputChange}>
                  <option value="">Select Tax</option>
                  {taxes.map(t => <option key={t.taxId} value={t.taxId}>{t.taxName}</option>)}
                </select>

                <label>Location</label>
                <select name="locationId" value={newRecord.locationId} onChange={handleInputChange}>
                  <option value="">Select Location</option>
                  {locations.map(l => <option key={l.locationId} value={l.locationId}>{l.locationName}</option>)}
                </select>

                <label>Total Tax Amount</label>
                <input type="number" name="totalTaxAmount" value={newRecord.totalTaxAmount} disabled />

                <label>Status</label>
                <select name="status" value={newRecord.status} onChange={handleInputChange}>
                  <option value="">Select Status</option>
                  {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleSave}>{isEditing ? "Update" : "Save"}</button>
                <button className="btn btn-secondary" onClick={handleModalClose}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
