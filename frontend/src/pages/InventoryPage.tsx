import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingDown, DollarSign, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Part {
  id: string;
  name: string;
  partNumber: string;
  stockLevel: number;
  minStock: number;
  unitPrice: number;
  createdAt: string;
}

const InventoryPage = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    stockLevel: 0,
    minStock: 10,
    unitPrice: 0,
  });

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    const filtered = parts.filter(
      (part) =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredParts(filtered);
  }, [searchTerm, parts]);

  const fetchParts = async () => {
    try {
      const res = await apiClient.get('/parts');
      setParts(res.data);
      setFilteredParts(res.data);
    } catch (error: any) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (part?: Part) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        partNumber: part.partNumber,
        stockLevel: part.stockLevel,
        minStock: part.minStock,
        unitPrice: part.unitPrice,
      });
    } else {
      setEditingPart(null);
      setFormData({
        name: '',
        partNumber: '',
        stockLevel: 0,
        minStock: 10,
        unitPrice: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPart(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPart) {
        await apiClient.patch(`/parts/${editingPart.id}`, formData);
        toast.success('Part updated successfully');
      } else {
        await apiClient.post('/parts', formData);
        toast.success('Part added successfully');
      }
      
      fetchParts();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save part');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;
    
    try {
      await apiClient.delete(`/parts/${id}`);
      toast.success('Part deleted successfully');
      fetchParts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete part');
    }
  };

  const lowStockCount = parts.filter((p) => p.stockLevel <= p.minStock).length;
  const totalValue = parts.reduce((sum, p) => sum + p.stockLevel * p.unitPrice, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-secondary-400">
          <div className="w-5 h-5 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-sm">Loading inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inventory & Spare Parts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your parts inventory and track stock levels</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Part
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Total Parts</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{parts.length}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center border border-primary-200">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-status-danger-dark mt-1">{lowStockCount}</h3>
            </div>
            <div className="w-12 h-12 bg-status-danger-light rounded-lg flex items-center justify-center border border-status-danger">
              <TrendingDown className="w-6 h-6 text-status-danger-dark" />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Total Value</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalValue.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center border border-green-200">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search parts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 hidden sm:table-cell">Part Number</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-secondary-500">Stock</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-secondary-500 hidden md:table-cell">Min</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 hidden lg:table-cell">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 hidden lg:table-cell">Value</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-secondary-400">
                      <div className="w-5 h-5 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading parts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-secondary-500">
                    No parts found
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isLowStock = part.stockLevel <= part.minStock;
                  const totalValue = part.stockLevel * part.unitPrice;
                  
                  return (
                    <tr key={part.id} className="hover:bg-secondary-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center border border-primary-200">
                            <Package className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{part.name}</p>
                            <p className="text-xs text-secondary-500 font-mono sm:hidden">{part.partNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500 font-mono hidden sm:table-cell">{part.partNumber}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            isLowStock
                              ? 'bg-status-danger-light text-status-danger-dark border-status-danger'
                              : 'bg-status-success-light text-status-success-dark border-status-success'
                          }`}
                        >
                          {isLowStock && <AlertTriangle className="w-3 h-3" />}
                          {part.stockLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-600 hidden md:table-cell">{part.minStock}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-600 hidden lg:table-cell">${part.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900 hidden lg:table-cell">${totalValue.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(part)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(part.id)}
                            className="p-2 text-status-danger hover:bg-status-danger-light rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingPart ? 'Edit Part' : 'Add New Part'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-secondary-400 hover:text-secondary-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Part Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter part name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Part Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., OF-12345"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stock Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockLevel}
                    onChange={(e) => setFormData({ ...formData, stockLevel: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 font-medium rounded-md hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingPart ? 'Update Part' : 'Create Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
