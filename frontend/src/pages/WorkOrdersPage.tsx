import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Plus, Box, Loader2, X, Trash2, Edit3, Calendar, AlertCircle, FileDown, AlertTriangle, MapPin, CheckSquare, Square, Clock, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNo?: string;
  location?: string;
  room?: {
    name: string;
    floor: {
      number: string;
      building: {
        name: string;
      };
    };
  };
}

interface WorkOrder {
  id: string; 
  title: string; 
  description?: string; 
  status: string; 
  priority: string;
  assetId: string; 
  assignedToId?: string; 
  dueDate?: string;
  asset: { 
    name: string;
    room?: {
      name: string;
      floor: {
        number: string;
        building: {
          name: string;
        };
      };
    };
  };
  assignedTo?: { firstName: string, lastName: string }; 
  createdAt: string;
}

const WorkOrdersPage = () => {
  const navigate = useNavigate();
  const { firstName, lastName, role } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<{id: string, firstName: string, lastName: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Location-based selection states
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationAssets, setLocationAssets] = useState<Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [locationSearchTerm, setLocationSearchTerm] = useState('');

  // Technician Tab State
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', assetId: '', assignedToId: '' });

  useEffect(() => { fetchOrders(); fetchSelectionData(); }, []);

  const fetchOrders = async () => {
    try { const res = await apiClient.get('/work-orders'); setOrders(res.data); } 
    finally { setLoading(false); }
  };

  const fetchSelectionData = async () => {
    try {
      // Fetch unique locations and technicians for work order assignment
      const [locationRes, userRes] = await Promise.all([
        apiClient.get('/assets/locations'), 
        apiClient.get('/users?role=TECHNICIAN')
      ]);
      setLocations(locationRes.data); 
      setUsers(userRes.data);
    } catch (e) { console.error("Selection error", e); }
  };

  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location);
    setLocationAssets([]);
    setSelectedAssetIds([]);

    if (location) {
      try {
        const res = await apiClient.get(`/assets?location=${encodeURIComponent(location)}`);
        setLocationAssets(res.data);
      } catch (e) {
        console.error("Failed to fetch assets", e);
      }
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssetIds.length === locationAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(locationAssets.map(a => a.id));
    }
  };

  const getAssetDisplayName = (asset: Asset) => {
    if (asset.room) {
      return `${asset.name} - ${asset.room.floor.building.name} / ${asset.room.floor.number} / ${asset.room.name}`;
    }
    return asset.name;
  };

  // Filter orders based on technician role and active tab
  const getFilteredOrders = () => {
    if (role === 'TECHNICIAN') {
      if (activeTab === 'active') {
        return orders.filter(o => o.status === 'OPEN' || o.status === 'IN_PROGRESS');
      } else {
        return orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');
      }
    }
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  // Get due date countdown
  const getDueDateInfo = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    } else {
      return { text: `Due in ${diffDays} days`, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    }
  };

  const handleOpenModal = (order?: WorkOrder) => {
    if (order) {
      // Edit mode - keep single asset selection for editing
      setEditingId(order.id);
      setFormData({ 
        title: order.title, 
        description: order.description || '', 
        priority: order.priority, 
        assetId: order.assetId, 
        assignedToId: order.assignedToId || '' 
      });
    } else {
      // Create mode - reset for bulk selection
      setEditingId(null);
      setFormData({ title: '', description: '', priority: 'MEDIUM', assetId: '', assignedToId: '' });
      setSelectedLocation('');
      setLocationAssets([]);
      setSelectedAssetIds([]);
      setLocationSearchTerm('');
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for bulk creation
    if (!editingId && selectedAssetIds.length === 0) {
      alert('Please select at least one asset to create work orders.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Logic fix for 400 Bad Request: Empty strings are converted to null
      const payload: any = { 
        title: formData.title, 
        description: formData.description, 
        priority: formData.priority 
      };
      
      payload.assignedToId = (formData.assignedToId && formData.assignedToId !== "") ? formData.assignedToId : null;
      
      if (editingId) {
        // Edit mode - single work order update
        await apiClient.patch(`/work-orders/${editingId}`, payload);
      } else {
        // Create mode - bulk work orders (one per asset)
        payload.assetIds = selectedAssetIds;
        await apiClient.post('/work-orders', payload);
      }

      setModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || 'Operation failed'}`);
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete order: "${title}"?`)) {
      try { await apiClient.delete(`/work-orders/${id}`); fetchOrders(); } 
      catch (error) { alert('Failed to delete record.'); }
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try { await apiClient.patch(`/work-orders/${orderId}`, { status: newStatus }); fetchOrders(); } 
    catch (error) { alert("Status update failed"); }
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      URGENT: 'bg-status-danger-light text-status-danger-dark border-status-danger',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      MEDIUM: 'bg-primary-100 text-primary-700 border-primary-200',
      LOW: 'bg-secondary-100 text-secondary-600 border-secondary-200',
    };
    return badges[priority] || badges.MEDIUM;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      COMPLETED: 'bg-status-success text-white',
      IN_PROGRESS: 'bg-status-warning text-white',
      CANCELLED: 'bg-status-danger text-white',
      OPEN: 'bg-status-info text-white',
    };
    return badges[status] || 'bg-secondary-500 text-white';
  };

  // Check if work order is overdue (SLA breached)
  const isOverdue = (order: WorkOrder) => {
    if (!order.dueDate || order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return false;
    }
    return new Date(order.dueDate) < new Date();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Navy Blue Color
    const navyBlue = [30, 58, 138]; // RGB for Navy Blue
    const lightGray = [243, 244, 246];
    const darkGray = [75, 85, 99];

    // Header with Navy Blue background
    doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company Logo/Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FacilityOS', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Maintenance Report', 14, 30);
    
    // Report Metadata
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generated: ${currentDate}`, pageWidth - 14, 20, { align: 'right' });
    
    const organizationName = firstName && lastName ? `${firstName} ${lastName}'s Organization` : 'Organization';
    doc.text(organizationName, pageWidth - 14, 26, { align: 'right' });
    doc.text(`Total Orders: ${orders.length}`, pageWidth - 14, 32, { align: 'right' });
    
    // Prepare table data
    const tableData = orders.map((order) => [
      order.id.substring(0, 8).toUpperCase(),
      order.title,
      order.asset?.name || 'N/A',
      order.assignedTo ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}` : 'Unassigned',
      order.priority,
      order.status.replace('_', ' ')
    ]);
    
    // Generate table with professional styling
    autoTable(doc, {
      startY: 50,
      head: [['Order ID', 'Title', 'Asset', 'Technician', 'Priority', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: navyBlue as [number, number, number],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkGray as [number, number, number],
      },
      alternateRowStyles: {
        fillColor: lightGray as [number, number, number],
      },
      styles: {
        cellPadding: 5,
        lineColor: [209, 213, 219],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'center' },
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const pageCount = doc.getNumberOfPages();
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          '© 2026 FacilityOS - Confidential',
          pageWidth - 14,
          pageHeight - 10,
          { align: 'right' }
        );
      },
    });
    
    // Save the PDF
    const filename = `Maintenance_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {role === 'TECHNICIAN' ? 'My Tasks' : 'Work Orders'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'TECHNICIAN' 
              ? 'Manage your assigned maintenance tasks' 
              : 'Manage maintenance tasks and assignments'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={exportToPDF}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary font-medium rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          {/* Hide Create Button for Technicians */}
          {role !== 'TECHNICIAN' && (
            <button 
              onClick={() => handleOpenModal()} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Work Order
            </button>
          )}
        </div>
      </div>

      {/* Technician Tabs */}
      {role === 'TECHNICIAN' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-[#232249] text-white border-b-2 border-[#232249]'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Timer className="w-5 h-5" />
              <span>Active Tasks</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'active' 
                  ? 'bg-white text-[#232249]' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {orders.filter(o => o.status === 'OPEN' || o.status === 'IN_PROGRESS').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-[#232249] text-white border-b-2 border-[#232249]'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>History</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'history' 
                  ? 'bg-white text-[#232249]' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED').length}
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Order Details</th>
                {role !== 'TECHNICIAN' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Priority</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Asset</th>
                {role !== 'TECHNICIAN' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Assigned To</th>
                )}
                {role === 'TECHNICIAN' && activeTab === 'active' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Due Date</th>
                )}
                {role === 'TECHNICIAN' && activeTab === 'history' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Completed On</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {loading ? (
                <tr>
                  <td colSpan={role === 'TECHNICIAN' ? 5 : 6} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-secondary-400">
                      <div className="w-5 h-5 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading work orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={role === 'TECHNICIAN' ? 5 : 6} className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-sm text-secondary-500">
                      {role === 'TECHNICIAN' 
                        ? (activeTab === 'active' ? 'No active tasks' : 'No completed tasks yet')
                        : 'No work orders found'}
                    </p>
                  </td>
                </tr>
              ) : filteredOrders.map((order) => {
                const overdue = isOverdue(order);
                const dueDateInfo = activeTab === 'active' ? getDueDateInfo(order.dueDate) : null;
                return (
                <tr 
                  key={order.id} 
                  className={`hover:bg-secondary-50 transition-colors ${overdue && activeTab === 'active' ? 'bg-red-50 border-l-4 border-l-red-600' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {overdue && activeTab === 'active' && (
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                        </div>
                      )}
                      <div>
                        <button 
                          onClick={() => navigate(`/work-orders/${order.id}`)} 
                          className="text-sm font-medium text-primary hover:text-primary-dark hover:underline text-left"
                        >
                          {order.title}
                        </button>
                        {overdue && activeTab === 'active' && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white border border-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            DELAYED
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-secondary-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  {role !== 'TECHNICIAN' && (
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-50 text-primary-dark rounded-md text-xs font-medium border border-primary-200 w-fit">
                        <Box className="w-3 h-3" />
                        {order.asset?.name}
                      </div>
                      {order.asset?.room && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          <span>
                            {order.asset.room.floor.building.name} / {order.asset.room.floor.number} / {order.asset.room.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  {role !== 'TECHNICIAN' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600 font-medium text-xs border border-secondary-200">
                          {order.assignedTo ? `${order.assignedTo.firstName[0]}${order.assignedTo.lastName[0]}` : '?'}
                        </div>
                        <span className="text-sm text-slate-600">
                          {order.assignedTo ? `${order.assignedTo.firstName} ${order.assignedTo.lastName}` : 'Unassigned'}
                        </span>
                      </div>
                    </td>
                  )}
                  {role === 'TECHNICIAN' && activeTab === 'active' && (
                    <td className="px-6 py-4">
                      {dueDateInfo ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold border ${dueDateInfo.bg} ${dueDateInfo.color} ${dueDateInfo.border}`}>
                          <Clock className="w-3 h-3" />
                          {dueDateInfo.text}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No due date</span>
                      )}
                    </td>
                  )}
                  {role === 'TECHNICIAN' && activeTab === 'history' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        {order.status === 'COMPLETED' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    {role === 'TECHNICIAN' ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    ) : (
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-medium rounded-md px-3 py-1.5 outline-none border-0 cursor-pointer transition-colors ${getStatusBadge(order.status)}`}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {role !== 'TECHNICIAN' && (
                        <>
                          <button 
                            onClick={() => handleOpenModal(order)} 
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id, order.title)} 
                            className="p-2 text-status-danger hover:bg-status-danger-light rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {role === 'TECHNICIAN' && (
                        <button 
                          onClick={() => navigate(`/work-orders/${order.id}`)} 
                          className="px-4 py-2 bg-[#232249] text-white text-xs font-semibold rounded-md hover:bg-[#1a1a38] transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}

            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 sticky top-0 bg-surface z-10">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit Work Order' : 'Create Bulk Work Orders'}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Brief description of the work order"
                />
              </div>

              {/* Location-based Selection (Only for Create Mode) */}
              {!editingId && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-[#232249]/5 to-blue-50 border-2 border-[#232249]/20 rounded-lg">
                  <h3 className="text-sm font-semibold text-[#232249] flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Select Assets by Location (Excel Import Data)
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Search & Select Location
                    </label>
                    
                    {/* Searchable Location Dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        value={locationSearchTerm}
                        onChange={(e) => setLocationSearchTerm(e.target.value)}
                        placeholder="Type to search locations..."
                        className="w-full px-3 py-2 border-2 border-[#232249]/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] transition-all"
                      />
                      
                      {locationSearchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#232249]/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {locations
                            .filter(loc => loc.toLowerCase().includes(locationSearchTerm.toLowerCase()))
                            .map((loc) => (
                              <button
                                key={loc}
                                type="button"
                                onClick={() => {
                                  setLocationSearchTerm(loc);
                                  handleLocationChange(loc);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-[#232249]/10 transition-colors border-b border-slate-100 last:border-0"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-[#232249]" />
                                  <span className="text-slate-900">{loc}</span>
                                </div>
                              </button>
                            ))}
                          {locations.filter(loc => loc.toLowerCase().includes(locationSearchTerm.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">
                              No locations found matching "{locationSearchTerm}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Manual Select as fallback */}
                    <select 
                      className="w-full mt-2 px-3 py-2 border-2 border-[#232249]/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#232249] focus:border-[#232249] bg-white transition-all" 
                      value={selectedLocation} 
                      onChange={e => {
                        const loc = e.target.value;
                        setLocationSearchTerm(loc);
                        handleLocationChange(loc);
                      }}
                    >
                      <option value="">-- Or select from all locations --</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Asset Checkboxes */}
                  {locationAssets.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-[#232249]">
                          Select Assets ({selectedAssetIds.length} of {locationAssets.length} selected)
                        </label>
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-[#232249] hover:bg-[#1a1a38] rounded-md transition-all shadow-md"
                        >
                          {selectedAssetIds.length === locationAssets.length ? (
                            <>
                              <Square className="w-4 h-4" />
                              Deselect All
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-4 h-4" />
                              Select All
                            </>
                          )}
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto border-2 border-[#232249]/20 rounded-lg bg-white shadow-inner">
                        <div className="divide-y divide-slate-100">
                          {locationAssets.map(asset => (
                            <label 
                              key={asset.id}
                              className="flex items-center gap-3 p-4 hover:bg-[#232249]/5 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAssetIds.includes(asset.id)}
                                onChange={() => toggleAssetSelection(asset.id)}
                                className="w-5 h-5 text-[#232249] border-2 border-[#232249]/30 rounded focus:ring-[#232249] focus:ring-2"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{asset.name}</p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {asset.category}
                                  {asset.serialNo && ` • SN: ${asset.serialNo}`}
                                </p>
                                <p className="text-xs text-[#232249] font-medium mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {asset.location}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedLocation && locationAssets.length === 0 && (
                    <div className="text-sm text-amber-700 bg-amber-50 border-2 border-amber-200 rounded-md p-4 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">No assets found at this location.</p>
                        <p className="text-xs mt-1">Try selecting a different location from the dropdown.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
                  <select 
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                    value={formData.assignedToId} 
                    onChange={e => setFormData({...formData, assignedToId: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select 
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description of the issue or work required"
                />
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
                  disabled={isSubmitting || (!editingId && selectedAssetIds.length === 0)} 
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#232249] text-white font-medium rounded-md hover:bg-[#1a1a38] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingId ? 'Updating...' : `Creating ${selectedAssetIds.length} Work Order${selectedAssetIds.length !== 1 ? 's' : ''}...`}
                    </>
                  ) : (
                    editingId ? 'Update Work Order' : `Create ${selectedAssetIds.length} Work Order${selectedAssetIds.length !== 1 ? 's' : ''}`
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

export default WorkOrdersPage;