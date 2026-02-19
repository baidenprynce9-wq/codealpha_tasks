import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Layout, Plus, ChevronLeft, MoreVertical, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';

const ProjectBoard = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState({ loading: false, message: '', error: false });

    const socketRef = useRef();

    useEffect(() => {
        fetchProjectData();

        // Socket setup
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join_project', id);

        socketRef.current.on('task_created', (task) => {
            setTasks(prev => [task, ...prev]);
        });

        socketRef.current.on('task_updated', (updatedTask) => {
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
            setSelectedTask(prev => prev?.id === updatedTask.id ? updatedTask : prev);
        });

        socketRef.current.on('task_deleted', (taskId) => {
            setTasks(prev => prev.filter(t => t.id !== parseInt(taskId)));
            setSelectedTask(prev => prev?.id === parseInt(taskId) ? null : prev);
        });

        socketRef.current.on('comment_added', (comment) => {
            if (selectedTask?.id === comment.task_id) {
                setComments(prev => [...prev, comment]);
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id, selectedTask?.id]);

    const fetchProjectData = async () => {
        try {
            const [projRes, tasksRes] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/tasks/project/${id}`)
            ]);
            setProject(projRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error("Error fetching board data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (taskId) => {
        try {
            const response = await api.get(`/comments/task/${taskId}`);
            setComments(response.data);
        } catch (err) {
            console.error("Error fetching comments", err);
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        fetchComments(task.id);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/comments', { task_id: selectedTask.id, content: newComment });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (err) {
            console.error("Error adding comment", err);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks', { ...newTask, project_id: id });
            setIsTaskModalOpen(false);
            setNewTask({ title: '', description: '', priority: 'medium' });
            fetchProjectData();
        } catch (err) {
            console.error("Error creating task", err);
        }
    };

    const updateTaskStatus = async (e, taskId, newStatus) => {
        e.stopPropagation();
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            if (selectedTask?.id === taskId) {
                setSelectedTask({ ...selectedTask, status: newStatus });
            }
        } catch (err) {
            console.error("Error updating status", err);
        }
    };

    const deleteTask = async (e, taskId) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(t => t.id !== taskId));
            if (selectedTask?.id === taskId) setSelectedTask(null);
        } catch (err) {
            console.error("Error deleting task", err);
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        setInviteStatus({ loading: true, message: '', error: false });
        try {
            await api.post(`/projects/${id}/members`, { email: inviteEmail });
            setInviteStatus({ loading: false, message: 'User invited successfully!', error: false });
            setInviteEmail('');
            setTimeout(() => {
                setIsInviteModalOpen(false);
                setInviteStatus({ loading: false, message: '', error: false });
            }, 2000);
        } catch (err) {
            setInviteStatus({
                loading: false,
                message: err.response?.data?.message || 'Error inviting member',
                error: true
            });
        }
    };

    const TaskCard = ({ task }) => (
        <div
            onClick={() => handleTaskClick(task)}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.priority === 'high' ? 'bg-red-50 text-red-600' :
                    task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                    }`}>
                    {task.priority}
                </span>
                <button
                    onClick={(e) => deleteTask(e, task.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
            <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                {task.status !== 'todo' && (
                    <button onClick={(e) => updateTaskStatus(e, task.id, 'todo')} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-gray-600 font-bold transition-colors">To Do</button>
                )}
                {task.status !== 'in-progress' && (
                    <button onClick={(e) => updateTaskStatus(e, task.id, 'in-progress')} className="text-[10px] bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 text-indigo-600 font-bold transition-colors">In Progress</button>
                )}
                {task.status !== 'done' && (
                    <button onClick={(e) => updateTaskStatus(e, task.id, 'done')} className="text-[10px] bg-green-50 px-2 py-1 rounded hover:bg-green-100 text-green-600 font-bold transition-colors">Done</button>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                            {task.assignee_name?.[0] || '?'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium">{new Date(task.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );

    const Column = ({ title, status, color }) => (
        <div className="flex flex-col w-full min-w-[300px] h-full">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm py-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
                    <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">{title}</h3>
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                        {tasks.filter(t => t.status === status).length}
                    </span>
                </div>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pb-10 min-h-[500px]">
                {tasks.filter(t => t.status === status).map(task => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    );

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-extrabold text-gray-900">{project?.name}</h1>
                                <p className="text-xs text-gray-500 font-medium">Project Board</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Invite Member
                            </button>
                            <button
                                onClick={() => setIsTaskModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Board Area */}
            <main className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-6 h-full max-w-full min-w-max mx-auto">
                    <Column title="To Do" status="todo" color="bg-gray-400" />
                    <Column title="In Progress" status="in-progress" color="bg-indigo-500" />
                    <Column title="Done" status="done" color="bg-green-500" />
                </div>
            </main>

            {/* New Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Add New Task</h2>
                            <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600"><Plus className="h-6 w-6 rotate-45" /></button>
                        </div>
                        <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                    placeholder="What needs to be done?"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all h-24 resize-none text-sm leading-relaxed"
                                    placeholder="Provide some details..."
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Priority</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium appearance-none"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all mt-4"
                            >
                                Create Task
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${selectedTask.priority === 'high' ? 'bg-red-50 text-red-600' :
                                        selectedTask.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                        }`}>
                                        {selectedTask.priority} Priority
                                    </span>
                                    <span className="text-gray-300 text-xl font-light">/</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedTask.status.replace('-', ' ')}</span>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedTask.title}</h2>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all">
                                <Plus className="h-6 w-6 rotate-45" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    {selectedTask.description || "No description provided for this task."}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    Discussion
                                </h3>

                                <div className="space-y-6 mb-8">
                                    {comments.length > 0 ? comments.map(comment => (
                                        <div key={comment.id} className="flex gap-4 group">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-black">
                                                {comment.user_name[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">{comment.user_name}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{new Date(comment.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 text-sm italic">No comments yet. Start the conversation!</p>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleAddComment} className="relative">
                                    <textarea
                                        className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-sm h-32 resize-none shadow-sm placeholder:text-gray-300"
                                        placeholder="Write a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="absolute bottom-4 right-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-xs"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Member Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Invite Member</h2>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600"><Plus className="h-6 w-6 rotate-45" /></button>
                        </div>
                        <form onSubmit={handleInviteMember} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">User Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                    placeholder="Enter user's email address"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            {inviteStatus.message && (
                                <p className={`text-sm font-bold ${inviteStatus.error ? 'text-red-500' : 'text-green-500'}`}>
                                    {inviteStatus.message}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={inviteStatus.loading}
                                className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all mt-4 disabled:bg-indigo-400"
                            >
                                {inviteStatus.loading ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectBoard;
