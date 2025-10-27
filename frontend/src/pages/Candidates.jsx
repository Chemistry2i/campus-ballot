import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import getImageUrl from '../utils/getImageUrl';
import Select from "react-select";
import ugandaPartiesOptions from '../utils/ugandaParties';

// Move CreateCandidateModal OUTSIDE of Candidates
function CreateCandidateModal({
  form,
  handleFormChange,
  handleUserSelect,
  handleFormSubmit,
  creating,
  setShowCreate,
  users,
  elections,
  positionsOptions,
}) {
  const userOptions = users.map((u) => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  }));

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Candidate</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowCreate(false)}
            ></button>
          </div>
          <form onSubmit={handleFormSubmit} encType="multipart/form-data">
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">User*</label>
                  <Select
                    options={userOptions}
                    value={
                      userOptions.find((opt) => opt.value === form.user) ||
                      null
                    }
                    onChange={handleUserSelect}
                    placeholder="Search or select user..."
                    isClearable
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Election*</label>
                  <select
                    className="form-select"
                    name="election"
                    value={form.election}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Election</option>
                    {elections.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.title || e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Name*</label>
                  <input
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Photo</label>
                  <input
                    type="file"
                    className="form-control bg-primary text-white"
                    style={{ border: "none" }}
                    name="photo"
                    accept="image/*"
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Position*</label>
                  {positionsOptions && positionsOptions.length > 0 ? (
                    <select
                      className="form-select"
                      name="position"
                      value={form.position}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Position</option>
                      {positionsOptions.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-control"
                      name="position"
                      value={form.position}
                      onChange={handleFormChange}
                      placeholder="Enter position (no positions found for selected election)"
                      required
                    />
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Symbol (Photo)</label>
                  <input
                    type="file"
                    className="form-control bg-primary text-white"
                    style={{ border: "none" }}
                    name="symbol"
                    accept="image/*"
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Party</label>
                  <Select
                    options={ugandaPartiesOptions}
                    value={
                      ugandaPartiesOptions.find((opt) => opt.value === form.party) || null
                    }
                    onChange={(opt) =>
                      handleFormChange({ target: { name: 'party', value: opt ? opt.value : '' } })
                    }
                    placeholder="Search or select party..."
                    isClearable
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Description*</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Manifesto</label>
                  <textarea
                    className="form-control"
                    name="manifesto"
                    value={form.manifesto}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Candidate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Candidates({ user }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [elections, setElections] = useState([]);
  const [users, setUsers] = useState([]);
  const [positionsOptions, setPositionsOptions] = useState([]);
  const [form, setForm] = useState({
    user: "",
    election: "",
    name: "",
    photo: null,
    position: "",
    symbol: null,
    party: "",
    description: "",
    manifesto: "",
  });
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem("token");

  const fetchCandidates = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:5000/api/candidates/search?q=${encodeURIComponent(
            query
          )}`
        : "http://localhost:5000/api/candidates";
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(res.data);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to load candidates",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchElectionsAndUsers = async () => {
    try {
      const [electionRes, userRes] = await Promise.all([
        axios.get("http://localhost:5000/api/elections", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  setElections(electionRes.data.elections || []);
      setUsers(userRes.data);
      // If a specific election already selected in form, populate positionsOptions
      if (form.election) {
        const selected = (electionRes.data.elections || []).find((ev) => ev._id === form.election);
        if (selected && Array.isArray(selected.positions)) {
          setPositionsOptions(selected.positions.map((p) => ({ value: p, label: p })));
        }
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load elections or users", "error");
    }
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/candidates/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", "Candidate approved", "success");
      fetchCandidates(search);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to approve",
        "error"
      );
    }
  };

  const handleDisqualify = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/candidates/${id}/disqualify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", "Candidate disqualified", "success");
      fetchCandidates(search);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to disqualify",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the candidate.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/candidates/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted", "Candidate deleted", "success");
          fetchCandidates(search);
        } catch (err) {
          Swal.fire(
            "Error",
            err.response?.data?.message || "Failed to delete",
            "error"
          );
        }
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidates(search);
  };

  const handleShowCreate = () => {
    fetchElectionsAndUsers();
    setShowCreate(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files && files[0] ? files[0] : null,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      // If election changed, update positionsOptions from elections
      if (name === 'election') {
        const selected = elections.find((ev) => ev._id === value);
        if (selected && Array.isArray(selected.positions)) {
          setPositionsOptions(selected.positions.map((p) => ({ value: p, label: p })));
        } else {
          setPositionsOptions([]);
        }
        // clear any previously selected position
        setForm((prev) => ({ ...prev, position: '' }));
      }
    }
  };

  const handleUserSelect = (option) => {
    setForm((prev) => ({ ...prev, user: option ? option.value : "" }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.user ||
      !form.election ||
      !form.name ||
      !form.position ||
      !form.description
    ) {
      Swal.fire("Error", "Please fill all required fields.", "error");
      return;
    }
    setCreating(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      await axios.post("http://localhost:5000/api/candidates", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Success", "Candidate created successfully!", "success");
      setShowCreate(false);
      setForm({
        user: "",
        election: "",
        name: "",
        photo: null,
        position: "",
        symbol: null,
        party: "",
        description: "",
        manifesto: "",
      });
      fetchCandidates();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to create candidate",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
  <div
    className="container-fluid d-flex flex-column justify-content-center align-items-center"
    style={{ minHeight: "90vh" }}
  >
    <div className="w-100" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">Candidates</h3>
        {user?.role === "admin" && (
          <button className="btn btn-primary" onClick={handleShowCreate}>
            + Create Candidate
          </button>
        )}
      </div>
      <form className="mb-3" onSubmit={handleSearch}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary" type="submit">
            Search
          </button>
        </div>
      </form>
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "40vh" }}
        >
          <div className="text-center">Loading candidates...</div>
        </div>
      ) : candidates.length === 0 ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "40vh" }}
        >
          <div className="text-muted text-center">No candidates found.</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Symbol</th>
                <th>Party</th>
                <th>Election</th>
                <th>Position</th>
                <th>Status</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c._id}>
                  <td>
                    {c.photo ? (
                      (() => {
                        const imgSrc = getImageUrl(c.photo);
                        return (
                          <img
                            src={imgSrc}
                            alt="Candidate"
                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "50%" }}
                          />
                        );
                      })()
                    ) : (
                      <span className="text-muted">No Photo</span>
                    )}
                  </td>
                  <td>{c.name}</td>
                  <td>
                    {c.symbol ? (
                      <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px' }}>
                        <img 
                          src={getImageUrl(c.symbol)} 
                          alt="symbol" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      </div>
                    ) : (
                      <span className="text-muted small">No Symbol</span>
                    )}
                  </td>
                  <td>{c.party ? c.party : <span className="text-muted">-</span>}</td>
                  {/* <td>{c.email}</td> */}
                  
                  {/* <td>{c.party || <span className="text-muted">-</span>}</td> */}
                  <td>{c.election?.title || c.election?.name || "-"}</td>
                  <td>{c.position}</td>
                  <td>{c.status}</td>
                  {user?.role === "admin" && (
                    <td>
                      <button
                        className="btn btn-success btn-sm me-1"
                        onClick={() => handleApprove(c._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-warning btn-sm me-1"
                        onClick={() => handleDisqualify(c._id)}
                      >
                        Disqualify
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showCreate && (
        <CreateCandidateModal
          form={form}
          handleFormChange={handleFormChange}
          handleUserSelect={handleUserSelect}
          handleFormSubmit={handleFormSubmit}
          creating={creating}
          setShowCreate={setShowCreate}
          users={users}
          elections={elections}
          positionsOptions={positionsOptions}
        />
      )}
    </div>
  </div>
)
}

export default Candidates;