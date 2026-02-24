import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { uploadAttachment, getAttachments, deleteAttachment } from '../api/workOrder.api';
import { ArrowLeft, Box, AlertCircle, User, Calendar, Clock, Loader2, CheckCircle, Play, Package, Plus, X, Trash2, Timer, Zap, Upload, Camera, Image as ImageIcon, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Part {
  id: string;
  name: string;
  partNumber: string;
  stockLevel: number;
  unitPrice: number;
}

interface WorkOrderPart {
  id: string;
  quantity: number;
  part: Part;
  createdAt: string;
}

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  createdAt: string;
}

interface WorkOrderDetails {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  completionNote?: string;
  assetId: string;
  assignedToId?: string;
  startedAt?: string;
  dueDate?: string;
  laborHours?: number;
  asset: {
    id: string;
    name: string;
    category: string;
    serialNo?: string;
    status: string;
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
  const { role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [workOrder, setWorkOrder] = useState<WorkOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  
  // Parts Management
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [workOrderParts, setWorkOrderParts] = useState<WorkOrderPart[]>([]);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Photo Evidence Upload
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Labor Timer
  const [elapsedTime, setElapsedTime] = useState<string>('0h 0m');

  useEffect(() => {
    fetchWorkOrderDetails();
    fetchAvailableParts();
    fetchWorkOrderParts();
    fetchAttachments();
  }, [id]);

  // Timer Effect - Updates every minute when work order is IN_PROGRESS
  useEffect(() => {
    if (workOrder?.status === 'IN_PROGRESS' && workOrder.startedAt) {
      const timer = setInterval(() => {
        const start = new Date(workOrder.startedAt!);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setElapsedTime(`${hours}h ${minutes}m`);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [workOrder]);

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

  const fetchAvailableParts = async () => {
    try {
      const response = await apiClient.get('/parts');
      setAvailableParts(response.data);
    } catch (error) {
      console.error('Failed to load parts');
    }
  };

  const fetchWorkOrderParts = async () => {
    try {
      const response = await apiClient.get(`/work-orders/${id}/parts`);
      setWorkOrderParts(response.data);
    } catch (error) {
      console.error('Failed to load work order parts');
    }
  };

  const fetchAttachments = async () => {
    if (!id) return;
    try {
      const data = await getAttachments(id);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, GIF, and PDF files are allowed');
        return;
      }

      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!id) return;

    setUploadingFile(true);
    try {
      await uploadAttachment(id, file);
      toast.success(`${file.name} uploaded successfully`);
      fetchAttachments();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, fileName: string) => {
    if (!id) return;
    if (!confirm(`Delete "${fileName}"?`)) return;

    try {
      await deleteAttachment(id, attachmentId);
      toast.success('Attachment deleted');
      fetchAttachments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete attachment');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImageFile = (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPartId) {
      toast.error('Please select a part');
      return;
    }

    try {
      await apiClient.post(`/work-orders/${id}/parts`, {
        partId: selectedPartId,
        quantity: quantity,
      });
      toast.success('Part added. Stock will be deducted when work order is completed.');
      fetchWorkOrderParts();
      fetchAvailableParts(); // Refresh to show updated stock levels
      setShowPartsModal(false);
      setSelectedPartId('');
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add part');
    }
  };

  const handleRemovePart = async (workOrderPartId: string) => {
    if (!confirm('Remove this part from the work order?')) return;

    try {
      await apiClient.delete(`/work-orders/${id}/parts/${workOrderPartId}`);
      toast.success('Part removed from work order');
      fetchWorkOrderParts();
      fetchAvailableParts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove part');
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
    // Safety Protocol: Require at least one photo evidence
    if (attachments.length === 0) {
      toast.error('⚠️ Safety Protocol: Please upload at least one photo evidence before completing the work order');
      return;
    }

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
      toast.success('✅ Work order completed successfully!');
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
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
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
  const canComplete = attachments.length > 0; // Safety check

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/work-orders')}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
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
              <Box className="w-5 h-5 text-primary" />
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
              {workOrder.asset.room && (
                <div className="col-span-2">
                  <span className="text-gray-500">Location:</span>
                  <div className="ml-2 inline-flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900">
                      {workOrder.asset.room.floor.building.name} / {workOrder.asset.room.floor.number} / {workOrder.asset.room.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Technician */}
          {workOrder.assignedTo && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-gray-700">Assigned Technician</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
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

          {/* Labor Timer Section - SLA Tracking */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-r from-[#232249] to-[#2d2d5f] rounded-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Timer className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Labor Time Tracking</h3>
              </div>

              {/* OPEN Status - Ready to Start */}
              {workOrder.status === 'OPEN' && (
                <div className="space-y-4">
                  <p className="text-blue-100">This work order is ready to begin. Click the button below to start the timer.</p>
                  <button
                    onClick={handleMarkInProgress}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white text-[#232249] font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting Mission...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        START MISSION
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* IN_PROGRESS Status - Active Timer */}
              {workOrder.status === 'IN_PROGRESS' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-200">ACTIVE - Work in Progress</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <p className="text-xs font-medium text-blue-200 mb-1">Started At</p>
                      <p className="text-xl font-bold">
                        {workOrder.startedAt 
                          ? new Date(workOrder.startedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Not recorded'}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <p className="text-xs font-medium text-blue-200 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Elapsed Time
                      </p>
                      <p className="text-xl font-bold tabular-nums">{elapsedTime}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPLETED Status - Final Labor Hours */}
              {workOrder.status === 'COMPLETED' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium text-green-200">Mission Complete</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <p className="text-xs font-medium text-blue-200 mb-1">Started</p>
                      <p className="text-sm font-semibold">
                        {workOrder.startedAt 
                          ? new Date(workOrder.startedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <p className="text-xs font-medium text-blue-200 mb-1">Completed</p>
                      <p className="text-sm font-semibold">
                        {new Date(workOrder.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="bg-green-400 rounded-lg p-4 border-2 border-green-300 shadow-lg">
                      <p className="text-xs font-medium text-green-900 mb-1 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Total Labor Hours
                      </p>
                      <p className="text-2xl font-bold text-green-900 tabular-nums">
                        {workOrder.laborHours ? `${workOrder.laborHours.toFixed(2)} hrs` : 'Not calculated'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other statuses */}
              {!['OPEN', 'IN_PROGRESS', 'COMPLETED'].includes(workOrder.status) && (
                <p className="text-blue-100">Labor tracking not available for this status.</p>
              )}
            </div>
          </div>

          {/* Photo Evidence Upload Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-r from-[#232249] to-[#2d2d5f] rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Photo Evidence</h3>
                </div>
                {!isDisabled && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#232249] font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingFile ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Photo Evidence
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Safety Protocol Notice */}
              {!isDisabled && attachments.length === 0 && (
                <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">Safety Protocol:</span>
                    At least one photo evidence is required before completing this work order.
                  </p>
                </div>
              )}

              {/* Attachments Grid */}
              {attachments.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 hover:border-white/40 transition-all group"
                    >
                      <div className="aspect-square bg-gray-800 flex items-center justify-center relative">
                        {isImageFile(attachment.mimeType) ? (
                          <img
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-white/60">
                            <ImageIcon className="w-12 h-12" />
                            <span className="text-xs">{attachment.mimeType.split('/')[1].toUpperCase()}</span>
                          </div>
                        )}
                        {!isDisabled && (
                          <button
                            onClick={() => handleDeleteAttachment(attachment.id, attachment.fileName)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            title="Delete attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-white/80 truncate" title={attachment.fileName}>
                          {attachment.fileName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-white/60">
                            {formatFileSize(attachment.fileSize)}
                          </span>
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-300 hover:text-blue-200 underline"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">No photos uploaded yet</p>
                </div>
              )}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
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

          {/* Parts Used Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-gray-700">Parts Used</h3>
              </div>
              {!isDisabled && (
                <button
                  onClick={() => setShowPartsModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Part
                </button>
              )}
            </div>

            {/* Stock Deduction Info */}
            {workOrderParts.length > 0 && workOrder?.status !== 'COMPLETED' && workOrder?.status !== 'CANCELLED' && (
              <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-primary-dark">
                  <strong>Note:</strong> Parts are reserved but stock will only be deducted when this work order is marked as <strong>COMPLETED</strong>. 
                  Parts can be added or removed until completion.
                </div>
              </div>
            )}

            {workOrder?.status === 'COMPLETED' && workOrderParts.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <strong>Stock Deducted:</strong> The quantities below have been deducted from inventory.
                </div>
              </div>
            )}

            {workOrderParts.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No parts added yet</p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Part</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Part Number</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                      {!isDisabled && (
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {workOrderParts.map((wp) => (
                      <tr key={wp.id} className="hover:bg-white transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{wp.part.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{wp.part.partNumber}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{wp.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">${wp.part.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          ${(wp.quantity * wp.part.unitPrice).toFixed(2)}
                        </td>
                        {!isDisabled && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemovePart(wp.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove Part"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={4} className="px-4 py-3 text-sm text-right text-gray-700">Total Parts Cost:</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        ${workOrderParts.reduce((sum, wp) => sum + wp.quantity * wp.part.unitPrice, 0).toFixed(2)}
                      </td>
                      {!isDisabled && <td></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isDisabled && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleMarkInProgress}
                disabled={isSubmitting || workOrder.status === 'IN_PROGRESS'}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                disabled={isSubmitting || !canComplete}
                title={!canComplete ? 'Upload at least one photo evidence to complete' : ''}
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
                    {!canComplete && '🔒 '}
                    Finalize &amp; Complete
                  </>
                )}
              </button>
            </div>
          )}

          {/* Safety Protocol Warning */}
          {!isDisabled && !canComplete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">🔒 Safety Protocol Active</p>
                <p>To complete this work order, you must upload at least one photo evidence documenting the completed work. This ensures quality control and accountability.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Parts Modal */}
      {showPartsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Part to Work Order</h2>
              <button
                onClick={() => setShowPartsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPart} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Part <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">-- Choose a part --</option>
                  {availableParts.map((part) => (
                    <option key={part.id} value={part.id} disabled={part.stockLevel === 0}>
                      {part.name} ({part.partNumber}) - Stock: {part.stockLevel}
                      {part.stockLevel === 0 ? ' - OUT OF STOCK' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {selectedPartId && (
                <div className="bg-primary-50 border border-primary-200 rounded-md p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Available Stock: </span>
                    {availableParts.find((p) => p.id === selectedPartId)?.stockLevel || 0}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Unit Price: </span>
                    ${availableParts.find((p) => p.id === selectedPartId)?.unitPrice.toFixed(2) || '0.00'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPartsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
                >
                  Add Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetailsPage;
