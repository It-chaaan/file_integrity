import apiClient from './client';
import { withErrorContext } from './utils/errorContext';

// Optional feature flag to enable profile photo endpoints when backend supports them
export const PROFILE_PHOTO_ENABLED = import.meta.env.VITE_PROFILE_PHOTO_ENABLED === 'true';

/**
 * Upload the current user's profile photo.
 * Requires backend support for multipart uploads at /v1/auth/me/photo/.
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Response data from backend
 */
export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('profile_photo', file);

  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/me/photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    'profilePhoto.upload',
    { resource: 'profilePhoto', action: 'upload' }
  );

  return response.data;
};

/**
 * Remove the current user's profile photo.
 * Requires backend support for DELETE at /v1/auth/me/photo/.
 * @returns {Promise<Object>} Response data from backend
 */
export const removeProfilePhoto = async () => {
  const response = await withErrorContext(
    () => apiClient.delete('/v1/auth/me/photo/'),
    'profilePhoto.delete',
    { resource: 'profilePhoto', action: 'delete' }
  );
  return response.data;
};

export default {
  PROFILE_PHOTO_ENABLED,
  uploadProfilePhoto,
  removeProfilePhoto,
};
