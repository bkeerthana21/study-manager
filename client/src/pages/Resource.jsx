import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

// One config drives every CRUD page: subjects, tasks, sessions, notes, exams.
const S = { k: 'subject', l: 'Subject', t: 'subject' };
export const CONFIG = {
  subjects: { cards: 1, title: 'Subjects', fields: [{ k: 'name', l: 'Name', req: 1 }, { k: 'teacher', l: 'Teacher' },
    { k: 'targetGrade', l: 'Target grade' }, { k: 'color', l: 'Color', t: 'color', def: '#0b7a75' }] },
  tasks: { title: 'Tasks', fields: [{ k: 'title', l: 'Title', req: 1 }, S, { k: 'dueDate', l: 'Due date', t: 'date' },
    { k: 'priority', l: 'Priority', t: 'select', opts: ['low', 'medium', 'high'], def: 'medium' },
    { k: 'status', l: 'Status', t: 'select', opts: ['pending', 'in-progress', 'done'], def: 'pending' },
    { k: 'description', l: 'Description', t: 'textarea' }] },
  sessions: { title: 'Study sessions', fields: [S, { k: 'duration', l: 'Minutes studied', t: 'number', req: 1 },
    { k: 'date', l: 'Date', t: 'date', def: new Date().toISOString().slice(0, 10) }, { k: 'notes', l: 'Notes' }] },
  notes: { cards: 1, title: 'Notes', fields: [{ k: 'title', l: 'Title', req: 1 }, S, { k: 'tags', l: 'Tags (comma separated)', t: 'tags' },
    { k: 'content', l: 'Content', t: 'textarea' }] },
  exams: { cards: 1, title: 'Exams', fields: [{ k: 'title', l: 'Title', req: 1 }, S, { k: 'date', l: 'Exam date', t: 'date', req: 1 },
    { k: 'syllabus', l: 'Syllabus', t: 'textarea' }] },
};

const show = (row, f) => {
  const v = row[f.k];
  if (f.t === 'subject') return v?.name || '-';
  if (f.t === 'date') return v ? new Date(v).toLocaleDateString() : '-';
  if (f.t === 'tags') return (v || []).join(', ') || '-';
  if (f.t === 'color') return <span className="dot" style={{ background: v }} />;
  return v ?? '-';
};

export default function Resource({ name }) {
  const cfg = CONFIG[name];
  const blank = () => Object.fromEntries(cfg.fields.map(f => [f.k, f.def ?? '']));
  const [rows, setRows] = useState([]), [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(blank()), [editing, setEditing] = useState(null), [err, setErr] = useState('');

  const [q, setQ] = useState('');
  const shown = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const load = async () => {
    setRows((await api.get('/' + name)).data);
    if (cfg.fields.some(f => f.t === 'subject')) setSubjects((await api.get('/subjects')).data);
  };
  useEffect(() => { setForm(blank()); setEditing(null); setErr(''); load().catch(e => setErr(errMsg(e))); }, [name]);

  const submit = async e => {
    e.preventDefault(); setErr('');
    const body = { ...form };
    cfg.fields.filter(f => f.t === 'tags').forEach(f => { body[f.k] = form[f.k].split(',').map(s => s.trim()).filter(Boolean); });
    try {
      editing ? await api.put(`/${name}/${editing}`, body) : await api.post('/' + name, body);
      setForm(blank()); setEditing(null); load();
    } catch (x) { setErr(errMsg(x)); }
  };
  const edit = row => {
    setEditing(row._id);
    setForm(Object.fromEntries(cfg.fields.map(f => {
      let v = row[f.k];
      if (f.t === 'subject') v = v?._id || '';
      if (f.t === 'date') v = v ? v.slice(0, 10) : '';
      if (f.t === 'tags') v = (v || []).join(', ');
      return [f.k, v ?? ''];
    })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async id => { if (confirm('Delete this item?')) { await api.delete(`/${name}/${id}`); load(); } };
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const input = f => {
    const p = { value: form[f.k], onChange: set(f.k), required: !!f.req };
    if (f.t === 'textarea') return <textarea rows={3} {...p} />;
    if (f.t === 'select') return <select {...p}>{f.opts.map(o => <option key={o}>{o}</option>)}</select>;
    if (f.t === 'subject') return <select {...p}><option value="">No subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select>;
    return <input type={f.t === 'tags' ? 'text' : f.t || 'text'} min={f.t === 'number' ? 1 : undefined} {...p} />;
  };

  return (
    <>
      <h2>{cfg.title}</h2>
      <form className="panel grid" onSubmit={submit}>
        {cfg.fields.map(f => <label key={f.k} className={f.t === 'textarea' ? 'wide' : ''}>{f.l}{input(f)}</label>)}
        {err && <p className="err wide">{err}</p>}
        <div className="wide">
          <button className="btn">{editing ? 'Save changes' : 'Add'}</button>
          {editing && <button type="button" className="link" onClick={() => { setEditing(null); setForm(blank()); }}>Cancel</button>}
        </div>
      </form>
      {rows.length > 3 && <input className="search" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />}
      {cfg.cards && shown.length ? <Cards name={name} rows={shown} onEdit={edit} onDelete={remove} /> : rows.length === 0 ? <p className="empty">Nothing here yet. Use the form above to add your first entry.</p> : (
        <div className="scroll"><table>
          <thead><tr>{cfg.fields.filter(f => f.t !== 'textarea').map(f => <th key={f.k}>{f.l}</th>)}<th /></tr></thead>
          <tbody>{shown.map(r => (
            <tr key={r._id}>
              {cfg.fields.filter(f => f.t !== 'textarea').map(f => <td key={f.k}>{show(r, f)}</td>)}
              <td className="acts"><button className="link" onClick={() => edit(r)}>Edit</button>
                <button className="link danger" onClick={() => remove(r._id)}>Delete</button></td>
            </tr>))}</tbody>
        </table></div>
      )}
    </>
  );
}

function Cards({ name, rows, onEdit, onDelete }) {
  return (
    <div className="cards">{rows.map(r => {
      const left = name === 'exams' ? Math.ceil((new Date(r.date) - Date.now()) / 864e5) : null;
      return (
        <div key={r._id} className={'card' + (left !== null && left <= 7 ? ' soon' : '')} style={name === 'subjects' ? { borderTopColor: r.color } : undefined}>
          <h3>{r.name || r.title}</h3>
          {name === 'subjects' && <p>{r.teacher || 'No teacher added'}{r.targetGrade ? `, target ${r.targetGrade}` : ''}</p>}
          {name === 'notes' && <><p className="clip">{r.content}</p><p className="empty">{r.subject?.name}</p>
            <div>{(r.tags || []).map(t => <span className="tag" key={t}>{t}</span>)}</div></>}
          {name === 'exams' && <><p className="big">{left < 0 ? 'Finished' : left === 0 ? 'Today' : left + ' days left'}</p>
            <p className="empty">{r.subject?.name} on {new Date(r.date).toLocaleDateString()}</p></>}
          <div><button className="link" onClick={() => onEdit(r)}>Edit</button><button className="link danger" onClick={() => onDelete(r._id)}>Delete</button></div>
        </div>);
    })}</div>);
}
