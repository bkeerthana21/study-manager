import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api, { errMsg } from '../api';
const COLORS = ['#0b7a75', '#e0a100', '#c2410c', '#3b5bdb', '#7c3aed', '#64748b'];

const streakOf = sessions => {
  const days = new Set(sessions.map(s => new Date(s.date).toDateString()));
  const d = new Date(); let n = 0;
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
  return n;
};
function Ring({ pct }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" width="110" height="110">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${c * pct / 100} ${c}`} transform="rotate(-90 50 50)" />
      <text x="50" y="56" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink)">{pct}%</text>
    </svg>);
}

export default function Dashboard() {
  const [d, setD] = useState(null), [tasks, setTasks] = useState([]), [streak, setStreak] = useState(0), [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([api.get('/stats/dashboard'), api.get('/tasks'), api.get('/sessions')])
      .then(([a, b, c]) => { setD(a.data); setTasks(b.data); setStreak(streakOf(c.data)); }).catch(e => setErr(errMsg(e)));
  }, []);
  if (err) return <p className="err">{err}</p>;
  if (!d) return <p>Loading your dashboard...</p>;
  const h = new Date().getHours(), name = (JSON.parse(localStorage.getItem('user') || '{}').name || '').split(' ')[0];
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const today = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) <= end);
  return (
    <>
      <div className="hero">
        <div><h2>{h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'}, {name}</h2>
          <p className="empty">{d.pending} pending tasks, {d.weekHours} hours studied this week.</p></div>
        <div className="streak"><b>{streak}</b><span>{streak === 1 ? 'day streak' : 'day streak'}</span></div>
      </div>
      <div className="charts">
        <div className="panel ringbox"><Ring pct={d.completion} /><div><h3>Tasks completed</h3><p className="empty">{d.dueToday} due today</p></div></div>
        <div className="panel"><h3>Due today and overdue</h3>
          {today.length === 0 ? <p className="empty">Nothing due. Enjoy the free time or add a task.</p> :
            today.slice(0, 5).map(t => <p key={t._id} className="exam"><span>{t.title}</span><b>{t.subject?.name || ''}</b></p>)}</div>
      </div>
      <div className="charts">
        <div className="panel"><h3>Hours studied per day</h3>
          <ResponsiveContainer width="100%" height={240}><BarChart data={d.week}>
            <XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="hours" fill="#0b7a75" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="panel"><h3>Time by subject (hours)</h3>
          {d.bySubject.length === 0 ? <p className="empty">Log a study session to see your split.</p> :
            <ResponsiveContainer width="100%" height={240}><PieChart>
              <Pie data={d.bySubject} dataKey="hours" nameKey="name" outerRadius={85} label>
                {d.bySubject.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>}</div>
      </div>
      <div className="panel"><h3>Upcoming exams</h3>
        {d.exams.length === 0 ? <p className="empty">No upcoming exams. Add one on the Exams page.</p> :
          d.exams.map(e => <p key={e._id} className="exam"><span>{e.title}{e.subject ? ` (${e.subject.name})` : ''}</span>
            <b>{Math.max(0, Math.ceil((new Date(e.date) - Date.now()) / 864e5))} days left</b></p>)}</div>
    </>
  );
}
