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
import "./Review.css";

export default function ListReview() {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showModal, setShowModal] = useState(false);
  const [statuses, setStatuses] = useState([]);
useEffect(() => {
  const fetchStatuses = async () => {
    try {
      const response = await api.get("/ReviewReply/status");
      setStatuses(response.data || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      alert("Failed to load statuses.");
    }
  };

  fetchStatuses();
}, []);

  const [currentReply, setCurrentReply] = useState({
    reviewId: 0,
    userFirstName: "",
    userLastName: "",
    replyComment: "",
    status: "",
  });

 // Fetch all reviews
const fetchReviews = useCallback(async () => {
  try {
    const response = await api.get("/ReviewReply");

    const flatData = [];

    response.data.forEach(review => {
      if (review.replies.length === 0) {
        // Push row with empty reply fields
        flatData.push({
          ...review,
          replyDate: null,
          replyComment: null,
          status: null
        });
      } else {
        review.replies.forEach(reply => {
          flatData.push({
            ...review,
            replyDate: reply.replyDate,
            replyComment: reply.replyComment,
            status: reply.status
          });
        });
      }
    });

    setReviews(flatData);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    alert("Failed to load reviews.");
  }
}, []);
const StarRating = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? "star filled" : "star"}>
        ★
      </span>
    );
  }

  return <div className="star-rating">{stars}</div>;
};


useEffect(() => {
  fetchReviews();
}, [fetchReviews]);
  // Open reply modal
  const handleReply = async (reviewId) => {
    if (!reviewId) {
      alert("Invalid review ID!");
      return;
    }

    try {
      // Fetch user details from ReviewReply controller using reviewId
      const userResponse = await api.get(`/ReviewReply/user-by-review/${reviewId}`);
      const user = userResponse.data;

      setCurrentReply({
        reviewId,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        replyComment: "",
        status: "",
      });

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching user info:", error);
      alert("Failed to fetch user info.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentReply({
      reviewId: 0,
      userFirstName: "",
      userLastName: "",
      replyComment: "",
      status: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentReply((prev) => ({ ...prev, [name]: value }));
  };

  // Save reply
 const handleSaveReply = async () => {
  if (!currentReply.replyComment.trim() || !currentReply.status.trim()) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const payload = [
      {
        reviewId: currentReply.reviewId,
        replyComment: currentReply.replyComment,
        status: currentReply.status,
        date: new Date().toISOString().split("T")[0], // "yyyy-MM-dd"
      },
    ];

    await api.post("/ReviewReply", payload);
    alert("Reply added successfully!");
    handleModalClose();
  } catch (error) {
    console.error("Error saving reply:", error);
    alert("Failed to save reply. Please try again.");
  }
};


  // Delete review
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
       await api.delete(`/ReviewReply/review/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  // Action buttons
const ActionCell = ({ reviewId }) => (
  <div className="action-buttons">
    <button className="btn btn-primary" onClick={() => handleReply(reviewId)}>
      <i className="fas fa-reply"></i> Reply
    </button>
    <button className="btn btn-danger" onClick={() => handleDelete(reviewId)}>
      <i className="fas fa-trash"></i> Delete
    </button>
  </div>
);


  // Table columns
const columnsRef = useRef([
  { header: "Review Date", accessorKey: "reviewDate" },
  { header: "Product Name", accessorKey: "productName" },
  {
    header: "User Name",
    accessorFn: row => `${row.userFirstName} ${row.userLastName}`
  },
 {
    header: "Rating",
    accessorKey: "rating",
    cell: ({ row }) => <StarRating rating={row.original.rating} />,
  },
  { header: "Comments", accessorKey: "comments" },

  // Reply columns (1 row per reply)
  { header: "Reply Date", accessorKey: "replyDate" },
  { header: "Reply Comment", accessorKey: "replyComment" },
 {
  header: "Status",
  accessorKey: "status",
  cell: ({ row }) => {
    const status = row.original.status;

    if (!status) return <span className="badge status-none">No Reply</span>;

    const statusClass =
      status === "Verified"
        ? "badge status-paid"
        : status === "Pending"
        ? "badge status-pending"
        : "badge status-rejected";

    return <span className={statusClass}>{status}</span>;
  },
},


  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => <ActionCell reviewId={row.original.reviewId} />,
  },
]);

const columns = columnsRef.current;


 

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter(
      (r) =>
        String(r.productId).includes(q) ||
        String(r.userId).includes(q) ||
        String(r.rating).includes(q) ||
        r.comments?.toLowerCase().includes(q)
    );
  }, [searchQuery, reviews]);

  // Table setup
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
    <div className="review-page">
      <Topbar />
      <Sidebar />

      <div className="review-container">
        <div className="review-header">
          <h2>Reviews List</h2>
        </div>

        {/* Search + Pagination Controls */}
        <div className="table-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="page-size-control">
            <label htmlFor="pageSize">Show</label>
            <select
              id="pageSize"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getPaginationRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
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

      {/* Reply Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Reply</h3>
            <div className="modal-content">
              <label>User Name:</label>
              <input
                type="text"
                value={`${currentReply.userFirstName} ${currentReply.userLastName}`}
                disabled
              />
              <label>Reply Comment:</label>
              <input
                type="text"
                name="replyComment"
                value={currentReply.replyComment}
                onChange={handleInputChange}
                placeholder="Enter reply comment"
              />
              <label>Status:</label>
          <select
  name="status"
  value={currentReply.status}
  onChange={handleInputChange}
>
  <option value="">Select Status</option>
  {statuses.map((status) => (
    <option key={status} value={status}>
      {status}
    </option>
  ))}
</select>

            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSaveReply}>
                Save Reply
              </button>
              <button className="btn btn-secondary" onClick={handleModalClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
