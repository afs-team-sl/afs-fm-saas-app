import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Search, Box, Trash2, Edit3, X, Loader2, MapPin, FileUp, Settings2, Wrench } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNo?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
  roomId?: string;
  site?: string;
  location?: string;
  customId?: string;
  assetNumber?: string;
  manufacturer?: string;
  modelNumber?: string;
  installYear?: number;
  filterSize?: string;
  beltSize?: string;
  notes?: string;
}

interface Room {
  id: string;
  name: string;
  floorId: string;
  floor: {
    id: string;
    number: string;
    buildingId: string;
    building: {
      id: string;
      name: string;
    };
  };
}

interface Floor {
  id: string;
  number: string;
  buildingId: string;
  rooms: Room[];
}

interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

const AssetsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Facility hierarchy data
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serialNo: '',
    status: 'ACTIVE',
    roomId: '',
    site: '',
    location: '',
    customId: '',
    assetNumber: '',
    manufacturer: '',
    modelNumber: '',
    installYear: '',
    filterSize: '',
    beltSize: '',
    notes: '',
  });

  useEffect(() => { 
    fetchAssets(); 
    fetchFacilities();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await apiClient.get('/assets');
      setAssets(response.data);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally { setLoading(false); }
  };

  const fetchFacilities = async () => {
    try {
      const response = await apiClient.get('/facilities/tree');
      setBuildings(response.data);
    } catch (error) {
      console.error('Failed to load facilities');
    }
  };

  const handleOpenModal = (asset?: Asset) => {
    if (asset) {
      setEditingId(asset.id);
      setFormData({
        name: asset.name,
        category: asset.category,
        serialNo: asset.serialNo || '',
        status: asset.status,
        roomId: asset.roomId || '',
        site: asset.site || '',
        location: asset.location || '',
        customId: asset.customId || '',
        assetNumber: asset.assetNumber || '',
        manufacturer: asset.manufacturer || '',
        modelNumber: asset.modelNumber || '',
        installYear: asset.installYear?.toString() || '',
        filterSize: asset.filterSize || '',
        beltSize: asset.beltSize || '',
        notes: asset.notes || '',
      });

      // Pre-select cascading dropdowns if asset has roomId
      if (asset.roomId) {
        setSelectedRoomId(asset.roomId);
        // Find the room to get building and floor
        const room = findRoomById(asset.roomId);
        if (room) {
          setSelectedBuildingId(room.floor.building.id);
          setSelectedFloorId(room.floor.id);
        }
      }
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: '',
        serialNo: '',
        status: 'ACTIVE',
        roomId: '',
        site: '',
        location: '',
        customId: '',
        assetNumber: '',
        manufacturer: '',
        modelNumber: '',
        installYear: '',
        filterSize: '',
        beltSize: '',
        notes: '',
      });
      setSelectedBuildingId('');
      setSelectedFloorId('');
      setSelectedRoomId('');
    }
    setModalOpen(true);
  };

  const findRoomById = (roomId: string): Room | undefined => {
    for (const building of buildings) {
      for (const floor of building.floors) {
        const room = floor.rooms.find(r => r.id === roomId);
        if (room) {
          return {
            ...room,
            floor: {
              ...floor,
              building: {
                id: building.id,
                name: building.name,
              },
            },
          };
        }
      }
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Clean up the payload - convert empty strings to null/undefined for optional fields
      const payload: any = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        status: formData.status,
      };

      // Add optional fields only if they have values
      if (formData.serialNo.trim()) payload.serialNo = formData.serialNo.trim();
      if (selectedRoomId) payload.roomId = selectedRoomId;
      if (formData.site.trim()) payload.site = formData.site.trim();
      if (formData.location.trim()) payload.location = formData.location.trim();
      if (formData.customId.trim()) payload.customId = formData.customId.trim();
      if (formData.assetNumber.trim()) payload.assetNumber = formData.assetNumber.trim();
      if (formData.manufacturer.trim()) payload.manufacturer = formData.manufacturer.trim();
      if (formData.modelNumber.trim()) payload.modelNumber = formData.modelNumber.trim();
      if (formData.installYear.trim()) payload.installYear = parseInt(formData.installYear);
      if (formData.filterSize.trim()) payload.filterSize = formData.filterSize.trim();
      if (formData.beltSize.trim()) payload.beltSize = formData.beltSize.trim();
      if (formData.notes.trim()) payload.notes = formData.notes.trim();

      if (editingId) {
        await apiClient.patch(`/assets/${editingId}`, payload);
        toast.success('Asset updated successfully');
      } else {
        await apiClient.post('/assets', payload);
        toast.success('Asset created successfully');
      }
      setModalOpen(false);
      fetchAssets();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await apiClient.delete(`/assets/${id}`);
        toast.success('Asset removed');
        fetchAssets();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  /**
   * HANDLE EXCEL IMPORT 📊
   * Maps Excel columns to our Prisma schema
   */
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Map Excel headers to our schema
      const mappedAssets = jsonData.map((row: any) => ({
        name: row['Type'] || row['type'] || 'Unnamed Asset',
        category: row['Type'] || row['type'] || 'General',
        serialNo: row['Serial'] || row['serial'] || undefined,
        status: 'ACTIVE',
        site: row['Site'] || row['site'] || undefined,
        location: row['Location'] || row['location'] || undefined,
        customId: row['ID'] || row['id'] || undefined,
        assetNumber: row['Number'] || row['number'] || undefined,
        manufacturer: row['Manufacture'] || row['manufacture'] || row['Manufacturer'] || undefined,
        modelNumber: row['Model'] || row['model'] || undefined,
        installYear: row['Install Year'] || row['install year'] || undefined,
        filterSize: row['filter size'] || row['Filter Size'] || undefined,
        beltSize: row['Belt size'] || row['belt size'] || undefined,
        notes: row['Note'] || row['note'] || row['Notes'] || undefined,
      }));

      // Show progress toast
      const loadingToast = toast.loading(`Importing ${mappedAssets.length} assets...`);

      // Send to backend
      const response = await apiClient.post('/assets/bulk', mappedAssets);

      toast.dismiss(loadingToast);
      toast.success(response.data.message || 'Assets imported successfully!');

      // Refresh the asset list
      fetchAssets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * HANDLE DELETE ALL ASSETS 🗑️
   * Requires user confirmation by typing "DELETE"
   */
  const handleDeleteAll = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to delete ALL assets? This action cannot be undone.\n\nType "DELETE" to confirm:'
    );

    if (confirmation === 'DELETE') {
      try {
        const loadingToast = toast.loading('Deleting all assets...');
        const response = await apiClient.delete('/assets/bulk/all');
        toast.dismiss(loadingToast);
        toast.success(response.data.message || 'All assets deleted successfully');
        fetchAssets();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete assets');
      }
    } else if (confirmation !== null) {
      toast.error('Confirmation text did not match. Deletion cancelled.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-status-success-light text-status-success-dark border-status-success",
      MAINTENANCE: "bg-status-warning-light text-status-warning-dark border-status-warning",
      RETIRED: "bg-status-danger-light text-status-danger-dark border-status-danger",
      INACTIVE: "bg-secondary-100 text-secondary-600 border-secondary-200"
    };
    
    // Add pulsing animation for MAINTENANCE status
    const pulseAnimation = status === 'MAINTENANCE' ? 'animate-pulse' : '';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-secondary-50 text-secondary-500 border-secondary-200"} ${pulseAnimation}`}>
        {status === 'MAINTENANCE' && (
          <span className="mr-1.5 relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
          </span>
        )}
        {status}
      </span>
    );
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.site?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Assets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your facility assets and equipment</p>
        </div>
        <div className="flex gap-3">
          {/* Import Excel Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#232249] text-[#232249] font-medium rounded-md hover:bg-[#232249] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#232249] focus:ring-offset-2 transition-all"
          >
            <FileUp className="w-4 h-4" />
            Import Excel
          </button>
          
          {/* Clear All Assets Button */}
          {assets.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-600 text-red-600 font-medium rounded-md hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
          
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#232249] text-white font-medium rounded-md hover:bg-[#1a1a35] focus:outline-none focus:ring-2 focus:ring-[#232249] focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name, serial number, category..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Name (Type)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Serial Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Manufacturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-secondary-400">
                      <div className="w-5 h-5 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading assets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-secondary-500">
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/assets/${asset.id}`)}>
                        <div className="w-10 h-10 bg-[#232249]/10 text-[#232249] rounded-lg flex items-center justify-center border border-[#232249]/20 hover:bg-[#232249] hover:text-white transition-colors">
                          <Settings2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 hover:text-[#232249] transition-colors">
                            {asset.name}
                          </div>
                          <div className="text-xs text-secondary-500">{asset.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {asset.assetNumber && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-secondary-500 font-medium">Internal Tag:</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs">
                              {asset.assetNumber}
                            </span>
                          </div>
                        )}
                        {asset.serialNo && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-secondary-500 font-medium">Factory SN:</span>
                            <span className="text-secondary-700 font-mono text-xs font-semibold">
                              {asset.serialNo}
                            </span>
                          </div>
                        )}
                        {!asset.assetNumber && !asset.serialNo && (
                          <span className="text-secondary-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{asset.site || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{asset.manufacturer || '—'}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(asset)} className="p-2 text-[#232249] hover:bg-[#232249]/10 rounded-md transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(asset.id, asset.name)} className="p-2 text-status-danger hover:bg-status-danger-light rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Redesigned with Better Layout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header - Fixed */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-secondary-200 bg-gradient-to-r from-[#232249] to-[#2d2d5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {editingId ? 'Edit Asset' : 'Add New Asset'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Section 1: General Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b-2 border-[#232249]/20">
                    <div className="w-8 h-8 bg-[#232249]/10 rounded-lg flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-[#232249]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#232249]">General Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Asset Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter asset name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Type/Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., HVAC, Chiller, AHU"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Manufacturer</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        placeholder="e.g., Carrier, Trane"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Model Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.modelNumber}
                        onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                        placeholder="e.g., 30RB-080"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Technical Specifications */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-3 border-b-2 border-[#232249]/20">
                    <div className="w-8 h-8 bg-[#232249]/10 rounded-lg flex items-center justify-center">
                      <Settings2 className="w-4 h-4 text-[#232249]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#232249]">Technical Specifications</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Asset Number (Internal Tag)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.assetNumber}
                        onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
                        placeholder="e.g., A-2024-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Serial Number (Factory SN)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.serialNo}
                        onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                        placeholder="e.g., SN-12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Install Year</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.installYear}
                        onChange={(e) => setFormData({ ...formData, installYear: e.target.value })}
                        placeholder="e.g., 2020"
                        min="1900"
                        max="2100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Filter Size</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.filterSize}
                        onChange={(e) => setFormData({ ...formData, filterSize: e.target.value })}
                        placeholder="e.g., 20x25x4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Belt Size</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.beltSize}
                        onChange={(e) => setFormData({ ...formData, beltSize: e.target.value })}
                        placeholder="e.g., B-54"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Location & Notes */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 pb-3 border-b-2 border-[#232249]/20">
                    <div className="w-8 h-8 bg-[#232249]/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#232249]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#232249]">Location & Notes</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Site</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.site}
                        onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                        placeholder="e.g., Main Campus"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Building A - Roof"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all bg-white"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="RETIRED">Retired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                        value={formData.customId}
                        onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                        placeholder="e.g., HVAC-001"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all resize-none"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes or comments..."
                      />
                    </div>
                  </div>
                </div>

                {/* Facility Hierarchy (Optional) - Collapsible */}
                <div className="space-y-4 pt-2 pb-4">
                  <div className="flex items-center gap-2 pb-3 border-b-2 border-secondary-200">
                    <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Box className="w-4 h-4 text-secondary-600" />
                    </div>
                    <h3 className="text-base font-medium text-secondary-700">Facility Hierarchy (Optional)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Building</label>
                      <select
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all bg-white"
                        value={selectedBuildingId}
                        onChange={(e) => {
                          setSelectedBuildingId(e.target.value);
                          setSelectedFloorId('');
                          setSelectedRoomId('');
                        }}
                      >
                        <option value="">Select Building</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Floor</label>
                      <select
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        value={selectedFloorId}
                        disabled={!selectedBuildingId}
                        onChange={(e) => {
                          setSelectedFloorId(e.target.value);
                          setSelectedRoomId('');
                        }}
                      >
                        <option value="">Select Floor</option>
                        {selectedBuildingId &&
                          buildings
                            .find((b) => b.id === selectedBuildingId)
                            ?.floors.map((floor) => (
                              <option key={floor.id} value={floor.id}>
                                {floor.number}
                              </option>
                            ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Room</label>
                      <select
                        className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        value={selectedRoomId}
                        disabled={!selectedFloorId}
                        onChange={(e) => {
                          setSelectedRoomId(e.target.value);
                        }}
                      >
                        <option value="">Select Room</option>
                        {selectedFloorId &&
                          buildings
                            .find((b) => b.id === selectedBuildingId)
                            ?.floors.find((f) => f.id === selectedFloorId)
                            ?.rooms.map((room) => (
                              <option key={room.id} value={room.id}>
                                {room.name}
                              </option>
                            ))}
                      </select>
                    </div>
                  </div>

                  {selectedRoomId && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#232249]/5 border border-[#232249]/20 rounded-lg text-sm text-[#232249]">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">
                        {buildings.find((b) => b.id === selectedBuildingId)?.name} →{' '}
                        {buildings.find((b) => b.id === selectedBuildingId)?.floors.find((f) => f.id === selectedFloorId)?.number} →{' '}
                        {buildings.find((b) => b.id === selectedBuildingId)?.floors.find((f) => f.id === selectedFloorId)?.rooms.find((r) => r.id === selectedRoomId)?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="border-t border-secondary-200 bg-secondary-50 px-6 py-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border-2 border-secondary-300 text-secondary-700 font-medium rounded-lg hover:bg-white hover:border-secondary-400 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#232249] text-white font-semibold rounded-lg hover:bg-[#1a1a35] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#232249]/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      'Update Asset'
                    ) : (
                      'Create Asset'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
