import { useState } from 'react';
import api, { errMsg } from '../api';
export default function Login({ onAuth }) {
  const [signup, setSignup] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async e => {
    e.preventDefault(); setErr('');
    try { onAuth((await api.post(signup ? '/auth/register' : '/auth/login', f)).data); } catch (x) { setErr(errMsg(x)); }
  };
  const set = k => e => setF({ ...f, [k]: e.target.value });
  return (
    <div className="auth">
      <form onSubmit={submit} className="panel">
        <h1>{signup ? 'Create your account' : 'Log in to Study Manager'}</h1>
        {signup && <label>Name<input value={f.name} onChange={set('name')} required /></label>}
        <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Password<input type="password" minLength={6} value={f.password} onChange={set('password')} required /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn">{signup ? 'Create account' : 'Log in'}</button>
        <button type="button" className="link" onClick={() => setSignup(!signup)}>
          {signup ? 'I already have an account' : 'Create a new account'}</button>
      </form>
    </div>
  );
}
