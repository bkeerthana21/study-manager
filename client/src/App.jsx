import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Board from './pages/Board.jsx';
import Timer from './pages/Timer.jsx';
import Resource, { CONFIG } from './pages/Resource.jsx';

const ICONS = { subjects: '📚', tasks: '✅', sessions: '⏱️', notes: '📝', exams: '🎯' };

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  const onAuth = ({ token, user }) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); setUser(user); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  if (!user) return <Login onAuth={onAuth} />;
  const others = Object.entries(CONFIG).filter(([k]) => k !== 'tasks');
  return (
    <div className="shell">
      <nav className="side">
        <h1>Study Manager</h1>
        <NavLink to="/" end>🏠 Dashboard</NavLink>
        <NavLink to="/tasks">{ICONS.tasks} Tasks</NavLink>
        <NavLink to="/timer">🍅 Focus timer</NavLink>
        {others.map(([k, c]) => <NavLink key={k} to={'/' + k}>{ICONS[k]} {c.title}</NavLink>)}
        <div className="who">
          <button className="link" onClick={() => setDark(!dark)}>{dark ? 'Switch to light mode' : 'Switch to dark mode'}</button>
          Signed in as {user.name}<button className="link" onClick={logout}>Log out</button>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Board />} />
          <Route path="/timer" element={<Timer />} />
          {others.map(([k]) => <Route key={k} path={'/' + k} element={<Resource name={k} />} />)}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
