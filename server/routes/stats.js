const r = require('express').Router(), mongoose = require('mongoose');
const { StudySession, Task, Exam } = require('../models');
r.get('/dashboard', async (req, res, next) => { try {
  const uid = new mongoose.Types.ObjectId(req.user.id);
  const since = new Date(); since.setHours(0, 0, 0, 0); since.setDate(since.getDate() - 6);
  const [sessions, bySubject, tasks, exams] = await Promise.all([
    StudySession.find({ user: uid, date: { $gte: since } }),
    StudySession.aggregate([{ $match: { user: uid } }, { $group: { _id: '$subject', minutes: { $sum: '$duration' } } },
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 's' } },
      { $project: { minutes: 1, name: { $ifNull: [{ $arrayElemAt: ['$s.name', 0] }, 'Other'] } } }]),
    Task.find({ user: uid }),
    Exam.find({ user: uid, date: { $gte: new Date() } }).sort('date').limit(5).populate('subject', 'name'),
  ]);
  const week = [...Array(7)].map((_, i) => {
    const d = new Date(since); d.setDate(d.getDate() + i);
    const mins = sessions.filter(s => s.date.toDateString() === d.toDateString()).reduce((a, s) => a + s.duration, 0);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), hours: +(mins / 60).toFixed(1) };
  });
  const today = new Date().toDateString(), done = tasks.filter(t => t.status === 'done').length;
  res.json({
    pending: tasks.length - done,
    dueToday: tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate.toDateString() === today).length,
    completion: tasks.length ? Math.round(done / tasks.length * 100) : 0,
    weekHours: +(week.reduce((a, d) => a + d.hours, 0)).toFixed(1),
    week, bySubject: bySubject.map(s => ({ name: s.name, hours: +(s.minutes / 60).toFixed(1) })), exams });
} catch (e) { next(e); } });
module.exports = r;
