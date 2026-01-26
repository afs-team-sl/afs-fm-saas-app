import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { ArrowLeft, Box, History, Calendar, User, CheckCircle2, AlertTriangle, FileText, Settings, QrCode, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const fetchAssetDetails = async () => {
    try {
      const res = await apiClient.get(`/assets/${id}`);
      setAsset(res.data);
    } catch (e) {
      toast.error("Could not load asset history.");
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintTag = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-secondary-400">
          <div className="w-5 h-5 border-2 border-secondary-300 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-sm">Loading asset details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #digital-twin-tag,
          #digital-twin-tag * {
            visibility: visible;
          }
          #digital-twin-tag {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/assets')} 
          className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Assets</span>
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintTag}
            className="px-4 py-2 border border-secondary-300 text-secondary-700 font-medium rounded-md hover:bg-secondary-50 transition-colors text-sm inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Digital Tag
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors text-sm">
            Edit Details
          </button>
        </div>
      </div>

      {/* Asset Overview Header */}
      <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center border border-primary-200">
            <Box className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{asset.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                asset.status === 'ACTIVE' ? 'bg-status-success-light text-status-success-dark border-status-success' :
                asset.status === 'MAINTENANCE' ? 'bg-status-warning-light text-status-warning-dark border-status-warning' :
                asset.status === 'RETIRED' ? 'bg-status-danger-light text-status-danger-dark border-status-danger' :
                'bg-secondary-100 text-secondary-600 border-secondary-200'
              }`}>
                {asset.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-secondary-600">
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {asset.category}
              </span>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                SN: {asset.serialNo || 'N/A'}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Registered: {new Date(asset.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Twin Tag - QR Code Component */}
      <div id="digital-twin-tag" className="bg-white rounded-xl border-2 border-secondary-300 shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary-600">
              <QrCode className="w-6 h-6" />
              <h2 className="text-xl font-bold">Digital Twin Tag</h2>
            </div>
            <div className="h-1 w-16 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full"></div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg border border-secondary-200 inline-block">
            <QRCodeSVG 
              value={window.location.href}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#1e293b"
              bgColor="#ffffff"
            />
          </div>

          {/* Asset Information */}
          <div className="space-y-3 pt-4 border-t border-secondary-200">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Asset Name</p>
              <p className="text-lg font-bold text-slate-900">{asset.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Serial Number</p>
              <p className="text-base font-mono font-semibold text-slate-700">{asset.serialNo || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Category</p>
              <p className="text-sm font-medium text-slate-600">{asset.category}</p>
            </div>
          </div>

          {/* Footer Instructions */}
          <div className="pt-4 border-t border-secondary-200">
            <p className="text-xs text-secondary-500 leading-relaxed">
              Scan this QR code to access complete asset history, maintenance records, and documentation
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Side: Performance Metrics */}
         <div className="space-y-6">
            <div className="bg-primary-600 rounded-lg p-6 text-white shadow-sm">
              <p className="text-xs font-medium opacity-90">Uptime Performance</p>
              <h2 className="text-4xl font-semibold mt-2">
                99.8<span className="text-xl">%</span>
              </h2>
              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs font-medium opacity-90">Last Critical Failure</p>
                <p className="text-sm mt-1">None Recorded</p>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-status-warning" />
                Maintenance Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-md">
                  <span className="text-xs font-medium text-secondary-600">Total Work Orders</span>
                  <span className="text-sm font-semibold text-slate-900">{asset.workOrders?.length || 0}</span>
                </div>
              </div>
            </div>
         </div>

         {/* Right Side: Maintenance Timeline */}
         <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg border border-secondary-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-slate-900">Maintenance Timeline</h3>
              </div>

              <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-secondary-200 hidden sm:block"></div>

                {asset.workOrders && asset.workOrders.length > 0 ? (
                  asset.workOrders.map((wo: any) => (
                    <div key={wo.id} className="relative pl-0 sm:pl-12">
                      {/* Dot on Timeline */}
                      <div className="absolute left-[13px] top-3 w-2 h-2 rounded-full bg-primary-600 border-2 border-white ring-2 ring-primary-600 hidden sm:block z-10"></div>
                      
                      <div className="p-4 bg-secondary-50 hover:bg-white hover:shadow-md rounded-lg border border-transparent hover:border-secondary-200 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-medium text-slate-900">{wo.title}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              wo.status === 'COMPLETED' ? 'bg-status-success-light text-status-success-dark' :
                              wo.status === 'IN_PROGRESS' ? 'bg-status-warning-light text-status-warning-dark' :
                              wo.status === 'CANCELLED' ? 'bg-status-danger-light text-status-danger-dark' :
                              'bg-status-info-light text-status-info-dark'
                            }`}>
                              {wo.status === 'IN_PROGRESS' ? 'In Progress' : wo.status.charAt(0) + wo.status.slice(1).toLowerCase()}
                            </span>
                          </div>
                          <p className="text-sm text-secondary-600 line-clamp-2">
                            {wo.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-secondary-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(wo.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="w-3 h-3" />
                              {wo.assignedTo ? `${wo.assignedTo.firstName} ${wo.assignedTo.lastName}` : 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-secondary-50 rounded-full flex items-center justify-center mx-auto text-secondary-300">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-secondary-500">No maintenance history recorded for this asset.</p>
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