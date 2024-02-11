// Mock implementation for the destroy function
export const destroyMock = jest.fn();
export const uploadMock = jest.fn();
export const resourcesMock = jest.fn();
export const deleteFolderMock = jest.fn();
export const deleteResourcesByPrefix = jest.fn();

// Mock implementation for the uploader object
const uploaderMock = {
  destroy: destroyMock,
  upload: uploadMock,
};

// Mock implementation for the resources function
const apiMock = {
  resources: resourcesMock,
  delete_folder: deleteFolderMock,
  delete_resources_by_prefix: deleteResourcesByPrefix,
};

// Mock implementation for the v2 object
const v2Mock = {
  uploader: uploaderMock,
  api: apiMock,
};

// Mock implementation for the Cloudinary object
const cloudinaryMock = {
  v2: v2Mock,
};

export default cloudinaryMock;
