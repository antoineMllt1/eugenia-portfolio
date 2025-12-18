import React from 'react';
import { motion } from 'framer-motion';
const Home = () => {
    return (
        <div className="min-h-screen bg-eugenia-grey">
            {/* Hero Section */}
            <section className="relative bg-eugenia-dark text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-sans font-bold mb-6"
                    >
                        Welcome to <span className="text-eugenia-red">Eugenia</span> Student Hub
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-eugenia-grey-60 max-w-3xl mb-10"
                    >
                        Discover the next generation of business and data experts. Explore projects, connect with students, and see what we're building.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <a href="/projects" className="inline-block bg-eugenia-yellow text-eugenia-dark font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform">
                            Explore Projects
                        </a>
                    </motion.div>
                </div>

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-eugenia-red rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-eugenia-yellow rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </section>

            {/* Latest Projects Preview */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-sans font-bold text-eugenia-dark mb-10">Latest from our Students</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((item) => (
                        <motion.div
                            key={item}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-xl overflow-hidden shadow-lg"
                        >
                            <div className="h-48 bg-gray-200"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2">Project Title {item}</h3>
                                <p className="text-gray-600 mb-4">A brief description of the project goes here. Innovative and data-driven.</p>
                                <span className="text-eugenia-red-dark font-semibold text-sm">Read more &rarr;</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
