import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { signalApi } from '../services/api';
import type { SignalRequest } from '../types';
import Navbar from '../components/Navbar';
import SignalForm from '../components/SignalForm';
import './CreateSignalPage.css';

const CreateSignalPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: SignalRequest) => {
    await signalApi.createSignal(data);
    toast.success('Signal created successfully!', {
      icon: '🚀',
      style: {
        background: '#111827',
        color: '#e2e8f0',
        border: '1px solid rgba(0, 255, 136, 0.2)',
      },
    });
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <>
      <Navbar />
      <motion.div
        className="page-container create-signal-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="create-signal-breadcrumb"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link to="/">Dashboard</Link>
          <ChevronRight size={14} className="create-signal-breadcrumb-separator" />
          <span className="create-signal-breadcrumb-current">Create Signal</span>
        </motion.div>

        <SignalForm onSubmit={handleSubmit} />
      </motion.div>
    </>
  );
};

export default CreateSignalPage;
