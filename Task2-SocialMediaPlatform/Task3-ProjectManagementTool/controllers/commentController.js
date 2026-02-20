const pool = require('../db');

exports.addComment = async (req, res) => {
    try {
        const { task_id, content } = req.body;
        const user_id = req.user.userId;

        // Verify user can comment (has access to project)
        const taskCheck = await pool.query(
            `SELECT t.project_id FROM tasks t 
             JOIN project_members pm ON t.project_id = pm.project_id 
             WHERE t.id = $1 AND pm.user_id = $2`,
            [task_id, user_id]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [task_id, user_id, content]
        );

        const newComment = result.rows[0];
        // Fetch user name for display
        const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [user_id]);
        newComment.user_name = userRes.rows[0].name;

        req.io.to(`project_${taskCheck.rows[0].project_id}`).emit('comment_added', newComment);

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { taskId } = req.params;

        const result = await pool.query(
            `SELECT c.*, u.name as user_name FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.task_id = $1 ORDER BY c.created_at ASC`,
            [taskId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
