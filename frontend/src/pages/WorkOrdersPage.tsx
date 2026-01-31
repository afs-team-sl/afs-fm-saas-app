import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Plus, Box, Loader2, X, Trash2, Edit3, Calendar, AlertCircle, FileDown, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WorkOrder {
  id: string; 
  title: string; 
  description?: string; 
  status: string; 
  priority: string;
  assetId: string; 
  assignedToId?: string; 
  dueDate?: string;
  asset: { name: string };
  assignedTo?: { firstName: string, lastName: string }; 
  createdAt: string;
}

const WorkOrdersPage = () => {
  const navigate = useNavigate();
  const { firstName, lastName } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [assets, setAssets] = useState<{id: string, name: string}[]>([]);
  const [users, setUsers] = useState<{id: string, firstName: string, lastName: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', assetId: '', assignedToId: '' });

  useEffect(() => { fetchOrders(); fetchSelectionData(); }, []);

  const fetchOrders = async () => {
    try { const res = await apiClient.get('/work-orders'); setOrders(res.data); } 
    finally { setLoading(false); }
  };

  const fetchSelectionData = async () => {
    try {
      const [assetRes, userRes] = await Promise.all([apiClient.get('/assets'), apiClient.get('/users')]);
      setAssets(assetRes.data); setUsers(userRes.data);
    } catch (e) { console.error("Selection error", e); }
  };

  const handleOpenModal = (order?: WorkOrder) => {
    if (order) {
      setEditingId(order.id);
      setFormData({ 
        title: order.title, 
        description: order.description || '', 
        priority: order.priority, 
        assetId: order.assetId, 
        assignedToId: order.assignedToId || '' 
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', priority: 'MEDIUM', assetId: '', assignedToId: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Logic fix for 400 Bad Request: Empty strings are converted to null
      const payload: any = { 
        title: formData.title, 
        description: formData.description, 
        priority: formData.priority 
      };
      
      payload.assignedToId = (formData.assignedToId && formData.assignedToId !== "") ? formData.assignedToId : null;
      
      // We only send assetId on Creation (POST), not on Update (PATCH)
      if (!editingId) payload.assetId = formData.assetId;

      if (editingId) await apiClient.patch(`/work-orders/${editingId}`, payload);
      else await apiClient.post('/work-orders', payload);

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
          <h1 className="text-2xl font-semibold text-slate-900">Work Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage maintenance tasks and assignments</p>
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
          <button 
            onClick={() => handleOpenModal()} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Work Order
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Order Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500">Assigned To</th>
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
                      <span className="text-sm">Loading work orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-sm text-secondary-500">No work orders found</p>
                  </td>
                </tr>
              ) : orders.map((order) => {
                const overdue = isOverdue(order);
                return (
                <tr 
                  key={order.id} 
                  className={`hover:bg-secondary-50 transition-colors ${overdue ? 'bg-red-50 border-l-4 border-l-red-600' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {overdue && (
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
                        {overdue && (
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
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-50 text-primary-dark rounded-md text-xs font-medium border border-primary-200">
                      <Box className="w-3 h-3" />
                      {order.asset?.name}
                    </div>
                  </td>
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
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
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
          <div className="bg-surface w-full max-w-2xl rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Edit Work Order' : 'Create Work Order'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Asset</label>
                  <select 
                    required 
                    disabled={!!editingId} 
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-secondary-50 disabled:text-secondary-500" 
                    value={formData.assetId} 
                    onChange={e => setFormData({...formData, assetId: e.target.value})}
                  >
                    <option value="">Select asset</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <div className="grid grid-cols-4 gap-2">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                    <button 
                      key={p} 
                      type="button" 
                      onClick={() => setFormData({...formData, priority: p})} 
                      className={`py-2 text-sm font-medium rounded-md border transition-colors ${
                        formData.priority === p 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-surface text-secondary-700 border-secondary-300 hover:border-primary'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
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
                    editingId ? 'Update Work Order' : 'Create Work Order'
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