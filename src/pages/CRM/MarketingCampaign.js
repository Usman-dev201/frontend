import { useMemo, useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender
} from "@tanstack/react-table";
import Topbar from "../../components/Topbar";
import Sidebar from "../../components/Sidebar";
import "../../pages/POS/Customer.css"; // SAME CSS
import api from "../../api/axios";

export default function MarketingCampaign() {
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);

  // FORM DATA
  const [formData, setFormData] = useState({
    campaignName: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    campaignType: "",
    messageSubject: "",
    messageBody: "",
    targetAudience: "",
    status: "",
  });

  // LOAD campaigns
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get("/MarketingCampaign");
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  // EDIT
  const handleEdit = useCallback((campaign) => {
    setFormData({ ...campaign });
    setEditingCampaignId(campaign.campaignId);
    setShowForm(true);
  }, []);

  // DELETE
  const handleDelete = useCallback(async (campaignId) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await api.delete(`/MarketingCampaign/${campaignId}`);
        alert("Campaign deleted successfully!");
        fetchCampaigns();
      } catch (error) {
        console.error("Failed to delete campaign:", error);
        alert("Error deleting campaign.");
      }
    }
  }, []);

  // FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCampaignId) {
        // UPDATE
        await api.put(`/MarketingCampaign/${editingCampaignId}`, formData);
        alert("Campaign updated successfully!");
      } else {
        // ADD
        await api.post("/MarketingCampaign", [formData]);
        alert("Campaign added successfully!");
      }

      setShowForm(false);
      setEditingCampaignId(null);

      setFormData({
        campaignName: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        campaignType: "",
        messageSubject: "",
        messageBody: "",
        targetAudience: "",
        status: "",
      });

      fetchCampaigns();
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("Error saving campaign.");
    }
  };

  // TABLE COLUMNS
  const columns = useMemo(() => [
    { header: 'ID', accessorKey: 'campaignId' },
    { header: "Customer Name", accessorKey: "customerName" },
    { header: 'Campaign Name', accessorKey: 'campaignName' },
    { header: 'Start Date', accessorKey: 'startDate' },
    { header: 'End Date', accessorKey: 'endDate' },
    { header: 'Type', accessorKey: 'campaignType' },
    { header: 'Subject', accessorKey: 'messageSubject' },
    { header: 'Message Body', accessorKey: 'messageBody' },
    { header: 'Target Audience', accessorKey: 'targetAudience' },
    { header: 'Status', accessorKey: 'status' },
  
{ header: "Delivered At", accessorKey: "deliveredAt" },

    {
      header: 'Actions',
      accessorFn: row => row.campaignId,
      cell: info => (
        <div style={{ display: "flex", gap: "5px" }}>
          <button className="btn btn-primary" onClick={() => handleEdit(campaigns.find(c => c.campaignId === info.getValue()))}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={() => handleDelete(info.getValue())}>
            Delete
          </button>
        </div>
      ),
    },
  ], [campaigns, handleDelete, handleEdit]);

  // SEARCH
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    return campaigns.filter(c =>
      c.campaignName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaignType?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, campaigns]);


  const table = useReactTable({
    data: filteredCampaigns,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="customer-page">
      <Topbar />
      <Sidebar />

      <div className="customer-container">
        <div className="customer-header">
          <h2>Marketing Campaigns</h2>
          <button
            className="add-customer-btn"
            onClick={() => {
              setFormData({
                campaignName: "",
                startDate: new Date().toISOString().split("T")[0],
                endDate: new Date().toISOString().split("T")[0],
                campaignType: "",
                messageSubject: "",
                messageBody: "",
                targetAudience: "",
                status: "",
              });
              setEditingCampaignId(null);
              setShowForm(true);
            }}
          >
            Add Campaign
          </button>
        </div>

        {/* TABLE */}
        <div className="customer-table-container">
          <div className="table-controls">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search Campaigns..."
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

      {/* MODAL */}
      {showForm && (
        <div className="cusmodal-overlay">
          <div className="cusmodal-content">
            <h3>{editingCampaignId ? "Edit Campaign" : "Add Campaign"}</h3>

            <form onSubmit={handleSubmit}>
              <div className="cusform-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="cusform-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="cusform-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="cusform-group">
                <label>Campaign Type</label>
                <input
                  type="text"
                  name="campaignType"
                  value={formData.campaignType}
                  onChange={handleChange}
                />
              </div>

              <div className="cusform-group">
                <label>Message Subject</label>
                <input
                  type="text"
                  name="messageSubject"
                  value={formData.messageSubject}
                  onChange={handleChange}
                />
              </div>

              <div className="cusform-group">
                <label>Message Body</label>
                <textarea
                  name="messageBody"
                  value={formData.messageBody}
                  onChange={handleChange}
                  rows={3}
                ></textarea>
              </div>

              <div className="cusform-group">
                <label>Target Audience</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                />
              </div>

              <div className="cusform-group">
                <label>Status</label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                />
              </div>

              <div className="cusmodal-footer">
                <button type="submit" className="btn btn-success">
                  Save Campaign
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
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
