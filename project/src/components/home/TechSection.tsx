import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Database, Globe, Star } from 'lucide-react';

const TechSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cutting-Edge Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our solution is built on advanced machine learning models and medical imaging expertise.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:order-last"
          >
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Cpu className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">TensorFlow Architecture</h3>
                  <p className="text-gray-600">
                    Built on Google's TensorFlow framework, our models leverage GPU acceleration for rapid analysis of complex medical images.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">98.7% Classification Accuracy</h3>
                  <p className="text-gray-600">
                    Our model achieves industry-leading accuracy on cervical fracture detection, validated against expert radiologist diagnoses.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Database className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Trained on 50,000+ X-rays</h3>
                  <p className="text-gray-600">
                    Comprehensive training set across diverse patient demographics ensures reliable performance in real-world clinical settings.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Globe className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Cloud-Based Processing</h3>
                  <p className="text-gray-600">
                    Secure, scalable cloud infrastructure ensures consistent performance even during peak demand periods.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative rounded-lg overflow-hidden shadow-xl"
          >
            <img 
              src="https://images.pexels.com/photos/8942047/pexels-photo-8942047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="X-ray analysis in progress" 
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-primary-600 font-semibold">
                  Our deep learning model identifies subtle fracture patterns that can be easily missed during manual analysis.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TechSection;