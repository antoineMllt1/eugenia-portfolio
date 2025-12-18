import React, { useState } from 'react';
import { Upload, Link, Image, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="bg-eugenia-dark text-white p-8">
                    <h1 className="text-3xl font-bold font-sans mb-2">Project Submission</h1>
                    <p className="text-eugenia-grey-60">Share your latest work with the Eugenia community.</p>
                </div>

                <div className="p-8">
                    {isSubmitted ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12 text-center"
                        >
                            <CheckCircle size={64} className="text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Submission Successful!</h2>
                            <p className="text-gray-600">Your project has been sent for review.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eugenia-red focus:border-transparent" placeholder="e.g. AI Market Predictor" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eugenia-red focus:border-transparent">
                                        <option>Data Science</option>
                                        <option>Business</option>
                                        <option>Product Design</option>
                                        <option>Engineering</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eugenia-red focus:border-transparent h-32" placeholder="Describe your project..." required></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-eugenia-red transition-colors cursor-pointer group">
                                    <Image className="text-gray-400 group-hover:text-eugenia-red mb-2" size={32} />
                                    <span className="text-sm text-gray-500">Upload Cover Image</span>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-eugenia-red transition-colors cursor-pointer group">
                                    <Link className="text-gray-400 group-hover:text-eugenia-red mb-2" size={32} />
                                    <span className="text-sm text-gray-500">Add External Links</span>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-eugenia-red transition-colors cursor-pointer group">
                                    <FileText className="text-gray-400 group-hover:text-eugenia-red mb-2" size={32} />
                                    <span className="text-sm text-gray-500">Attach Documentation</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button type="submit" className="bg-eugenia-red text-white font-bold py-3 px-8 rounded-full hover:bg-eugenia-red-dark transition-colors transform hover:scale-105 flex items-center">
                                    <Upload size={20} className="mr-2" />
                                    Submit Project
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
