const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// GET all reminders
router.get('/', reminderController.getAllReminders);

// GET pending reminders
router.get('/pending', reminderController.getPendingReminders);

// POST create new reminder
router.post('/', reminderController.createReminder);

// PATCH update reminder status
router.patch('/:id/status', reminderController.updateReminderStatus);

// DELETE reminder
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;