import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { uploadAttachment, getAttachments, deleteAttachment } from '../api/workOrder.api';
import { ArrowLeft, Box, AlertCircle, User, Calendar, Clock, Loader2, CheckCircle, Play, Package, Plus, X, Trash2, Timer, Zap, Upload, Camera, Image as ImageIcon, MapPin, Settings, Navigation, ExternalLink, Activity, Gauge, Droplets, Wind, Thermometer, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface ChecklistData {
  [key: string]: string | number;
}

interface ReadingField {
  key: string;
  label: string;
  unit: string;
  type: 'number' | 'text' | 'textarea';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  icon?: any;
}

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

  // Checklist / Operational Readings
  const [checklistData, setChecklistData] = useState<ChecklistData>({});

  // Labor Timer
  const [elapsedTime, setElapsedTime] = useState<string>('0h 0m');

  // Get Google Maps navigation link
  const getNavigationLink = () => {
    if (!workOrder) return null;
    
    // Try multiple location sources
    const location = workOrder.asset?.room 
      ? `${workOrder.asset.room.floor.building.name}, ${workOrder.asset.room.floor.number}, ${workOrder.asset.room.name}`
      : workOrder.asset?.['site'] || workOrder.asset?.['location'];
    
    if (!location) return null;
    
    // Google Maps search URL
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

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
      
      // Load existing checklist data if available
      if (response.data.checklistData) {
        setChecklistData(response.data.checklistData);
      }
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
        checklistData: Object.keys(checklistData).length > 0 ? checklistData : null,
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
      MEDIUM: 'bg-[#232249] text-white',
      LOW: 'bg-gray-500 text-white',
    };
    return styles[priority] || styles.MEDIUM;
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-green-600 text-white',
      IN_PROGRESS: 'bg-yellow-500 text-white',
      CANCELLED: 'bg-red-600 text-white',
      OPEN: 'bg-[#232249] text-white',
      ON_HOLD: 'bg-gray-500 text-white',
    };
    return styles[status] || 'bg-gray-500 text-white';
  };

  const handleChecklistChange = (key: string, value: string | number) => {
    setChecklistData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Enhanced Operational Readings Field Generator
  const getReadingFieldsByCategory = (category: string): ReadingField[] => {
    const normalizedCategory = category.toLowerCase();
    
    // BOILER SYSTEMS
    if (normalizedCategory.includes('boiler')) {
      return [
        { 
          key: 'waterPressure', 
          label: 'Water Pressure', 
          unit: 'psi', 
          type: 'number',
          min: 0,
          max: 200,
          step: 0.1,
          icon: Gauge,
          placeholder: 'e.g., 45.5'
        },
        { 
          key: 'supplyTemp', 
          label: 'Supply Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 250,
          step: 0.1,
          icon: Thermometer,
          placeholder: 'e.g., 180.0'
        },
        { 
          key: 'returnTemp', 
          label: 'Return Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 250,
          step: 0.1,
          icon: Thermometer,
          placeholder: 'e.g., 160.0'
        },
        { 
          key: 'fuelPressure', 
          label: 'Fuel Pressure', 
          unit: 'psi', 
          type: 'number',
          min: 0,
          max: 100,
          step: 0.1,
          icon: Droplets,
          placeholder: 'e.g., 15.0'
        },
        { 
          key: 'stackTemp', 
          label: 'Stack Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 500,
          step: 1,
          icon: Thermometer,
          placeholder: 'e.g., 350'
        },
        { 
          key: 'o2Level', 
          label: 'Oxygen Level', 
          unit: '%', 
          type: 'number',
          min: 0,
          max: 25,
          step: 0.1,
          icon: Wind,
          placeholder: 'e.g., 3.5'
        }
      ];
    }
    
    // CHILLER SYSTEMS
    if (normalizedCategory.includes('chiller')) {
      return [
        { 
          key: 'suctionPressure', 
          label: 'Suction Pressure', 
          unit: 'psi', 
          type: 'number',
          min: 0,
          max: 150,
          step: 0.1,
          icon: Gauge,
          placeholder: 'e.g., 40.0'
        },
        { 
          key: 'dischargePressure', 
          label: 'Discharge Pressure', 
          unit: 'psi', 
          type: 'number',
          min: 0,
          max: 300,
          step: 0.1,
          icon: Gauge,
          placeholder: 'e.g., 180.0'
        },
        { 
          key: 'motorAmps', 
          label: 'Motor Amps', 
          unit: 'A', 
          type: 'number',
          min: 0,
          max: 500,
          step: 0.1,
          icon: Zap,
          placeholder: 'e.g., 125.5'
        },
        { 
          key: 'evaporatorTemp', 
          label: 'Evaporator Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 100,
          step: 0.1,
          icon: Thermometer,
          placeholder: 'e.g., 42.0'
        },
        { 
          key: 'condenserTemp', 
          label: 'Condenser Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 150,
          step: 0.1,
          icon: Thermometer,
          placeholder: 'e.g., 95.0'
        },
        { 
          key: 'refrigerantLevel', 
          label: 'Refrigerant Level', 
          unit: '%', 
          type: 'number',
          min: 0,
          max: 100,
          step: 1,
          icon: Droplets,
          placeholder: 'e.g., 85'
        }
      ];
    }
    
    // AIR HANDLER / AHU SYSTEMS
    if (normalizedCategory.includes('ahu') || normalizedCategory.includes('air handler') || normalizedCategory.includes('hvac')) {
      return [
        { 
          key: 'supplyAirTemp', 
          label: 'Supply Air Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 150,
          step: 0.1,
          icon: Thermometer,
          placeholder: 'e.g., 55.0'
        },
        { 
          key: 'returnAirTemp', 
          label: 'Return Air Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 150,
          step: 0.1,
          icon: Thermometer,
          placeholder: 'e.g., 72.0'
        },
        { 
          key: 'supplyAirflow', 
          label: 'Supply Airflow', 
          unit: 'CFM', 
          type: 'number',
          min: 0,
          max: 10000,
          step: 10,
          icon: Wind,
          placeholder: 'e.g., 2500'
        },
        { 
          key: 'filterPressureDrop', 
          label: 'Filter Pressure Drop', 
          unit: 'in. W.C.', 
          type: 'number',
          min: 0,
          max: 5,
          step: 0.01,
          icon: Gauge,
          placeholder: 'e.g., 0.5'
        },
        { 
          key: 'relativeHumidity', 
          label: 'Relative Humidity', 
          unit: '%', 
          type: 'number',
          min: 0,
          max: 100,
          step: 1,
          icon: Droplets,
          placeholder: 'e.g., 45'
        },
        { 
          key: 'fanMotorAmps', 
          label: 'Fan Motor Amps', 
          unit: 'A', 
          type: 'number',
          min: 0,
          max: 100,
          step: 0.1,
          icon: Zap,
          placeholder: 'e.g., 12.5'
        }
      ];
    }
    
    // PUMP SYSTEMS
    if (normalizedCategory.includes('pump')) {
      return [
        { 
          key: 'dischargePressure', 
          label: 'Discharge Pressure', 
          unit: 'psi', 
          type: 'number',
          min: 0,
          max: 200,
          step: 0.1,
          icon: Gauge,
          placeholder: 'e.g., 65.0'
        },
        { 
          key: 'suctionPressure', 
          label: 'Suction Pressure', 
          unit: 'psi', 
          type: 'number',
          min: 0,
          max: 100,
          step: 0.1,
          icon: Gauge,
          placeholder: 'e.g., 20.0'
        },
        { 
          key: 'flowRate', 
          label: 'Flow Rate', 
          unit: 'GPM', 
          type: 'number',
          min: 0,
          max: 1000,
          step: 1,
          icon: Droplets,
          placeholder: 'e.g., 350'
        },
        { 
          key: 'motorAmps', 
          label: 'Motor Current', 
          unit: 'A', 
          type: 'number',
          min: 0,
          max: 200,
          step: 0.1,
          icon: Zap,
          placeholder: 'e.g., 25.5'
        },
        { 
          key: 'bearingTemp', 
          label: 'Bearing Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 200,
          step: 1,
          icon: Thermometer,
          placeholder: 'e.g., 120'
        },
        { 
          key: 'vibration', 
          label: 'Vibration Level', 
          unit: 'mils', 
          type: 'number',
          min: 0,
          max: 10,
          step: 0.01,
          icon: Activity,
          placeholder: 'e.g., 0.25'
        }
      ];
    }
    
    // COOLING TOWER
    if (normalizedCategory.includes('cooling tower') || normalizedCategory.includes('tower')) {
      return [
        { 
          key: 'waterTemp', 
          label: 'Water Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 150,
          step: 0.1,
          icon: Thermometer,
          placeholder: 'e.g., 85.0'
        },
        { 
          key: 'wetBulbTemp', 
          label: 'Wet Bulb Temperature', 
          unit: '°F', 
          type: 'number',
          min: 0,
          max: 100,
          step: 0.1,
          icon: Thermometer,
          placeholder: 'e.g., 72.0'
        },
        { 
          key: 'fanMotorAmps', 
          label: 'Fan Motor Amps', 
          unit: 'A', 
          type: 'number',
          min: 0,
          max: 100,
          step: 0.1,
          icon: Zap,
          placeholder: 'e.g., 15.0'
        },
        { 
          key: 'waterFlowRate', 
          label: 'Water Flow Rate', 
          unit: 'GPM', 
          type: 'number',
          min: 0,
          max: 5000,
          step: 10,
          icon: Droplets,
          placeholder: 'e.g., 1200'
        }
      ];
    }
    
    // DEFAULT / GENERAL EQUIPMENT
    return [
      { 
        key: 'voltage', 
        label: 'Voltage', 
        unit: 'V', 
        type: 'number',
        min: 0,
        max: 600,
        step: 0.1,
        icon: Zap,
        placeholder: 'e.g., 480.0'
      },
      { 
        key: 'current', 
        label: 'Current', 
        unit: 'A', 
        type: 'number',
        min: 0,
        max: 500,
        step: 0.1,
        icon: Zap,
        placeholder: 'e.g., 25.5'
      },
      { 
        key: 'temperature', 
        label: 'Operating Temperature', 
        unit: '°F', 
        type: 'number',
        min: 0,
        max: 300,
        step: 0.1,
        icon: Thermometer,
        placeholder: 'e.g., 72.0'
      },
      { 
        key: 'pressure', 
        label: 'Operating Pressure', 
        unit: 'psi', 
        type: 'number',
        min: 0,
        max: 200,
        step: 0.1,
        icon: Gauge,
        placeholder: 'e.g., 45.0'
      }
    ];
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
    <div className="min-h-screen bg-gray-50">
      {/* ===== STICKY TOP BAR ===== */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back Button + Work Order ID */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/work-orders')}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#232249] font-medium transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Work Orders
              </button>
              
              <div className="h-8 w-px bg-gray-300"></div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Work Order</p>
                <p className="text-sm font-mono font-bold text-[#232249]">{workOrder.id}</p>
              </div>
            </div>

            {/* Center: Status Badge */}
            <div className="flex items-center gap-3">
              <span className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide shadow-sm ${getStatusStyles(workOrder.status)}`}>
                {workOrder.status.replace('_', ' ')}
              </span>
              <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide ${getPriorityStyles(workOrder.priority)}`}>
                {workOrder.priority}
              </span>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-3">
              {getNavigationLink() && (
                <a
                  href={getNavigationLink()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#232249] text-white rounded-lg hover:bg-[#1a1a38] transition-all shadow-sm text-sm font-semibold"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </a>
              )}
              
              {!isDisabled && canComplete && (
                <button
                  onClick={handleCompleteWorkOrder}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm text-sm font-bold disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete Work Order
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#232249] mb-2">{workOrder.title}</h1>
          {workOrder.description && (
            <p className="text-gray-600 text-base leading-relaxed">{workOrder.description}</p>
          )}
        </div>

        {/* ===== TWO-COLUMN GRID (Main Content + Action Sidebar) ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ========== MAIN COLUMN (Span 2) ========== */}
          <div className="lg:col-span-2 space-y-6">

            {/* === ASSET INFORMATION CARD === */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-[#232249] px-6 py-4 flex items-center gap-3">
                <Box className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Asset Information</h3>
              </div>
              
              {/* Card Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Asset Name</p>
                    <p className="text-base font-semibold text-gray-900">{workOrder.asset.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</p>
                    <p className="text-base font-semibold text-gray-900">{workOrder.asset.category}</p>
                  </div>
                  {workOrder.asset.serialNo && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Serial Number</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg inline-block">{workOrder.asset.serialNo}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</p>
                    <p className="text-base font-semibold text-gray-900">{workOrder.asset.status}</p>
                  </div>
                </div>

                {/* Location with Map Integration */}
                {workOrder.asset.room && (
                  <div className="pt-6 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Location</p>
                    <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                      <MapPin className="w-5 h-5 text-[#232249] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900 mb-1">
                          {workOrder.asset.room.floor.building.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Floor {workOrder.asset.room.floor.number} / Room {workOrder.asset.room.name}
                        </p>
                      </div>
                      {getNavigationLink() && (
                        <a
                          href={getNavigationLink()!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#232249] text-white text-sm font-bold rounded-lg hover:bg-[#1a1a38] transition-all shadow-sm"
                        >
                          <Navigation className="w-4 h-4" />
                          Navigate
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* === OPERATIONAL READINGS CARD === */}
            {!isDisabled && workOrder && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Card Header */}
                <div className="bg-[#232249] px-6 py-4 flex items-center gap-3">
                  <Settings className="w-5 h-5 text-white" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Operational Readings</h3>
                    <p className="text-xs text-gray-200 mt-0.5">
                      {workOrder.asset.category} measurements
                    </p>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-6">
                  {/* Modern Input Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {getReadingFieldsByCategory(workOrder.asset.category).map((field) => {
                      const IconComponent = field.icon;
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            {IconComponent && <IconComponent className="w-3.5 h-3.5 text-gray-400" />}
                            {field.label}
                          </label>
                          <div className="relative">
                            <input
                              type={field.type}
                              step={field.step}
                              min={field.min}
                              max={field.max}
                              value={checklistData[field.key] || ''}
                              onChange={(e) => handleChecklistChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full pl-4 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#232249] focus:ring-2 focus:ring-[#232249]/20 transition-all hover:border-gray-300"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                              {field.unit}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* General Notes */}
                  <div className="space-y-1.5 pt-4 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      Inspection Notes
                    </label>
                    <textarea
                      value={checklistData.generalNotes || ''}
                      onChange={(e) => handleChecklistChange('generalNotes', e.target.value)}
                      rows={4}
                      placeholder="Document observations, abnormalities, or recommendations..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#232249] focus:ring-2 focus:ring-[#232249]/20 transition-all resize-none hover:border-gray-300"
                    />
                  </div>
                  
                  {/* Reading Summary */}
                  {Object.keys(checklistData).length > 0 && (
                    <div className="mt-4 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        {Object.keys(checklistData).filter(k => k !== 'generalNotes' && checklistData[k]).length} reading(s) recorded
                      </div>
                      <button
                        type="button"
                        onClick={() => setChecklistData({})}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold underline"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === COMPLETION NOTE CARD === */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-[#232249] px-6 py-4 flex items-center gap-3">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Completion Note</h3>
              </div>
              
              {/* Card Body */}
              <div className="p-6">
                <textarea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  disabled={isDisabled || isSubmitting}
                  placeholder="Write detailed notes about the work performed, parts replaced, and any follow-up recommendations..."
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#232249] focus:ring-2 focus:ring-[#232249]/20 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none transition-all hover:border-gray-300"
                />
                {isCompleted && (
                  <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Work order completed
                  </div>
                )}
                {isCancelled && (
                  <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Work order cancelled
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* End Main Column */}

          {/* ========== ACTION SIDEBAR (Span 1) ========== */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* === LABOR TRACKING CARD (Sticky) === */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {/* Card Header */}
              <div className="bg-[#232249] px-4 py-3 flex items-center gap-2">
                <Timer className="w-4 h-4 text-white" />
                <h3 className="text-base font-bold text-white">Labor Tracking</h3>
              </div>

              <div className="px-4 py-4">
                {/* OPEN Status - Ready to Start */}
                {workOrder.status === 'OPEN' && (
                  <div className="text-center space-y-3">
                    <p className="text-xs text-gray-600">Ready to begin</p>
                    <button
                      onClick={handleMarkInProgress}
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#232249] text-white font-bold rounded-lg hover:bg-[#1a1a38] transition-all shadow-sm disabled:opacity-50 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Timer
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* IN_PROGRESS Status - Digital Clock Timer */}
                {workOrder.status === 'IN_PROGRESS' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wide">In Progress</span>
                    </div>
                    
                    {/* Digital Clock Display */}
                    <div className="bg-gray-900 rounded-lg p-4 text-center shadow-inner">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Elapsed Time</p>
                      <p className="text-2xl font-mono font-bold text-green-400 tracking-wider">
                        {elapsedTime}
                      </p>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      Started {workOrder.startedAt 
                        ? new Date(workOrder.startedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </div>
                  </div>
                )}

                {/* COMPLETED Status - Final Summary */}
                {workOrder.status === 'COMPLETED' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Completed</span>
                    </div>
                    
                    <div className="bg-[#232249] rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-200 uppercase tracking-wider mb-1">Total Labor Hours</p>
                      <p className="text-2xl font-mono font-bold text-white">
                        {workOrder.laborHours ? `${workOrder.laborHours.toFixed(2)} hrs` : '—'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <p className="text-gray-500 mb-1">Started</p>
                        <p className="font-semibold">
                          {workOrder.startedAt 
                            ? new Date(workOrder.startedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Completed</p>
                        <p className="font-semibold">
                          {new Date(workOrder.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other statuses */}
                {!['OPEN', 'IN_PROGRESS', 'COMPLETED'].includes(workOrder.status) && (
                  <p className="text-sm text-gray-500 text-center">Not available</p>
                )}
              </div>
            </div>

            {/* === PHOTO EVIDENCE CARD === */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-[#232249] px-4 py-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-white" />
                <h3 className="text-base font-bold text-white">Photo Evidence</h3>
              </div>

              <div className="p-4">
                {/* Safety Protocol Notice */}
                {!isDisabled && attachments.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-semibold">Required:</span>
                      At least one photo evidence is required.
                    </p>
                  </div>
                )}

                {/* Attachments Grid */}
                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all group"
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                            {isImageFile(attachment.mimeType) ? (
                              <img
                                src={attachment.fileUrl}
                                alt={attachment.fileName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-gray-400">
                                <ImageIcon className="w-8 h-8" />
                                <span className="text-xs">{attachment.mimeType.split('/')[1].toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate" title={attachment.fileName}>
                              {attachment.fileName}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatFileSize(attachment.fileSize)}
                              </span>
                              <a
                                href={attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#232249] hover:text-[#1a1a38] font-semibold underline"
                              >
                                View
                              </a>
                            </div>
                          </div>
                          {!isDisabled && (
                            <button
                              onClick={() => handleDeleteAttachment(attachment.id, attachment.fileName)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              title="Delete attachment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg mb-4">
                    <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No photos uploaded yet</p>
                  </div>
                )}

                {/* Upload Button */}
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
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#232249] text-white font-bold rounded-lg hover:bg-[#1a1a38] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {uploadingFile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          UPLOAD PHOTO
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* End Action Sidebar */}

        </div>
        {/* End Two-Column Grid */}
      </div>
      {/* End Main Container */}

      {/* ===== MODALS ===== */}

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
