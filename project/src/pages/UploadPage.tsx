import React from 'react';
import { motion } from 'framer-motion';
import FileUpload from '../components/upload/FileUpload';

const UploadPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upload X-Ray Images
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI algorithm will analyze your cervical spine X-rays to detect potential fractures with precision.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <FileUpload />
        </div>

        <div className="mt-12 bg-primary-50 rounded-xl p-6 md:p-8 border border-primary-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Guidelines for Optimal Results</h2>
          
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-medium text-primary-700">Supported File Formats</h3>
              <p>Upload DICOM (.dcm, .dicom) files for best analysis. JPEG and PNG formats are also supported.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-700">Image Quality</h3>
              <p>For accurate results, ensure X-rays are clear, properly exposed, and show the complete cervical spine region.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-700">Multiple Views</h3>
              <p>When available, upload both lateral (side) and AP (front) views for comprehensive analysis.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-primary-700">Data Privacy</h3>
              <p>All uploaded images are processed securely and never stored permanently without explicit consent.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadPage;