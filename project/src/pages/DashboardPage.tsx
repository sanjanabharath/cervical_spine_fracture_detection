import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, Settings, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

// Demo data
const patientScans = [
  {
    id: '1',
    patientId: 'PT-10284',
    name: 'John Smith',
    age: 45,
    date: '2025-04-12',
    scanType: 'Cervical X-ray',
    result: 'Positive',
    confidence: 97.8,
    location: 'C5-C6',
    imageUrl: 'https://images.pexels.com/photos/8460156/pexels-photo-8460156.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '2',
    patientId: 'PT-10285',
    name: 'Sarah Johnson',
    age: 38,
    date: '2025-04-11',
    scanType: 'Cervical X-ray',
    result: 'Negative',
    confidence: 99.3,
    location: 'N/A',
    imageUrl: 'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '3',
    patientId: 'PT-10286',
    name: 'Michael Williams',
    age: 62,
    date: '2025-04-10',
    scanType: 'Cervical X-ray',
    result: 'Positive',
    confidence: 96.1,
    location: 'C4-C5',
    imageUrl: 'https://images.pexels.com/photos/8460237/pexels-photo-8460237.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: '4',
    patientId: 'PT-10287',
    name: 'Emily Davis',
    age: 29,
    date: '2025-04-09',
    scanType: 'Cervical X-ray',
    result: 'Negative',
    confidence: 98.7,
    location: 'N/A',
    imageUrl: 'https://images.pexels.com/photos/8460218/pexels-photo-8460218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

// Stats for the dashboard
const stats = [
  { label: 'Scans Analyzed', value: '248' },
  { label: 'Positive Findings', value: '52' },
  { label: 'Average Accuracy', value: '98.2%' },
  { label: 'Processing Time', value: '4.3s' },
];

const DashboardPage: React.FC = () => {
  const [expandedScan, setExpandedScan] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedScan === id) {
      setExpandedScan(null);
    } else {
      setExpandedScan(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Dashboard</h1>
          <p className="text-gray-600">
            Review scan results and patient data
          </p>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap items-center gap-4">
          <div className="font-medium text-gray-700">Filters:</div>
          <div className="flex items-center gap-4 flex-wrap">
            <select className="rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm">
              <option>All Scan Types</option>
              <option>Cervical X-ray</option>
              <option>CT Scan</option>
              <option>MRI</option>
            </select>
            
            <select className="rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm">
              <option>All Results</option>
              <option>Positive</option>
              <option>Negative</option>
              <option>Inconclusive</option>
            </select>
            
            <select className="rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
              <option>All Time</option>
            </select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        {/* Scans list */}
        <div className="space-y-4">
          {patientScans.map((scan) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div 
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(scan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="h-6 w-6 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{scan.name}</h3>
                        <p className="text-sm text-gray-500">
                          ID: {scan.patientId} | {scan.date} | {scan.scanType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        {scan.result === 'Positive' ? (
                          <>
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <span className="font-medium text-red-600">Fracture Detected</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="font-medium text-green-600">No Fracture</span>
                          </>
                        )}
                      </div>
                      <div>
                        {expandedScan === scan.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {expandedScan === scan.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Patient ID</p>
                              <p className="font-medium">{scan.patientId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium">{scan.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Age</p>
                              <p className="font-medium">{scan.age}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Scan Date</p>
                              <p className="font-medium">{scan.date}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Scan Type</p>
                              <p className="font-medium">{scan.scanType}</p>
                            </div>
                          </div>

                          <h4 className="text-lg font-medium text-gray-900 mt-8 mb-4">Analysis Results</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Result</p>
                              <p className={`font-medium ${
                                scan.result === 'Positive' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {scan.result === 'Positive' ? 'Fracture Detected' : 'No Fracture'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Confidence</p>
                              <p className="font-medium">{scan.confidence}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium">{scan.location}</p>
                            </div>
                          </div>

                          <div className="mt-8 flex space-x-4">
                            <Button variant="default">View Full Report</Button>
                            <Button variant="outline" className="flex items-center">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <div className="bg-gray-100 rounded-lg overflow-hidden h-72 md:h-80">
                            <img 
                              src={scan.imageUrl} 
                              alt={`X-ray scan for ${scan.name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            {scan.scanType} - {scan.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;