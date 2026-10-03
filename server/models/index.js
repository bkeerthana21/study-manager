const { Schema, model } = require('mongoose');
const ref = (to, req) => ({ type: Schema.Types.ObjectId, ref: to, required: !!req });
const owned = { user: { ...ref('User', true), index: true } };
const opts = { timestamps: true };
exports.User = model('User', new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true } }, opts));
exports.Subject = model('Subject', new Schema({ ...owned, name: { type: String, required: true },
  color: { type: String, default: '#0b7a75' }, teacher: String, targetGrade: String }, opts));
exports.Task = model('Task', new Schema({ ...owned, subject: ref('Subject'), title: { type: String, required: true },
  description: String, dueDate: Date, priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' } }, opts));
exports.StudySession = model('StudySession', new Schema({ ...owned, subject: ref('Subject'),
  duration: { type: Number, required: true, min: 1 }, date: { type: Date, default: Date.now }, notes: String }, opts));
exports.Note = model('Note', new Schema({ ...owned, subject: ref('Subject'), title: { type: String, required: true },
  content: String, tags: [String] }, opts));
exports.Exam = model('Exam', new Schema({ ...owned, subject: ref('Subject'), title: { type: String, required: true },
  date: { type: Date, required: true }, syllabus: String }, opts));
