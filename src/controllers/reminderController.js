const Reminder = require('../models/reminder');

// Get all reminders
exports.getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.getAll();
    res.json(reminders);
  } catch (error) {
    console.error('Error getting reminders:', error);
    res.status(500).json({ error: 'Failed to get reminders' });
  }
};

// Get pending reminders
exports.getPendingReminders = async (req, res) => {
  try {
    const reminders = await Reminder.getPending();
    res.json(reminders);
  } catch (error) {
    console.error('Error getting pending reminders:', error);
    res.status(500).json({ error: 'Failed to get pending reminders' });
  }
};

// Create new reminder
exports.createReminder = async (req, res) => {
  try {
    const result = await Reminder.create(req.body);
    res.status(201).json({ id: result.id, message: 'Reminder created successfully' });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
};

// Update reminder status
exports.updateReminderStatus = async (req, res) => {
  try {
    await Reminder.updateStatus(req.params.id, req.body.status);
    res.json({ message: 'Reminder status updated successfully' });
  } catch (error) {
    console.error('Error updating reminder status:', error);
    res.status(500).json({ error: 'Failed to update reminder status' });
  }
};

// Delete reminder
exports.deleteReminder = async (req, res) => {
  try {
    await Reminder.delete(req.params.id);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
};