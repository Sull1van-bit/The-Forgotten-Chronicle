import React from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../context/SoundContext';
import logoUMN from '../assets/sponsor/logoUMN.png';

export default function Credits({ onClose }) {
  const { playExit } = useSound();

  const handleClose = () => {
    playExit();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="bg-[#8B4513] p-8 rounded-lg max-w-2xl w-full mx-4 relative border-8 border-[#D2B48C] shadow-lg"
      >
        <img 
          src={logoUMN} 
          alt="UMN Logo" 
          className="absolute top-4 left-4 w-25 h-25 object-contain"
        />
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#F5DEB3] text-2xl focus:outline-none hover:text-white transition-colors"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-[#F5DEB3]">CREDITS</h2>
        
        <div className="space-y-4 text-[#DEB887]">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-[#F5DEB3]">Game Development</h3>
            <p>P.U.N.K Team</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-[#F5DEB3]">Art & Design</h3>
            <p>Gading Kelana Putra - 00000111323</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-[#F5DEB3]">Programming</h3>
            <p>Naufal Rabbani - 00000108931</p>
            <p>Abid Irsyad Dinejad - 00000111284</p>
            <p>Rafael Romelo Gibran - 00000111248</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-[#F5DEB3]">Special Thanks To: </h3>
            <p>Allah SWT & Jesus Christ</p>
            <p>Pak Wawsasasasaassaasassaasasasao</p>
            <p>Dian Fajrina Rahmatunisa(choji)</p>
            <p>Nadine Putri </p>
            <p>Melisa Chiufin</p>
            <p>Nabila Yunita</p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-[#DEB887]">
          © P.U.N.K 2025 - All Rights Reserved
        </div>
      </motion.div>
    </motion.div>
  );
} 