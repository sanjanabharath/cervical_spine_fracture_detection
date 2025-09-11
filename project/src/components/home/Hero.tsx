import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-900 text-white min-h-screen flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070')] bg-center bg-cover"></div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Advanced Cervical Fracture Detection
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-lg">
              AI-powered image analysis for accurate diagnosis of cervical spine
              injuries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary-700 text-lg h-14 px-10"
                asChild
              >
                <Link to="/upload" className="flex items-center justify-center">
                  Upload Scan <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
                asChild
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-lg overflow-hidden shadow-2xl max-h-[500px]"
          >
            <img
              src="https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Doctor analyzing X-ray scan"
              className="w-full h-[500px] object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent flex items-end">
              <div className="p-6">
                <p className="text-white font-medium">
                  Our AI model analyzes cervical X-rays with 98.7% accuracy
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,96L80,85.3C160,75,320,53,480,64C640,75,800,117,960,122.7C1120,128,1280,96,1360,80L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
