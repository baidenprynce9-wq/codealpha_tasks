import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LogOut, Layout, Plus, X, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (err) {
            console.error("Error fetching projects", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/projects', { name: projectName, description: projectDesc });
            setProjects([...projects, response.data]);
            setIsModalOpen(false);
            setProjectName('');
            setProjectDesc('');
        } catch (err) {
            console.error("Error creating project", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Layout className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">ProjectPulse</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:block">
                                <span className="text-sm text-gray-500">Welcome back,</span>
                                <span className="ml-1 text-sm font-semibold text-gray-900">{user?.name}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all border border-transparent hover:border-gray-300"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your collaborate projects and tasks</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">New Project</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                to={`/project/${project.id}`}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                        <Folder className="h-6 w-6 text-indigo-600" />
                                    </div>
                                </div>
                                <h3 className="mt-4 text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                                <p className="mt-2 text-gray-500 line-clamp-2 text-sm leading-relaxed">
                                    {project.description || "No description provided."}
                                </p>
                                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">Active</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-20 px-4 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Folder className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                        <p className="mt-1 text-gray-500 max-w-xs mx-auto">Get started by creating your first collaborative project space.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            Create a project &rarr;
                        </button>
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">New Project</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900"
                                    placeholder="Enter project name"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900 h-28 resize-none"
                                    placeholder="What is this project about?"
                                    value={projectDesc}
                                    onChange={(e) => setProjectDesc(e.target.value)}
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
