import apiClient from './client';
import axios from 'axios';

/**
 * Upload an attachment (photo evidence) to a work order
 * @param workOrderId - Work Order UUID
 * @param file - File to upload (image, PDF, etc.)
 */
export const uploadAttachment = async (workOrderId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  // Log for debugging
  console.log('Uploading file to work order:', workOrderId);
  console.log('File details:', { name: file.name, type: file.type, size: file.size });
  console.log('FormData entries:');
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  // Get auth headers from apiClient but DON'T set Content-Type
  const token = localStorage.getItem('access_token');
  const tenantId = localStorage.getItem('tenant_id');
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (tenantId) {
    headers['x-tenant-id'] = tenantId;
  }
  
  // Use a raw axios call without the default Content-Type header
  const baseURL = import.meta.env.VITE_API_URL || 'https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net';
  
  const response = await axios.post(
    `${baseURL}/work-orders/${workOrderId}/upload`,
    formData,
    {
      headers,
      withCredentials: true,
    }
  );

  return response.data;
};

/**
 * Get all attachments for a work order
 * @param workOrderId - Work Order UUID
 */
export const getAttachments = async (workOrderId: string) => {
  const response = await apiClient.get(`/work-orders/${workOrderId}/attachments`);
  return response.data;
};

/**
 * Delete an attachment from a work order
 * @param workOrderId - Work Order UUID
 * @param attachmentId - Attachment UUID
 */
export const deleteAttachment = async (workOrderId: string, attachmentId: string) => {
  const response = await apiClient.delete(
    `/work-orders/${workOrderId}/attachments/${attachmentId}`
  );
  return response.data;
};
