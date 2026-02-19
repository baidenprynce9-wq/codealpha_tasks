const pool = require('../db');

exports.createTask = async (req, res) => {
    try {
        const { project_id, title, description, priority } = req.body;

        // Verify user is member of project
        const memberCheck = await pool.query(
            'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
            [project_id, req.user.userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO tasks (project_id, title, description, priority) VALUES ($1, $2, $3, $4) RETURNING *',
            [project_id, title, description, priority || 'medium']
        );

        const task = result.rows[0];
        req.io.to(`project_${project_id}`).emit('task_created', task);

        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Verify membership
        const memberCheck = await pool.query(
            'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
            [projectId, req.user.userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.project_id = $1 ORDER BY t.created_at DESC',
            [projectId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, assignee_id } = req.body;

        // Verify task existence and user membership via project
        const taskCheck = await pool.query(
            `SELECT t.* FROM tasks t 
             JOIN project_members pm ON t.project_id = pm.project_id 
             WHERE t.id = $1 AND pm.user_id = $2`,
            [id, req.user.userId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            `UPDATE tasks 
             SET title = COALESCE($1, title), 
                 description = COALESCE($2, description), 
                 status = COALESCE($3, status), 
                 priority = COALESCE($4, priority), 
                 assignee_id = COALESCE($5, assignee_id) 
             WHERE id = $6 RETURNING *`,
            [title, description, status, priority, assignee_id, id]
        );

        const updatedTask = result.rows[0];
        req.io.to(`project_${updatedTask.project_id}`).emit('task_updated', updatedTask);

        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify membership
        const taskCheck = await pool.query(
            `SELECT t.* FROM tasks t 
             JOIN project_members pm ON t.project_id = pm.project_id 
             WHERE t.id = $1 AND pm.user_id = $2`,
            [id, req.user.userId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const task = taskCheck.rows[0];
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

        req.io.to(`project_${task.project_id}`).emit('task_deleted', id);

        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
