import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Search, Box, Trash2, Edit3, X, Loader2, MapPin } from 'lucide-react';

interface Asset {
  id: string; name: string; category: string; serialNo: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
  roomId?: string;
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

  const [formData, setFormData] = useState({ name: '', category: '', serialNo: '', status: 'ACTIVE', roomId: '' });

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
        roomId: asset.roomId || ''
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
      setFormData({ name: '', category: '', serialNo: '', status: 'ACTIVE', roomId: '' });
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
      // Clean up the payload - convert empty strings to null for optional fields
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        serialNo: formData.serialNo.trim() || undefined, // undefined will be omitted from JSON
        status: formData.status,
        roomId: selectedRoomId || undefined, // undefined will be omitted from JSON
      };
      
      if (editingId) {
        await apiClient.patch(`/assets/${editingId}`, payload);
        toast.success('Asset updated successfully');
      } else {
        await apiClient.post('/assets', payload);
        toast.success('Asset created successfully');
      }
      setModalOpen(false);
      fetchAssets();
    } catch (error) { toast.error('Operation failed'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await apiClient.delete(`/assets/${id}`);
        toast.success('Asset removed');
        fetchAssets();
      } catch (error) { toast.error('Failed to delete'); }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-status-success-light text-status-success-dark border-status-success",
      MAINTENANCE: "bg-status-warning-light text-status-warning-dark border-status-warning",
      RETIRED: "bg-status-danger-light text-status-danger-dark border-status-danger",
      INACTIVE: "bg-secondary-100 text-secondary-600 border-secondary-200"
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-secondary-50 text-secondary-500 border-secondary-200"}`}>
        {status}
      </span>
    );
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Assets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your facility assets and equipment</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search assets..." 
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
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-secondary-400">
                      <div className="w-5 h-5 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading assets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-secondary-500">
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer" 
                        onClick={() => navigate(`/assets/${asset.id}`)}
                      >
                        <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center border border-primary-200 hover:bg-primary-600 hover:text-white transition-colors">
                          <Box className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-slate-900 hover:text-primary-600 transition-colors">
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{asset.category}</td>
                    <td className="px-6 py-4 text-sm text-secondary-500 font-mono">{asset.serialNo || '—'}</td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(asset)} 
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(asset.id, asset.name)} 
                          className="p-2 text-status-danger hover:bg-status-danger-light rounded-md transition-colors"
                        >
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1 text-secondary-400 hover:text-secondary-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Asset Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter asset name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., HVAC, Electrical"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Serial Number</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                    value={formData.serialNo} 
                    onChange={e => setFormData({...formData, serialNo: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select 
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              {/* Location Section - Cascading Dropdowns */}
              <div className="space-y-4 pt-2 border-t border-secondary-200">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MapPin className="w-4 h-4" />
                  <span>Location (Optional)</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Building Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Building</label>
                    <select 
                      className="w-full px-2 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                      value={selectedBuildingId} 
                      onChange={(e) => {
                        setSelectedBuildingId(e.target.value);
                        setSelectedFloorId('');
                        setSelectedRoomId('');
                      }}
                    >
                      <option value="">Select Building</option>
                      {buildings.map(building => (
                        <option key={building.id} value={building.id}>{building.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Floor Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Floor</label>
                    <select 
                      className="w-full px-2 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                      value={selectedFloorId} 
                      disabled={!selectedBuildingId}
                      onChange={(e) => {
                        setSelectedFloorId(e.target.value);
                        setSelectedRoomId('');
                      }}
                    >
                      <option value="">Select Floor</option>
                      {selectedBuildingId && 
                        buildings.find(b => b.id === selectedBuildingId)?.floors.map(floor => (
                          <option key={floor.id} value={floor.id}>{floor.number}</option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Room Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Room</label>
                    <select 
                      className="w-full px-2 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                      value={selectedRoomId} 
                      disabled={!selectedFloorId}
                      onChange={(e) => {
                        setSelectedRoomId(e.target.value);
                      }}
                    >
                      <option value="">Select Room</option>
                      {selectedFloorId && 
                        buildings
                          .find(b => b.id === selectedBuildingId)
                          ?.floors.find(f => f.id === selectedFloorId)
                          ?.rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                          ))
                      }
                    </select>
                  </div>
                </div>

                {selectedRoomId && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-md text-sm text-primary-700">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {buildings.find(b => b.id === selectedBuildingId)?.name} →{' '}
                      {buildings.find(b => b.id === selectedBuildingId)?.floors.find(f => f.id === selectedFloorId)?.number} →{' '}
                      {buildings.find(b => b.id === selectedBuildingId)?.floors.find(f => f.id === selectedFloorId)?.rooms.find(r => r.id === selectedRoomId)?.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 font-medium rounded-md hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Update Asset' : 'Create Asset'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;