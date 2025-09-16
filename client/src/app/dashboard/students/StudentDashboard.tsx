import { usePrograms } from "../../../context/ProgramContext";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { ProgramType } from "../../../store/types";

const StudentDashboard = () => {
  const { programs } = usePrograms();
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Welcome, {user?.displayName || "Student"}!
      </motion.h1>
      <h2 className="text-2xl font-semibold mb-4">Your Enrolled Programs</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {programs.map((program: ProgramType) => (
          <div key={program.id} className="p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-bold">{program.name}</h3>
            <p className="text-gray-600">{program.description}</p>
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
              View Materials
            </button>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default StudentDashboard;