import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function CreateElection({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [positions, setPositions] = useState(""); // comma-separated string
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate || !positions) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "You are not logged in. Please login again.", "error");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/elections",
        {
          title,
          description,
          startDate,
          endDate,
          positions: positions.split(",").map(p => p.trim()), // convert to array
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", "Election created successfully", "success");
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setPositions("");
      if (onCreated) onCreated();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to create election", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3 fw-bold">Create New Election</h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Election Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Positions (comma separated)"
              value={positions}
              onChange={(e) => setPositions(e.target.value)}
              required
            />
          </div>
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateElection;