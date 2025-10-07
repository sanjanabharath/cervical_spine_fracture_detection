import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileImage,
  CheckCircle,
  AlertCircle,
  Circle,
  Info,
  Clipboard,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface UploadedFile {
  file: File;
  preview: string;
  status: "uploading" | "success" | "error" | "analyzing";
  progress: number;
}

interface AnalysisResult {
  fracture_probabilities: Record<string, number>;
  highest_probability_fracture: {
    class: string;
    probability: number;
  };
  overall_fracture_risk: number;
  recommendations: Record<
    string,
    {
      severity: "High" | "Moderate" | "Low";
      action: string;
    }
  >;
  prescription?: string;
}

// Colors for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPrescribing, setIsPrescribing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  );
  const [prescription, setPrescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [allergies, setAllergies] = useState<string>("");
  const [medicalHistory, setMedicalHistory] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "uploading" as const,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    // Reset analysis results when new files are uploaded
    setAnalysisResults(null);
    setPrescription(null);
    setShowPrescription(false);

    // Simulate upload process
    setIsUploading(true);
    newFiles.forEach((fileObj) => {
      const interval = setInterval(() => {
        setFiles((current) => {
          const updated = current.map((f) => {
            if (f.file === fileObj.file) {
              const newProgress = Math.min(f.progress + 5, 100);
              let newStatus = f.status;

              if (newProgress === 100) {
                clearInterval(interval);
                newStatus = "analyzing";

                // After "analyzing" for 2 seconds, set to "success"
                setTimeout(() => {
                  setFiles((latest) =>
                    latest.map((latestFile) =>
                      latestFile.file === fileObj.file
                        ? { ...latestFile, status: "success" }
                        : latestFile
                    )
                  );
                }, 2000);
              }

              return { ...f, progress: newProgress, status: newStatus };
            }
            return f;
          });

          // Check if all files are done uploading
          const allDone = updated.every((f) => f.progress === 100);
          if (allDone) {
            setIsUploading(false);
          }

          return updated;
        });
      }, 100);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".dcm", ".dicom", ".jpg", ".jpeg", ".png"],
    },
    maxSize: 20971520, // 20MB
  });

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter((f) => f.file !== fileToRemove));
    // Reset analysis results when files are removed
    setAnalysisResults(null);
    setPrescription(null);
    setShowPrescription(false);
  };

  // Function to handle analysis when button is clicked
  const handleAnalysis = async () => {
    if (!files.length || files.some((f) => f.status !== "success")) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setShowPrescription(false);
    setPrescription(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0].file);

      const response = await axios.post(
        "http://127.0.0.1:5000/api/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        setAnalysisResults(response.data.analysis_results);
      } else {
        setError(response.data.error || "Unknown error occurred");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to analyze image"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to handle prescription generation
  const handlePrescription = async () => {
    if (!files.length || files.some((f) => f.status !== "success")) {
      return;
    }

    setIsPrescribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0].file);
      formData.append("allergies", allergies || "None reported");
      formData.append(
        "medical_history",
        medicalHistory || "No significant history"
      );

      console.log("Sending prescription request with:", {
        file: files[0].file.name,
        allergies: allergies || "None reported",
        medical_history: medicalHistory || "No significant history",
      });

      const response = await axios.post(
        "http://127.0.0.1:5000/api/analyze?include_prescription=true",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Prescription response:", response.data);

      if (response.data.status === "success") {
        setAnalysisResults(response.data.analysis_results);

        if (response.data.analysis_results.prescription) {
          setPrescription(response.data.analysis_results.prescription);
          setShowPrescription(true);
        } else {
          setError("Prescription was not included in the response");
        }
      } else {
        setError(response.data.error || "Unknown error occurred");
      }
    } catch (err: any) {
      console.error("Prescription error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to generate prescription"
      );
    } finally {
      setIsPrescribing(false);
    }
  };

  // Function to download prescription
  const downloadPrescription = () => {
    if (!prescription) return;

    const blob = new Blob([prescription], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prescription_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Transform data for charts
  const getProbabilityChartData = () => {
    if (!analysisResults) return [];

    return Object.entries(analysisResults.fracture_probabilities).map(
      ([key, value]) => ({
        name: key,
        probability: Math.round(value * 100),
      })
    );
  };

  const getSeverityData = () => {
    if (!analysisResults) return [];

    const severityCounts = { High: 0, Moderate: 0, Low: 0 };

    Object.values(analysisResults.recommendations).forEach((rec) => {
      severityCounts[rec.severity] += 1;
    });

    return Object.entries(severityCounts).map(([key, value]) => ({
      name: key,
      value,
    }));
  };

  return (
    <section className="w-full">
      {/* Patient Information Fields */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Info className="mr-2" size={20} />
          Patient Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="allergies"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Allergies
            </label>
            <textarea
              id="allergies"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter patient allergies (e.g., Penicillin, Aspirin, etc.)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="medicalHistory"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Medical History
            </label>
            <textarea
              id="medicalHistory"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter relevant medical history (previous injuries, conditions, surgeries, etc.)"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload
            className={`h-12 w-12 ${
              isDragActive ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive
                ? "Drop the files here"
                : "Drag & drop X-ray images here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse your computer
            </p>
          </div>
          <p className="text-xs text-gray-400 max-w-md">
            Supports DICOM (.dcm), JPEG, and PNG formats up to 20MB each
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Uploaded Files
          </h3>
          <ul className="space-y-4">
            <AnimatePresence>
              {files.map((fileObj, index) => (
                <motion.li
                  key={fileObj.file.name + index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center"
                >
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                    {fileObj.preview ? (
                      <img
                        src={fileObj.preview}
                        alt={fileObj.file.name}
                        className="h-full w-full object-cover"
                        onLoad={() => {
                          URL.revokeObjectURL(fileObj.preview);
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <FileImage className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {fileObj.status === "uploading" && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${fileObj.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploading... {fileObj.progress}%
                        </p>
                      </div>
                    )}
                    {fileObj.status === "analyzing" && (
                      <div className="flex items-center mt-1">
                        <div className="mr-2 h-4 w-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                        <p className="text-xs text-primary-600">
                          Analyzing scan...
                        </p>
                      </div>
                    )}
                    {fileObj.status === "success" && (
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <p className="text-xs text-green-600">
                          Analysis complete
                        </p>
                      </div>
                    )}
                    {fileObj.status === "error" && (
                      <div className="flex items-center mt-1">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                        <p className="text-xs text-red-600">Upload failed</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileObj.file);
                    }}
                    className="ml-4 p-1 rounded-full hover:bg-gray-100"
                    disabled={isUploading}
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              variant="default"
              disabled={
                isUploading ||
                isPrescribing ||
                isAnalyzing ||
                files.some((f) => f.status !== "success")
              }
              className="flex items-center"
              onClick={handleAnalysis}
            >
              {isAnalyzing ? (
                <>
                  <Circle className="animate-spin mr-2" size={16} />
                  Analyzing...
                </>
              ) : (
                "View Analysis Results"
              )}
            </Button>

            <Button
              variant="outline"
              disabled={
                isUploading ||
                isPrescribing ||
                isAnalyzing ||
                files.some((f) => f.status !== "success")
              }
              className="flex items-center"
              onClick={handlePrescription}
            >
              {isPrescribing ? (
                <>
                  <Circle className="animate-spin mr-2" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <Clipboard className="mr-2" size={16} />
                  Get Doctor Prescription
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Analysis Results Dashboard */}
      {isAnalyzing && (
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <p className="flex items-center">
            <Circle className="animate-spin mr-2" size={20} />
            Analyzing image... Please wait.
          </p>
        </div>
      )}

      {isPrescribing && (
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <p className="flex items-center">
            <Circle className="animate-spin mr-2" size={20} />
            Generating prescription... Please wait.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-md">
          <p className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </p>
        </div>
      )}

      {/* Prescription Display */}
      {showPrescription && prescription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clipboard className="mr-2" size={24} />
            Doctor's Prescription
          </h2>

          <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
            {prescription}
          </div>
        </motion.div>
      )}

      {analysisResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-4">
            Cervical Fracture Analysis Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Highest Probability Fracture</h3>
              <div className="flex items-center">
                <div className="text-lg font-bold mr-2">
                  {analysisResults.highest_probability_fracture.class}:
                </div>
                <div className="text-lg">
                  {Math.round(
                    analysisResults.highest_probability_fracture.probability *
                      100
                  )}
                  %
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Overall Fracture Risk</h3>
              <div className="flex items-center">
                <div className="text-lg font-bold">
                  {Math.round(analysisResults.overall_fracture_risk * 100)}%
                </div>
                <div className="ml-2">
                  {analysisResults.overall_fracture_risk > 0.6 ? (
                    <AlertCircle className="text-red-500" size={20} />
                  ) : analysisResults.overall_fracture_risk > 0.3 ? (
                    <Info className="text-yellow-500" size={20} />
                  ) : (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-medium mb-4">Fracture Probabilities</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getProbabilityChartData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "Probability (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="probability"
                  fill="#8884d8"
                  name="Probability (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <h3 className="font-medium mb-4">Recommendations</h3>
              <div className="space-y-4">
                {Object.entries(analysisResults.recommendations).map(
                  ([vertebra, rec]) => (
                    <div key={vertebra} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{vertebra}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.severity === "High"
                              ? "bg-red-100 text-red-800"
                              : rec.severity === "Moderate"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {rec.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{rec.action}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={getSeverityData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {getSeverityData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "High"
                            ? "#ef4444"
                            : entry.name === "Moderate"
                            ? "#f59e0b"
                            : "#10b981"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default FileUpload;
