import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from '../../contexts/ThemeContext';
import { FaImages, FaPlus } from 'react-icons/fa';
import Loader from '../common/Loader';
import MaterialsStats from './materials/MaterialsStats';
import MaterialsFilter from './materials/MaterialsFilter';
import MaterialsGrid from './materials/MaterialsGrid';
import MaterialPreview from './materials/MaterialPreview';
import UploadProgress from './materials/UploadProgress';

const CampaignMaterials = () => {
  const { colors, isDarkMode } = useTheme();
  const fileInputRef = useRef(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidate/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      Swal.fire('Error', 'Failed to load materials. Please try again.', 'error');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const result = await Swal.fire({
      title: 'Upload Materials',
      html: `
        <div class="mb-3 text-start">
          <label class="form-label fw-semibold" style="color: ${isDarkMode ? '#e2e8f0' : '#374151'}">Category</label>
          <select id="category" class="form-select" style="
            background-color: ${isDarkMode ? '#374151' : '#fff'};
            color: ${isDarkMode ? '#e2e8f0' : '#1f2937'};
            border-color: ${isDarkMode ? '#4b5563' : '#d1d5db'};
          ">
            <option value="posters">Poster</option>
            <option value="flyers">Flyer</option>
            <option value="manifestos">Manifesto</option>
            <option value="videos">Video</option>
            <option value="photos">Photo</option>
          </select>
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-semibold" style="color: ${isDarkMode ? '#e2e8f0' : '#374151'}">Title</label>
          <input id="title" class="form-control" placeholder="Material title" style="
            background-color: ${isDarkMode ? '#374151' : '#fff'};
            color: ${isDarkMode ? '#e2e8f0' : '#1f2937'};
            border-color: ${isDarkMode ? '#4b5563' : '#d1d5db'};
          " />
        </div>
        <div class="small" style="color: ${isDarkMode ? '#9ca3af' : '#6b7280'}">
          ${files.length} file(s) selected
        </div>
      `,
      background: isDarkMode ? '#1f2937' : '#fff',
      color: isDarkMode ? '#e2e8f0' : '#1f2937',
      showCancelButton: true,
      confirmButtonText: 'Upload',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const category = document.getElementById('category').value;
        const title = document.getElementById('title').value;
        if (!title) {
          Swal.showValidationMessage('Please enter a title');
          return false;
        }
        return { category, title };
      }
    });

    if (result.isConfirmed) {
      const { category, title } = result.value;
      
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('category', category);
        formData.append('title', title);

        const token = localStorage.getItem('token');
        await axios.post('/api/candidate/materials', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });

        setIsUploading(false);
        setUploadProgress(0);
        Swal.fire('Success', 'Materials uploaded successfully!', 'success');
        fetchMaterials();
      } catch (error) {
        console.error('Error uploading materials:', error);
        setIsUploading(false);
        setUploadProgress(0);
        Swal.fire('Error', 'Failed to upload materials. Please try again.', 'error');
      }
    }
  };

  const handleDelete = async (materialId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This material will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({
          title: 'Deleting...',
          text: 'Please wait while the material is being removed.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const token = localStorage.getItem('token');
        await axios.delete(`/api/candidate/materials/${materialId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        Swal.fire('Deleted!', 'Material has been deleted.', 'success');
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        Swal.fire('Error', 'Failed to delete material.', 'error');
      }
    }
  };

  const handleDownload = async (material) => {
    try {
      Swal.fire({
        title: 'Downloading...',
        text: 'Please wait while your file is being prepared.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/candidate/materials/${material._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Get filename from content-disposition header or use original name
      const contentDisposition = response.headers['content-disposition'];
      let filename = material.originalName || material.title;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Ensure filename has an extension
      if (!filename.includes('.') && material.fileType) {
        const ext = material.fileType.split('/')[1];
        if (ext) {
          filename = `${filename}.${ext === 'jpeg' ? 'jpg' : ext}`;
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.close();
      
      // Refresh to show updated download counts
      fetchMaterials();
    } catch (error) {
      console.error('Error downloading material:', error);
      Swal.fire('Error', 'Failed to download material.', 'error');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = (material.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: materials.length,
    totalSize: materials.reduce((sum, m) => sum + (m.fileSize || 0), 0),
    totalDownloads: materials.reduce((sum, m) => sum + (m.downloads || 0), 0),
    totalViews: materials.reduce((sum, m) => sum + (m.views || 0), 0)
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader message="Loading materials..." size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: '1.5rem', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="row align-items-center">
          <div className="col-12 col-md-8">
            <h4 className="fw-bold mb-2" style={{ color: colors.text, fontSize: '1.25rem' }}>
              <FaImages className="me-2" style={{ color: '#3b82f6' }} />
              Campaign Materials
            </h4>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Upload and manage your campaign content</p>
          </div>
          <div className="col-12 col-md-4 mt-3 mt-md-0 text-md-end">
            <button
              className="btn btn-primary w-100 w-md-auto"
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd',
                color: '#fff',
                fontWeight: '500'
              }}
            >
              <FaPlus className="me-2" />
              Upload Materials
            </button>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Stats Cards */}
      <MaterialsStats stats={stats} />

      {/* Upload Progress */}
      <UploadProgress progress={uploadProgress} isUploading={isUploading} />

      {/* Category Filters & Search */}
      <MaterialsFilter
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        materials={materials}
      />

      {/* Materials Grid */}
      <div className="row g-3 g-md-4" style={{ margin: '0', width: '100%' }}>
        <MaterialsGrid
          materials={filteredMaterials}
          onDownload={handleDownload}
          onPreview={setShowPreview}
          onDelete={handleDelete}
          onUploadClick={() => fileInputRef.current?.click()}
        />
      </div>

      {/* Preview Modal */}
      <MaterialPreview
        material={showPreview}
        onClose={() => setShowPreview(null)}
      />
    </div>
  );
};

export default CampaignMaterials;