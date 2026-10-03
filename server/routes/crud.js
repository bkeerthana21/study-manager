// Generic CRUD router: every record is scoped to the logged-in user.
const express = require('express');
const wrap = fn => (req, res, next) => fn(req, res).catch(next);
const clean = body => { const b = { ...body }; delete b.user; for (const k in b) if (b[k] === '') delete b[k]; return b; };
module.exports = Model => {
  const r = express.Router();
  const hasSubject = !!Model.schema.path('subject');
  r.get('/', wrap(async (req, res) => {
    const q = { user: req.user.id };
    if (req.query.status) q.status = req.query.status;
    if (req.query.subject) q.subject = req.query.subject;
    let find = Model.find(q).sort('-createdAt');
    if (hasSubject) find = find.populate('subject', 'name color');
    res.json(await find);
  }));
  r.post('/', wrap(async (req, res) => res.status(201).json(await Model.create({ ...clean(req.body), user: req.user.id }))));
  r.put('/:id', wrap(async (req, res) => {
    const doc = await Model.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, clean(req.body), { new: true, runValidators: true });
    doc ? res.json(doc) : res.status(404).json({ message: 'Not found' });
  }));
  r.delete('/:id', wrap(async (req, res) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    doc ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Not found' });
  }));
  return r;
};
