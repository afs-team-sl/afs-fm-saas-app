import apiClient from './client';

/**
 * Upload an attachment (photo evidence) to a work order
 * @param workOrderId - Work Order UUID
 * @param file - File to upload (image, PDF, etc.)
 */
export const uploadAttachment = async (workOrderId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(
    `/work-orders/${workOrderId}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
