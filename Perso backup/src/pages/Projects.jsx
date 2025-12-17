import React from 'react';
import WaveScroll from '../components/WaveScroll';

const projects = [
    { id: 1, title: "AI Market Predictor", student: "Alice M.", category: "Data Science", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "Eco-Friendly E-commerce", student: "Bob D.", category: "Business", image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "Smart City Dashboard", student: "Charlie T.", category: "Data Viz", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" },
    { id: 4, title: "Fintech Mobile App", student: "Diana P.", category: "Product Design", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800" },
    { id: 5, title: "Healthcare Analytics", student: "Evan G.", category: "Data Science", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" },
    { id: 6, title: "Sustainable Fashion", student: "Fiona L.", category: "Business", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800" },
];

const Projects = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <WaveScroll>
                <h1 className="text-4xl font-bold mb-8 text-center">Student Projects</h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    Explore the innovative work created by Eugenia School students, ranging from data science algorithms to business strategies.
                </p>
            </WaveScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                    <WaveScroll key={project.id} delay={index * 0.1}>
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-eugenia-yellow text-eugenia-dark text-xs font-bold px-2 py-1 rounded-full">
                                    {project.category}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-eugenia-red transition-colors">{project.title}</h3>
                                <p className="text-gray-500 text-sm mb-4">by {project.student}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-eugenia-red-dark font-semibold text-sm">View Details</span>
                                    <div className="w-8 h-8 bg-eugenia-grey-30 rounded-full flex items-center justify-center group-hover:bg-eugenia-red group-hover:text-white transition-colors">
                                        &rarr;
                                    </div>
                                </div>
                            </div>
                        </div>
                    </WaveScroll>
                ))}
            </div>
        </div>
    );
};

export default Projects;
