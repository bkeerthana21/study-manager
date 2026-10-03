require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose');
const auth = require('./middleware/auth'), crud = require('./routes/crud'), M = require('./models');
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stats', auth, require('./routes/stats'));
[['subjects', 'Subject'], ['tasks', 'Task'], ['sessions', 'StudySession'], ['notes', 'Note'], ['exams', 'Exam']]
  .forEach(([path, model]) => app.use('/api/' + path, auth, crud(M[model])));
app.use((err, req, res, next) =>
  res.status(['ValidationError', 'CastError'].includes(err.name) ? 400 : 500).json({ message: err.message }));
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('API running')))
  .catch(e => { console.error(e.message); process.exit(1); });
