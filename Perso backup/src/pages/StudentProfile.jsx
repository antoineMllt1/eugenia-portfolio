import React from 'react';
import { MapPin, Link as LinkIcon, Mail, Linkedin, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import WaveScroll from '../components/WaveScroll';

const StudentProfile = () => {
    // Mock data
    const student = {
        name: "Alice M.",
        role: "Data Science Major",
        location: "Paris, France",
        bio: "Passionate about AI and Machine Learning. I love turning complex data into actionable insights. Currently working on a predictive model for sustainable energy.",
        skills: ["Python", "TensorFlow", "SQL", "Data Viz", "React"],
        socials: {
            linkedin: "#",
            github: "#",
            email: "mailto:alice@eugeniaschool.com"
        },
        projects: [
            { id: 1, title: "AI Market Predictor", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" },
            { id: 2, title: "Neural Network Viz", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800" },
            { id: 3, title: "Big Data Dashboard", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" }
        ]
    };

    return (
        <div className="min-h-screen bg-eugenia-grey">
            {/* Header / Cover */}
            <div className="h-64 bg-eugenia-dark relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-eugenia-red-dark to-eugenia-dark opacity-90"></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-eugenia-yellow rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" alt={student.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold font-sans text-eugenia-dark">{student.name}</h1>
                                <p className="text-eugenia-red font-medium text-lg">{student.role}</p>
                                <div className="flex items-center text-gray-500 mt-1">
                                    <MapPin size={16} className="mr-1" />
                                    <span>{student.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <a href={student.socials.linkedin} className="p-2 bg-eugenia-grey-30 rounded-full hover:bg-eugenia-red hover:text-white transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href={student.socials.github} className="p-2 bg-eugenia-grey-30 rounded-full hover:bg-eugenia-red hover:text-white transition-colors">
                                <Github size={20} />
                            </a>
                            <a href={student.socials.email} className="p-2 bg-eugenia-grey-30 rounded-full hover:bg-eugenia-red hover:text-white transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-bold mb-4">About Me</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {student.bio}
                            </p>

                            <h2 className="text-xl font-bold mb-4">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {student.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-eugenia-grey rounded-full text-sm font-medium text-eugenia-dark">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-eugenia-grey-30 rounded-xl p-6">
                            <h3 className="font-bold mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Projects</span>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Hackathons</span>
                                    <span className="font-bold">3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Year</span>
                                    <span className="font-bold">MSc 1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="py-12">
                    <h2 className="text-2xl font-bold mb-8">Portfolio</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {student.projects.map((project, index) => (
                            <WaveScroll key={project.id} delay={index * 0.1}>
                                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer">
                                    <div className="h-48 overflow-hidden">
                                        <img src={project.image} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg group-hover:text-eugenia-red transition-colors">{project.title}</h3>
                                    </div>
                                </div>
                            </WaveScroll>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
