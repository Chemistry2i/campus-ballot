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
  const { isDarkMode, colors } = useTheme();
  const fileInputRef = useRef(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/candidate/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching materials:', error);
      // Fallback dummy data
      setMaterials([
        {
          _id: '1',
          title: 'Campaign Poster 2025',
          category: 'posters',
          fileType: 'image/png',
          fileSize: 2.5,
          url: '/uploads/poster1.png',
          uploadDate: '2025-01-10',
          downloads: 45,
          views: 123
        },
        {
          _id: '2',
          title: 'Election Manifesto',
          category: 'manifestos',
          fileType: 'application/pdf',
          fileSize: 1.2,
          url: '/uploads/manifesto.pdf',
          uploadDate: '2025-01-12',
          downloads: 67,
          views: 234
        },
        {
          _id: '3',
          title: 'Campaign Video - Introduction',
          category: 'videos',
          fileType: 'video/mp4',
          fileSize: 15.6,
          url: '/uploads/intro.mp4',
          uploadDate: '2025-01-11',
          downloads: 23,
          views: 156
        },
        {
          _id: '4',
          title: 'Event Flyer',
          category: 'flyers',
          fileType: 'image/jpeg',
          fileSize: 1.8,
          url: '/uploads/flyer1.jpg',
          uploadDate: '2025-01-13',
          downloads: 89,
          views: 201
        },
        {
          _id: '5',
          title: 'Campaign Team Photo',
          category: 'photos',
          fileType: 'image/jpeg',
          fileSize: 3.2,
          url: '/uploads/team.jpg',
          uploadDate: '2025-01-14',
          downloads: 34,
          views: 98
        }
      ]);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const result = await Swal.fire({
      title: 'Upload Materials',
      html: `
        <div class="mb-3">
          <label class="form-label fw-semibold">Category</label>
          <select id="category" class="form-select">
            <option value="posters">Poster</option>
            <option value="flyers">Flyer</option>
            <option value="manifestos">Manifesto</option>
            <option value="videos">Video</option>
            <option value="photos">Photo</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label fw-semibold">Title</label>
          <input id="title" class="form-control" placeholder="Material title" />
        </div>
        <div class="small text-muted">
          ${files.length} file(s) selected
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
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

        Swal.fire('Success', 'Materials uploaded successfully!', 'success');
        fetchMaterials();
        setUploadProgress(0);
      } catch (error) {
        console.error('Error uploading materials:', error);
        Swal.fire('Error', 'Failed to upload materials. Please try again.', 'error');
        setUploadProgress(0);
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
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/candidate/materials/${material._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading material:', error);
      Swal.fire('Error', 'Failed to download material.', 'error');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: materials.length,
    totalSize: materials.reduce((sum, m) => sum + m.fileSize, 0),
    totalDownloads: materials.reduce((sum, m) => sum + m.downloads, 0),
    totalViews: materials.reduce((sum, m) => sum + m.views, 0)
  };

  if (loading) {
    return <Loader message="Loading materials..." />;
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
      <UploadProgress progress={uploadProgress} />

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