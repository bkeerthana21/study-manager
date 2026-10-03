import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
const COLS = [['pending', 'To do'], ['in-progress', 'In progress'], ['done', 'Done']];

export default function Board() {
  const [tasks, setTasks] = useState([]), [subjects, setSubjects] = useState([]), [err, setErr] = useState('');
  const [f, setF] = useState({ title: '', subject: '', dueDate: '', priority: 'medium' });
  const load = async () => { setTasks((await api.get('/tasks')).data); setSubjects((await api.get('/subjects')).data); };
  useEffect(() => { load().catch(e => setErr(errMsg(e))); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const add = async e => {
    e.preventDefault(); setErr('');
    try { await api.post('/tasks', f); setF({ ...f, title: '', dueDate: '' }); load(); } catch (x) { setErr(errMsg(x)); }
  };
  const move = async (id, status) => {
    setTasks(tasks.map(t => t._id === id ? { ...t, status } : t));
    await api.put('/tasks/' + id, { status }).catch(load);
  };
  const del = async id => { await api.delete('/tasks/' + id); load(); };
  return (
    <>
      <h2>Tasks</h2>
      <form className="panel grid" onSubmit={add}>
        <label>Task<input value={f.title} onChange={set('title')} required /></label>
        <label>Subject<select value={f.subject} onChange={set('subject')}><option value="">No subject</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></label>
        <label>Due date<input type="date" value={f.dueDate} onChange={set('dueDate')} /></label>
        <label>Priority<select value={f.priority} onChange={set('priority')}><option>low</option><option>medium</option><option>high</option></select></label>
        {err && <p className="err wide">{err}</p>}
        <div className="wide"><button className="btn">Add task</button></div>
      </form>
      <p className="empty">Drag a task to another column, or use its status menu.</p>
      <div className="board">
        {COLS.map(([s, label]) => {
          const list = tasks.filter(t => t.status === s);
          return (
            <div key={s} className="col" onDragOver={e => e.preventDefault()} onDrop={e => move(e.dataTransfer.getData('id'), s)}>
              <h3>{label} ({list.length})</h3>
              {list.map(t => (
                <div key={t._id} className={'task ' + t.priority} draggable onDragStart={e => e.dataTransfer.setData('id', t._id)}>
                  <b>{t.title}</b>
                  <span>{t.subject?.name || 'No subject'}{t.dueDate ? ', due ' + new Date(t.dueDate).toLocaleDateString() : ''}</span>
                  <div className="row">
                    <select value={t.status} onChange={e => move(t._id, e.target.value)}>{COLS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                    <button className="link danger" onClick={() => del(t._id)}>Delete</button>
                  </div>
                </div>))}
            </div>);
        })}
      </div>
    </>
  );
}
