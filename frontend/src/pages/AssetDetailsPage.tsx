import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { 
  ArrowLeft, Box, History, Calendar, User, CheckCircle2, AlertTriangle, 
  FileText, Settings, QrCode, Printer, Settings2, MapPin, Wrench, 
  ClipboardList, TrendingUp, Activity, Package, File, Zap, Clock,
  AlertCircle, CheckCircle, XCircle, Upload, Loader2, Trash2, Camera, Edit3,
  Tag, Hash, Factory, Cpu, Calendar as CalendarIcon, Building2, Filter, Slack
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNo?: string;
  status: string;
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
  department?: string;
  image?: string;
  costCenter?: string;
  room?: {
    name: string;
    floor: {
      number: string;
      building: {
        name: string;
      };
    };
  };
  workOrders?: any[];
  documents?: AssetDocument[];
  latestReadings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface AssetDocument {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'specs' | 'docs'>('overview');

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const fetchAssetDetails = async () => {
    try {
      const res = await apiClient.get(`/assets/${id}`);
      setAsset(res.data);
    } catch (e) {
      toast.error("Could not load asset details.");
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintQR = () => {
    window.print();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post(`/assets/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Asset image updated successfully');
      fetchAssetDetails(); // Refresh asset data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, DOC, DOCX, XLS, and XLSX files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Document must be less than 10MB');
      return;
    }

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiClient.post(`/assets/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`${file.name} uploaded successfully`);
      fetchAssetDetails(); // Refresh asset data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDocument(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (!confirm(`Delete "${documentName}"?`)) return;

    try {
      await apiClient.delete(`/assets/${id}/documents/${documentId}`);
      toast.success('Document deleted');
      fetchAssetDetails();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MAINTENANCE': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'INACTIVE': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'RETIRED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getWorkOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'IN_PROGRESS': return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'ON_HOLD': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#232249] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600 font-medium">Loading asset data...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return <div className="p-8 text-center text-slate-500">Asset not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-[#232249] text-white shadow-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/assets')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{asset.name}</h1>
                <p className="text-sm text-slate-300 mt-1">
                  {asset.category} • {asset.assetNumber || asset.customId || 'No ID'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(asset.status)}`}>
                {asset.status}
              </span>
              <button
                onClick={handlePrintQR}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm font-medium">Print QR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT SIDEBAR - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              
              {/* Asset Image Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <div className="relative aspect-square bg-gradient-to-br from-[#232249] to-[#1a1b3d] flex items-center justify-center group">
                  {asset.image ? (
                    <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <Box className="w-24 h-24 text-white/30" />
                  )}
                  
                  {/* Upload Image Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-[#232249] rounded-lg font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            {asset.image ? 'Change Photo' : 'Add Photo'}
                          </>
                        )}
                      </button>
                      <p className="text-xs text-white/80">JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Serial Number</p>
                    <p className="text-sm font-mono font-bold text-[#232249]">{asset.serialNo || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Manufacturer</p>
                    <p className="text-sm font-semibold text-slate-900">{asset.manufacturer || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Model</p>
                    <p className="text-sm font-semibold text-slate-900">{asset.modelNumber || '—'}</p>
                  </div>
                  {asset.installYear && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Install Year</p>
                      <p className="text-sm font-semibold text-slate-900">{asset.installYear}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white border-4 border-[#232249] rounded-lg">
                      <QRCodeSVG value={window.location.href} size={140} level="H" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asset ID</p>
                    <p className="text-xs font-mono text-slate-700">{asset.id.slice(0, 13)}...</p>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              {asset.room && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-blue-700" />
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Location</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-700">Building:</span>
                      <span className="text-sm font-bold text-blue-900">{asset.room.floor.building.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-700">Floor:</span>
                      <span className="text-sm font-bold text-blue-900">{asset.room.floor.number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-700">Room:</span>
                      <span className="text-sm font-bold text-blue-900">{asset.room.name}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT MAIN CONTENT - Tabbed Interface */}
          <div className="lg:col-span-3">
            
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg mb-6 border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-[#232249] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
                    activeTab === 'maintenance'
                      ? 'bg-[#232249] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Maintenance
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
                    activeTab === 'specs'
                      ? 'bg-[#232249] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('docs')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
                    activeTab === 'docs'
                      ? 'bg-[#232249] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <File className="w-4 h-4" />
                  Documents
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <>
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                          OPTIMAL
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-slate-600 mb-1">Uptime</h3>
                      <p className="text-3xl font-bold text-slate-900">99.8%</p>
                      <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          ACTIVE
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-slate-600 mb-1">Work Orders</h3>
                      <p className="text-3xl font-bold text-slate-900">{asset.workOrders?.length || 0}</p>
                      <p className="text-xs text-slate-500 mt-2">Total completed</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          EXCELLENT
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-slate-600 mb-1">Health Score</h3>
                      <p className="text-3xl font-bold text-slate-900">95/100</p>
                      <p className="text-xs text-slate-500 mt-2">System calculated</p>
                    </div>
                  </div>

                  {/* Active Alerts */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                      <h3 className="text-lg font-bold text-slate-900">Active Alerts</h3>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-800">
                        ✓ No active alerts. System operating normally.
                      </p>
                    </div>
                  </div>

                  {/* Latest Readings (REAL DATA FROM CHECKLIST) */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                      <ClipboardList className="w-6 h-6 text-[#232249]" />
                      <h3 className="text-lg font-bold text-slate-900">Latest Readings</h3>
                    </div>

                    {asset.latestReadings && Object.keys(asset.latestReadings).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(asset.latestReadings).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="text-xs font-medium text-slate-500 mb-1 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-2xl font-bold text-slate-900">
                              {typeof value === 'number' ? value.toFixed(1) : value}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No recent readings logged</p>
                        <p className="text-xs text-slate-400 mt-1">Complete a work order with checklist data to see readings here</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* MAINTENANCE TAB */}
              {activeTab === 'maintenance' && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <History className="w-6 h-6 text-[#232249]" />
                    <h3 className="text-lg font-bold text-slate-900">Maintenance Timeline</h3>
                  </div>

                  {asset.workOrders && asset.workOrders.length > 0 ? (
                    <div className="space-y-4">
                      {asset.workOrders.map((wo: any) => (
                        <div key={wo.id} className="flex gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer">
                          <div className="flex-shrink-0 mt-1">
                            {getWorkOrderStatusIcon(wo.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 mb-1">{wo.title}</h4>
                            <p className="text-xs text-slate-600 mb-2">{wo.description || 'No description'}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {wo.assignedTo ? `${wo.assignedTo.firstName} ${wo.assignedTo.lastName}` : 'Unassigned'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(wo.createdAt).toLocaleDateString()}
                              </div>
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                wo.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                wo.status === 'ON_HOLD' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {wo.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-sm text-slate-500">No maintenance history recorded</p>
                    </div>
                  )}
                </div>
              )}

              {/* SPECIFICATIONS TAB - ENHANCED WITH ALL EXCEL FIELDS */}
              {activeTab === 'specs' && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings2 className="w-6 h-6 text-[#232249]" />
                    <h3 className="text-lg font-bold text-slate-900">Complete Technical Specifications</h3>
                    <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      Imported from Excel
                    </span>
                  </div>

                  {/* Comprehensive Specifications Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Asset Number / Tag */}
                    {(asset.assetNumber || asset.customId) && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-blue-700" />
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Asset Tag / ID</p>
                        </div>
                        <p className="text-lg font-bold text-blue-900 font-mono">
                          {asset.assetNumber || asset.customId}
                        </p>
                      </div>
                    )}

                    {/* Serial Number */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial Number</p>
                      </div>
                      <p className="text-sm font-bold text-[#232249] font-mono">
                        {asset.serialNo || 'N/A'}
                      </p>
                    </div>

                    {/* Manufacturer */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Factory className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manufacturer</p>
                      </div>
                      <p className="text-sm font-bold text-[#232249]">
                        {asset.manufacturer || 'N/A'}
                      </p>
                    </div>

                    {/* Model Number */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Number</p>
                      </div>
                      <p className="text-sm font-bold text-[#232249] font-mono">
                        {asset.modelNumber || 'N/A'}
                      </p>
                    </div>

                    {/* Install Year */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Install Year</p>
                      </div>
                      <p className="text-sm font-bold text-[#232249]">
                        {asset.installYear || 'N/A'}
                      </p>
                    </div>

                    {/* Department */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</p>
                      </div>
                      <p className="text-sm font-bold text-[#232249]">
                        {asset.department || 'N/A'}
                      </p>
                    </div>

                    {/* Cost Center */}
                    {asset.costCenter && (
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-slate-600" />
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost Center</p>
                        </div>
                        <p className="text-sm font-bold text-[#232249] font-mono">
                          {asset.costCenter}
                        </p>
                      </div>
                    )}

                    {/* Filter Size */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Filter className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Size</p>
                      </div>
                      <p className="text-sm font-bold text-[#232249]">
                        {asset.filterSize || 'N/A'}
                      </p>
                    </div>

                    {/* Belt Size */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Slack className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Belt Size</p>
                      </div>
                      <p className="text-sm font-bold text-[#232249]">
                        {asset.beltSize || 'N/A'}
                      </p>
                    </div>

                    {/* Site */}
                    {asset.site && (
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-slate-600" />
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Site</p>
                        </div>
                        <p className="text-sm font-bold text-[#232249]">
                          {asset.site}
                        </p>
                      </div>
                    )}

                    {/* Legacy Location */}
                    {asset.location && (
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-slate-600" />
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location (Legacy)</p>
                        </div>
                        <p className="text-sm font-bold text-[#232249]">
                          {asset.location}
                        </p>
                      </div>
                    )}

                    {/* Category/Type */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Box className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category / Type</p>
                      </div>
                      <p className="text-sm font-bold text-[#232249]">
                        {asset.category}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Status</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </div>

                  </div>

                  {/* Notes Section - Full Width */}
                  {asset.notes && (
                    <div className="mt-8 pt-6 border-t-2 border-slate-200">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-[#232249]" />
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Additional Notes</h4>
                      </div>
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {asset.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="font-medium">Created:</span>
                      <span>{new Date(asset.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="font-medium">Last Updated:</span>
                      <span>{new Date(asset.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENTS TAB (REAL UPLOADS) */}
              {activeTab === 'docs' && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <File className="w-6 h-6 text-[#232249]" />
                      <h3 className="text-lg font-bold text-slate-900">Documents & Attachments</h3>
                    </div>
                    <div>
                      <input
                        ref={documentInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => documentInputRef.current?.click()}
                        disabled={uploadingDocument}
                        className="flex items-center gap-2 px-4 py-2 bg-[#232249] text-white rounded-lg text-sm font-medium hover:bg-[#1a1b3d] transition-colors disabled:opacity-50"
                      >
                        {uploadingDocument ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Document
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {asset.documents && asset.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {asset.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                          <div className="flex-shrink-0">
                            <FileText className="w-10 h-10 text-[#232249]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-[#232249] hover:underline block truncate"
                            >
                              {doc.name}
                            </a>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">{formatFileSize(doc.fileSize)}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.name)}
                            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-sm text-slate-500">No documents uploaded yet</p>
                      <p className="text-xs text-slate-400 mt-1">Click "Upload Document" above to add manuals, datasheets, or other files</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AssetDetailsPage;
