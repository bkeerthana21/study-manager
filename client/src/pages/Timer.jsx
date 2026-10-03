import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Timer() {
  const [mins, setMins] = useState(25), [left, setLeft] = useState(25 * 60), [run, setRun] = useState(false);
  const [subject, setSubject] = useState(''), [subjects, setSubjects] = useState([]), [msg, setMsg] = useState('');
  useEffect(() => { api.get('/subjects').then(r => setSubjects(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (!run) return; const id = setInterval(() => setLeft(l => l - 1), 1000); return () => clearInterval(id); }, [run]);
  useEffect(() => { if (run && left <= 0) { setRun(false); save(mins); } }, [left]);
  const save = async m => {
    try { await api.post('/sessions', { subject, duration: m, date: new Date().toISOString().slice(0, 10) }); setMsg(`Saved a ${m} minute study session.`); }
    catch (e) { setMsg(errMsg(e)); }
  };
  const reset = m => { setRun(false); setMins(m); setLeft(m * 60); };
  const done = Math.max(1, Math.round((mins * 60 - left) / 60));
  const mm = String(Math.floor(Math.max(left, 0) / 60)).padStart(2, '0'), ss = String(Math.max(left, 0) % 60).padStart(2, '0');
  return (
    <>
      <h2>Focus timer</h2>
      <div className="panel timer">
        <div className="clock">{mm}:{ss}</div>
        <label>Subject<select value={subject} onChange={e => setSubject(e.target.value)}><option value="">No subject</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></label>
        <div className="row">{[15, 25, 45, 60].map(m => <button key={m} className={'chip' + (mins === m ? ' on' : '')} onClick={() => reset(m)}>{m} min</button>)}</div>
        <div className="row">
          <button className="btn" onClick={() => { setMsg(''); setRun(!run); }}>{run ? 'Pause' : left === mins * 60 ? 'Start' : 'Resume'}</button>
          <button className="link" onClick={() => reset(mins)}>Reset</button>
          {left < mins * 60 && left > 0 && <button className="link" onClick={() => { setRun(false); save(done); reset(mins); }}>Finish early and save {done} min</button>}
        </div>
        {msg && <p className="ok">{msg}</p>}
      </div>
    </>
  );
}
