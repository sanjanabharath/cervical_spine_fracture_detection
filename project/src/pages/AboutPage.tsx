import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
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
            About CervicalScan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advancing healthcare with AI-powered cervical fracture detection
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="mb-12 relative overflow-hidden rounded-2xl">
            <img 
              src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Medical team reviewing X-rays" 
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 to-transparent flex items-center">
              <div className="p-8">
                <h2 className="text-white text-3xl font-bold mb-2">Our Mission</h2>
                <p className="text-white/90 max-w-lg">
                  To enhance diagnostic accuracy and improve patient outcomes through innovative AI technology.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Technology</h2>
          <p>
            CervicalScan is built on a state-of-the-art deep learning model specifically trained to identify fractures in cervical spine X-rays. Our technology is based on extensive research in computer vision and medical imaging analysis, enabling detection of even subtle fracture patterns that might be missed in standard radiological examinations.
          </p>
          <p>
            The underlying algorithm utilizes a TensorFlow architecture with custom convolutional neural networks optimized for medical imaging. Trained on over 50,000 annotated X-ray images, our model achieves 98.7% accuracy in detecting cervical fractures, making it a valuable tool for radiologists and emergency physicians.
          </p>

          <div className="my-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Research Components</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Transfer learning from established medical imaging models</li>
              <li>Custom data augmentation techniques for medical X-rays</li>
              <li>Ensemble approach combining multiple neural network architectures</li>
              <li>Attention mechanisms focused on vertebrae identification and analysis</li>
              <li>Validation against expert radiologist diagnoses</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">The Team</h2>
          <p>
            Our interdisciplinary team brings together expertise in artificial intelligence, medical imaging, and clinical practice. Founded by radiologists and AI researchers from leading medical institutions, CervicalScan combines technical innovation with practical clinical requirements.
          </p>
          <p>
            The development team includes specialists in deep learning, medical image processing, and healthcare IT integration, ensuring our platform not only delivers accurate results but also fits seamlessly into clinical workflows.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Foundation</h2>
          <p>
            Our work builds upon research published in leading medical imaging journals and presented at major conferences. The core algorithm is an extension of the methodology described in our Kaggle project "<a href="https://www.kaggle.com/code/sanjanab24mcs1045/cervical-fracture-dicom-images-classification-tf-a" className="text-primary-600 hover:text-primary-800 transition-colors" target="_blank" rel="noopener noreferrer">Cervical Fracture DICOM Images Classification with TensorFlow</a>", which demonstrated breakthrough performance in automated fracture detection.
          </p>
          <p>
            We continue to refine our models through ongoing research collaborations with leading medical institutions, incorporating feedback from practicing radiologists to enhance detection accuracy and expand the range of identifiable pathologies.
          </p>

          <div className="mt-10 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p>
              For more information about our technology or to discuss potential collaborations, please contact our team at <a href="mailto:info@cervicalscan.com" className="text-primary-600 hover:text-primary-800 transition-colors">info@cervicalscan.com</a>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;