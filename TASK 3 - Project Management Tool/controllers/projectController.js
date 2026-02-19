const pool = require('../db');

exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const owner_id = req.user.userId;

        const result = await pool.query(
            'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
            [name, description, owner_id]
        );

        const project = result.rows[0];

        // Add owner as a member automatically
        await pool.query(
            'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
            [project.id, owner_id, 'owner']
        );

        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get projects where user is a member
        const result = await pool.query(
            `SELECT p.* FROM projects p 
             JOIN project_members pm ON p.id = pm.project_id 
             WHERE pm.user_id = $1`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT p.* FROM projects p 
             JOIN project_members pm ON p.id = pm.project_id 
             WHERE p.id = $1 AND pm.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Only owner can delete
        const checkOwner = await pool.query(
            'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
            [id, userId]
        );

        if (checkOwner.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role } = req.body;
        const ownerId = req.user.userId;

        // Check if requester is the owner
        const projectCheck = await pool.query(
            'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
            [id, ownerId]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Only project owners can invite members' });
        }

        // Find user by email
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const invitedUserId = userResult.rows[0].id;

        // Check if already a member
        const memberCheck = await pool.query(
            'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
            [id, invitedUserId]
        );

        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User is already a member of this project' });
        }

        // Add member
        await pool.query(
            'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
            [id, invitedUserId, role || 'member']
        );

        res.status(201).json({ message: 'Member added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

