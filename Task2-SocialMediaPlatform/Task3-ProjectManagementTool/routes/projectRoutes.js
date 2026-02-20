const express = require('express');
const { createProject, getProjects, getProject, deleteProject, addMember } = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);

module.exports = router;
