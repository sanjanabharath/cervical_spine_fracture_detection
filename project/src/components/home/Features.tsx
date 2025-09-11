import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, BarChart4, FileText, Brain, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const features = [
  {
    icon: <Brain className="h-10 w-10 text-primary-500" />,
    title: 'Advanced AI Analysis',
    description: 'State-of-the-art deep learning algorithms analyze X-ray images with high precision.',
  },
  {
    icon: <Zap className="h-10 w-10 text-primary-500" />,
    title: 'Real-time Processing',
    description: 'Get results in seconds, not hours, enabling faster patient care decisions.',
  },
  {
    icon: <Shield className="h-10 w-10 text-primary-500" />,
    title: 'HIPAA Compliant',
    description: 'Enterprise-grade security protocols ensure patient data privacy and compliance.',
  },
  {
    icon: <BarChart4 className="h-10 w-10 text-primary-500" />,
    title: 'Detailed Reports',
    description: 'Comprehensive analysis with visualization of detected fracture locations.',
  },
  {
    icon: <FileText className="h-10 w-10 text-primary-500" />,
    title: 'DICOM Support',
    description: 'Full compatibility with industry-standard DICOM image formats.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary-500" />,
    title: 'Team Collaboration',
    description: 'Share results with your medical team for collaborative diagnosis.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Medical Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with user-friendly interfaces to streamline the diagnosis process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:border-primary-300 transition-all duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;