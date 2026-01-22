import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { 
  ArrowLeft, 
  Box, 
  AlertCircle, 
  User, 
  Calendar, 
  Clock, 
  Loader2,
  CheckCircle,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WorkOrderDetails {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  completionNote?: string;
  assetId: string;
  assignedToId?: string;
  asset: {
    id: string;
    name: string;
    category: string;
    serialNo?: string;
    status: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const WorkOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [workOrder, setWorkOrder] = useState<WorkOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionNote, setCompletionNote] = useState('');

  useEffect(() => {
    fetchWorkOrderDetails();
  }, [id]);

  const fetchWorkOrderDetails = async () => {
    try {
      const response = await apiClient.get(`/work-orders/${id}`);
      setWorkOrder(response.data);
      setCompletionNote(response.data.completionNote || '');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load work order');
      navigate('/work-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkInProgress = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/work-orders/${id}`, {
        status: 'IN_PROGRESS',
        completionNote: completionNote || null,
      });
      toast.success('Work order marked as In Progress');
      fetchWorkOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteWorkOrder = async () => {
    if (!completionNote.trim()) {
      toast.error('Please provide a completion note before finalizing');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/work-orders/${id}`, {
        status: 'COMPLETED',
        completionNote: completionNote,
      });
      toast.success('Work order completed successfully!');
      fetchWorkOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityStyles = (priority: string) => {
    const styles: Record<string, string> = {
      URGENT: 'bg-red-600 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-blue-600 text-white',
      LOW: 'bg-gray-500 text-white',
    };
    return styles[priority] || styles.MEDIUM;
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-green-600 text-white',
      IN_PROGRESS: 'bg-yellow-500 text-white',
      CANCELLED: 'bg-red-600 text-white',
      OPEN: 'bg-blue-600 text-white',
      ON_HOLD: 'bg-gray-500 text-white',
    };
    return styles[status] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Work order not found</p>
          <button
            onClick={() => navigate('/work-orders')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Work Orders
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = workOrder.status === 'COMPLETED';
  const isCancelled = workOrder.status === 'CANCELLED';
  const isDisabled = isCompleted || isCancelled;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/work-orders')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Work Orders
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Title Bar - Navy Blue */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-5">
          <h1 className="text-2xl font-bold text-white">{workOrder.title}</h1>
          <p className="text-blue-100 text-sm mt-1">Work Order ID: {workOrder.id}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(workOrder.status)}`}>
                {workOrder.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Priority:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyles(workOrder.priority)}`}>
                {workOrder.priority}
              </span>
            </div>
          </div>

          {/* Description */}
          {workOrder.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
                {workOrder.description}
              </p>
            </div>
          )}

          {/* Asset Information */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Box className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-700">Asset Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium text-gray-900">{workOrder.asset.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium text-gray-900">{workOrder.asset.category}</span>
              </div>
              {workOrder.asset.serialNo && (
                <div>
                  <span className="text-gray-500">Serial No:</span>
                  <span className="ml-2 font-medium text-gray-900">{workOrder.asset.serialNo}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Asset Status:</span>
                <span className="ml-2 font-medium text-gray-900">{workOrder.asset.status}</span>
              </div>
            </div>
          </div>

          {/* Assigned Technician */}
          {workOrder.assignedTo && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700">Assigned Technician</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {workOrder.assignedTo.firstName[0]}{workOrder.assignedTo.lastName[0]}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {workOrder.assignedTo.firstName} {workOrder.assignedTo.lastName}
                  </p>
                  <p className="text-gray-500">{workOrder.assignedTo.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(workOrder.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Updated: {new Date(workOrder.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Completion Note Section */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Technician Completion Note
            </label>
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              disabled={isDisabled || isSubmitting}
              placeholder="Write detailed notes about the work performed, parts replaced, and any follow-up recommendations..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            />
            {isCompleted && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>This work order has been completed</span>
              </div>
            )}
            {isCancelled && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>This work order has been cancelled</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isDisabled && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleMarkInProgress}
                disabled={isSubmitting || workOrder.status === 'IN_PROGRESS'}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {workOrder.status === 'IN_PROGRESS' ? 'Already In Progress' : 'Mark as In Progress'}
                  </>
                )}
              </button>
              <button
                onClick={handleCompleteWorkOrder}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Finalize &amp; Complete
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetailsPage;
