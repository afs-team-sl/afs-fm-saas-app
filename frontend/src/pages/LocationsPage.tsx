import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Home, Layers, DoorOpen, Plus, Edit3, Trash2, ChevronRight, ChevronDown, X, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Room {
  id: string;
  name: string;
  floorId: string;
  _count?: { assets: number };
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
  address?: string;
  floors: Floor[];
}

const LocationsPage = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set());
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());

  // Modals
  const [isBuildingModalOpen, setBuildingModalOpen] = useState(false);
  const [isFloorModalOpen, setFloorModalOpen] = useState(false);
  const [isRoomModalOpen, setRoomModalOpen] = useState(false);

  // Form data
  const [buildingForm, setBuildingForm] = useState({ name: '', address: '' });
  const [floorForm, setFloorForm] = useState({ number: '', buildingId: '' });
  const [roomForm, setRoomForm] = useState({ name: '', floorId: '' });

  // Editing
  const [editingBuildingId, setEditingBuildingId] = useState<string | null>(null);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const res = await apiClient.get('/facilities/tree');
      setBuildings(res.data);
    } catch (error) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const toggleBuilding = (buildingId: string) => {
    const newExpanded = new Set(expandedBuildings);
    if (newExpanded.has(buildingId)) {
      newExpanded.delete(buildingId);
    } else {
      newExpanded.add(buildingId);
    }
    setExpandedBuildings(newExpanded);
  };

  const toggleFloor = (floorId: string) => {
    const newExpanded = new Set(expandedFloors);
    if (newExpanded.has(floorId)) {
      newExpanded.delete(floorId);
    } else {
      newExpanded.add(floorId);
    }
    setExpandedFloors(newExpanded);
  };

  // Building CRUD
  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBuildingId) {
        await apiClient.patch(`/facilities/buildings/${editingBuildingId}`, buildingForm);
        toast.success('Building updated');
      } else {
        await apiClient.post('/facilities/buildings', buildingForm);
        toast.success('Building created');
      }
      setBuildingModalOpen(false);
      setBuildingForm({ name: '', address: '' });
      setEditingBuildingId(null);
      fetchBuildings();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteBuilding = async (id: string, name: string) => {
    if (window.confirm(`Delete building "${name}" and all its floors and rooms?`)) {
      try {
        await apiClient.delete(`/facilities/buildings/${id}`);
        toast.success('Building deleted');
        fetchBuildings();
      } catch (error) {
        toast.error('Failed to delete building');
      }
    }
  };

  // Floor CRUD
  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFloorId) {
        await apiClient.patch(`/facilities/floors/${editingFloorId}`, floorForm);
        toast.success('Floor updated');
      } else {
        await apiClient.post('/facilities/floors', floorForm);
        toast.success('Floor created');
      }
      setFloorModalOpen(false);
      setFloorForm({ number: '', buildingId: '' });
      setEditingFloorId(null);
      fetchBuildings();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteFloor = async (id: string, number: string) => {
    if (window.confirm(`Delete floor "${number}" and all its rooms?`)) {
      try {
        await apiClient.delete(`/facilities/floors/${id}`);
        toast.success('Floor deleted');
        fetchBuildings();
      } catch (error) {
        toast.error('Failed to delete floor');
      }
    }
  };

  // Room CRUD
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoomId) {
        await apiClient.patch(`/facilities/rooms/${editingRoomId}`, roomForm);
        toast.success('Room updated');
      } else {
        await apiClient.post('/facilities/rooms', roomForm);
        toast.success('Room created');
      }
      setRoomModalOpen(false);
      setRoomForm({ name: '', floorId: '' });
      setEditingRoomId(null);
      fetchBuildings();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteRoom = async (id: string, name: string) => {
    if (window.confirm(`Delete room "${name}"?`)) {
      try {
        await apiClient.delete(`/facilities/rooms/${id}`);
        toast.success('Room deleted');
        fetchBuildings();
      } catch (error) {
        toast.error('Failed to delete room');
      }
    }
  };

  const openBuildingModal = (building?: Building) => {
    if (building) {
      setEditingBuildingId(building.id);
      setBuildingForm({ name: building.name, address: building.address || '' });
    } else {
      setEditingBuildingId(null);
      setBuildingForm({ name: '', address: '' });
    }
    setBuildingModalOpen(true);
  };

  const openFloorModal = (buildingId: string, floor?: Floor) => {
    if (floor) {
      setEditingFloorId(floor.id);
      setFloorForm({ number: floor.number, buildingId: floor.buildingId });
    } else {
      setEditingFloorId(null);
      setFloorForm({ number: '', buildingId });
    }
    setFloorModalOpen(true);
  };

  const openRoomModal = (floorId: string, room?: Room) => {
    if (room) {
      setEditingRoomId(room.id);
      setRoomForm({ name: room.name, floorId: room.floorId });
    } else {
      setEditingRoomId(null);
      setRoomForm({ name: '', floorId });
    }
    setRoomModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Locations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your facility hierarchy</p>
        </div>
        <button
          onClick={() => openBuildingModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Building
        </button>
      </div>

      {/* Buildings Tree */}
      <div className="bg-white rounded-lg border border-secondary-200 shadow-sm">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-5 h-5 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : buildings.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
            <p className="text-sm text-secondary-500">No buildings found. Add your first building to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-200">
            {buildings.map((building) => (
              <div key={building.id}>
                {/* Building Row */}
                <div className="flex items-center justify-between px-6 py-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleBuilding(building.id)}
                      className="text-secondary-400 hover:text-primary-600 transition-colors"
                    >
                      {expandedBuildings.has(building.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <Home className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-slate-900">{building.name}</p>
                      {building.address && (
                        <p className="text-xs text-slate-500 mt-0.5">{building.address}</p>
                      )}
                    </div>
                    <span className="ml-3 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                      {building.floors.length} floor{building.floors.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openFloorModal(building.id)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      title="Add Floor"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openBuildingModal(building)}
                      className="p-1.5 text-secondary-600 hover:bg-secondary-100 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBuilding(building.id, building.name)}
                      className="p-1.5 text-status-danger hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Floors (Expanded) */}
                {expandedBuildings.has(building.id) && (
                  <div className="bg-secondary-50">
                    {building.floors.length === 0 ? (
                      <div className="px-6 py-4 pl-16 text-sm text-secondary-500">
                        No floors yet. Click + to add one.
                      </div>
                    ) : (
                      building.floors.map((floor) => (
                        <div key={floor.id}>
                          {/* Floor Row */}
                          <div className="flex items-center justify-between px-6 py-3 pl-16 hover:bg-secondary-100 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleFloor(floor.id)}
                                className="text-secondary-400 hover:text-primary-600 transition-colors"
                              >
                                {expandedFloors.has(floor.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <Layers className="w-4 h-4 text-secondary-600" />
                              <p className="text-sm font-medium text-slate-800">{floor.number}</p>
                              <span className="px-2 py-0.5 bg-secondary-200 text-secondary-700 text-xs rounded-full">
                                {floor.rooms.length} room{floor.rooms.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openRoomModal(floor.id)}
                                className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                title="Add Room"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openFloorModal(building.id, floor)}
                                className="p-1 text-secondary-600 hover:bg-secondary-200 rounded transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFloor(floor.id, floor.number)}
                                className="p-1 text-status-danger hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Rooms (Expanded) */}
                          {expandedFloors.has(floor.id) && (
                            <div className="bg-white border-l-2 border-primary-200 ml-16">
                              {floor.rooms.length === 0 ? (
                                <div className="px-6 py-3 pl-12 text-sm text-secondary-500">
                                  No rooms yet. Click + to add one.
                                </div>
                              ) : (
                                floor.rooms.map((room) => (
                                  <div
                                    key={room.id}
                                    className="flex items-center justify-between px-6 py-2.5 pl-12 hover:bg-secondary-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <DoorOpen className="w-4 h-4 text-secondary-500" />
                                      <p className="text-sm text-slate-700">{room.name}</p>
                                      {room._count && room._count.assets > 0 && (
                                        <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                                          {room._count.assets} asset{room._count.assets !== 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openRoomModal(floor.id, room)}
                                        className="p-1 text-secondary-600 hover:bg-secondary-100 rounded transition-colors"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteRoom(room.id, room.name)}
                                        className="p-1 text-status-danger hover:bg-red-50 rounded transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Building Modal */}
      {isBuildingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingBuildingId ? 'Edit Building' : 'Add Building'}
              </h3>
              <button
                onClick={() => {
                  setBuildingModalOpen(false);
                  setEditingBuildingId(null);
                }}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBuilding} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Building Name *
                </label>
                <input
                  type="text"
                  required
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Main Office"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={buildingForm.address}
                  onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 123 Main St, City"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setBuildingModalOpen(false);
                    setEditingBuildingId(null);
                  }}
                  className="px-4 py-2 border border-secondary-300 text-slate-700 rounded-md hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingBuildingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floor Modal */}
      {isFloorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingFloorId ? 'Edit Floor' : 'Add Floor'}
              </h3>
              <button
                onClick={() => {
                  setFloorModalOpen(false);
                  setEditingFloorId(null);
                }}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFloor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Floor Number/Name *
                </label>
                <input
                  type="text"
                  required
                  value={floorForm.number}
                  onChange={(e) => setFloorForm({ ...floorForm, number: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Level 1, Ground Floor"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFloorModalOpen(false);
                    setEditingFloorId(null);
                  }}
                  className="px-4 py-2 border border-secondary-300 text-slate-700 rounded-md hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingFloorId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingRoomId ? 'Edit Room' : 'Add Room'}
              </h3>
              <button
                onClick={() => {
                  setRoomModalOpen(false);
                  setEditingRoomId(null);
                }}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Server Room, Office 101"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setRoomModalOpen(false);
                    setEditingRoomId(null);
                  }}
                  className="px-4 py-2 border border-secondary-300 text-slate-700 rounded-md hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingRoomId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;
