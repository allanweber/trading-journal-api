// Mock implementation for the destroy function
export const destroyMock = jest.fn();

// Mock implementation for the uploader object
const uploaderMock = {
  destroy: destroyMock,
};

// Mock implementation for the v2 object
const v2Mock = {
  uploader: uploaderMock,
};

// Mock implementation for the Cloudinary object
const cloudinaryMock = {
  v2: v2Mock,
};

export default cloudinaryMock;
