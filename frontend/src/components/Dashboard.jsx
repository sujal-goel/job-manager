import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser, useAuth, UserButton, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_BACKEND_URL;

const statusColors = {
  Applied:   { bg: '#1e3a5f', text: '#60a5fa', dot: '#3b82f6' },
  Interview: { bg: '#3b2a1a', text: '#fbbf24', dot: '#f59e0b' },
  Selected:  { bg: '#0f2e1a', text: '#34d399', dot: '#10b981' },
  Rejected:  { bg: '#2e1a1a', text: '#f87171', dot: '#ef4444' },
};

const emptyForm = { company: '', role: '', jobLink: '', status: 'Applied', applicationDate: '', followUpDate: '', notes: '', resumeUrl: '' };

export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const { getToken }       = useAuth();
  const { signOut }        = useClerk();
  const navigate           = useNavigate();

  const [jobs,        setJobs]        = useState([]);
  const [analytics,   setAnalytics]   = useState(null);
  const [formData,    setFormData]    = useState(emptyForm);
  const [editingId,   setEditingId]   = useState(null);
  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState('All');
  const [activeTab,   setActiveTab]   = useState('list'); // 'list' | 'kanban' | 'analytics' | 'admin'
  const [loading,     setLoading]     = useState(true);
  const [formOpen,    setFormOpen]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [adminData,   setAdminData]   = useState({ jobs: [], stats: null });
  const [isAdmin,     setIsAdmin]     = useState(false);

  /* ── Auth Guard ── */
  useEffect(() => {
    if (isLoaded && !user) navigate('/login');
  }, [isLoaded, user, navigate]);

  /* ── Data Fetching ── */
  const headers = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    if (!API) {
      console.error('Missing VITE_BACKEND_URL in frontend environment');
      setLoading(false);
      return;
    }
    try {
      const h = await headers();
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus;

      const [jobsRes, analyticsRes] = await Promise.all([
        axios.get(API,               { headers: h, params }),
        axios.get(`${API}/analytics`, { headers: h }),
      ]);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setAnalytics(analyticsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, headers, search, filterStatus]);

  const fetchAdmin = useCallback(async () => {
    if (!isAdmin) return;
    if (!API) return;
    try {
      const h = await headers();
      const [jobsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/all`,   { headers: h }),
        axios.get(`${API}/admin/stats`, { headers: h }),
      ]);
      setAdminData({ jobs: Array.isArray(jobsRes.data) ? jobsRes.data : [], stats: statsRes.data });
    } catch (e) {
      console.error('Admin fetch error:', e);
    }
  }, [isAdmin, headers]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchAdmin(); }, [fetchAdmin]);

  /* ── Form Handlers ── */
  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const h = await headers();
      const payload = { ...formData, userEmail: user.primaryEmailAddress?.emailAddress };
      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload, { headers: h });
      } else {
        await axios.post(API, payload, { headers: h });
      }
      setFormData(emptyForm);
      setEditingId(null);
      setFormOpen(false);
      fetchAll();
    } catch (e) {
      alert('Error saving job: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = job => {
    setFormData({
      company:         job.company,
      role:            job.role,
      jobLink:         job.jobLink || '',
      status:          job.status,
      applicationDate: job.applicationDate ? job.applicationDate.slice(0, 10) : '',
      followUpDate:    job.followUpDate    ? job.followUpDate.slice(0, 10)    : '',
      notes:           job.notes || '',
      resumeUrl:       job.resumeUrl || '',
    });
    setEditingId(job._id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this application?')) return;
    const h = await headers();
    await axios.delete(`${API}/${id}`, { headers: h });
    fetchAll();
  };

  const updateStatus = async (id, status) => {
    const h = await headers();
    await axios.put(`${API}/${id}`, { status }, { headers: h });
    fetchAll();
  };

  const cancelForm = () => { setFormData(emptyForm); setEditingId(null); setFormOpen(false); };

  if (!isLoaded || loading) return (
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6366f1', fontSize: '1.2rem' }}>Loading your workspace…</div>
    </div>
  );

  const reminders = Array.isArray(analytics?.overdueFollowUps) ? analytics.overdueFollowUps : [];
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const safeAdminJobs = Array.isArray(adminData.jobs) ? adminData.jobs : [];

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: 'white', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: '#0d1117', borderBottom: '1px solid #1e293b', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ JobManager</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setIsAdmin(!isAdmin)} 
            style={{ padding: '0.4rem 0.8rem', background: isAdmin ? '#b91c1c' : '#1e293b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>
            {isAdmin ? '🔴 Admin Mode' : '🛠️ Enter Admin'}
          </button>
          <button onClick={() => alert('🚀 WORKFLOW GUIDE (for Viva):\n1. User Logs in (Clerk Auth)\n2. Add Application (MongoDB CRUD)\n3. Analytics tracks progress (Data Aggregation)\n4. System sends reminders (Follow-up logic)\n5. Admin monitors usage (Platform governance)')}
            style={{ padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>
            📖 Guide
          </button>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Hi, <b style={{ color: '#e2e8f0' }}>{user.username || user.firstName}</b></span>
          <UserButton afterSignOutUrl="/" />
          <button onClick={() => signOut().then(() => navigate('/'))}
            style={{ padding: '0.45rem 1rem', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* ── Reminder Alerts ── */}
        {reminders.length > 0 && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '700', color: '#fbbf24', marginBottom: '0.5rem' }}>🔔 Follow-up Reminders Due!</div>
            {reminders.map(r => (
              <div key={r.id} style={{ color: '#fcd34d', fontSize: '0.9rem' }}>
                → {r.company} – {r.role} (was due {new Date(r.followUpDate).toLocaleDateString()})
              </div>
            ))}
          </div>
        )}

        {/* ── Stats Cards ── */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total',       value: analytics.total,         color: '#6366f1' },
              { label: 'Applied',     value: analytics.applied,       color: '#3b82f6' },
              { label: 'Interviews',  value: analytics.interview,     color: '#f59e0b' },
              { label: 'Selected',    value: analytics.selected,      color: '#10b981' },
              { label: 'Rejected',    value: analytics.rejected,      color: '#ef4444' },
              { label: 'Success Rate',value: analytics.successRate+'%',color: '#06b6d4' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#0d1117', border: `1px solid ${color}25`, borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '800', color }}>{value}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Action Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['list', 'kanban', 'analytics', ...(isAdmin ? ['admin'] : [])].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', background: activeTab === t ? '#6366f1' : '#1e293b', color: activeTab === t ? 'white' : '#94a3b8', textTransform: 'capitalize' }}>
                {t === 'list' ? '📋 List' : t === 'kanban' ? '🧱 Kanban' : t === 'analytics' ? '📊 Analytics' : '🛡️ Admin'}
              </button>
            ))}
          </div>
          <button onClick={() => { cancelForm(); setFormOpen(p => !p); }}
            style={{ padding: '0.6rem 1.4rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
            {formOpen && !editingId ? '✕ Cancel' : '+ Add Application'}
          </button>
        </div>

        {/* ── Add / Edit Form ── */}
        {formOpen && (
          <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700', color: '#e2e8f0' }}>{editingId ? '✎ Edit Application' : '➕ New Application'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {[
                  { name: 'company', label: 'Company Name *', type: 'text', required: true },
                  { name: 'role',    label: 'Job Role *',     type: 'text', required: true },
                  { name: 'jobLink', label: 'Job Posting URL',type: 'url',  required: false },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>{f.label}</label>
                    <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange} required={f.required}
                      style={{ width: '100%', padding: '0.7rem', background: '#080c14', border: '1px solid #1e293b', borderRadius: '8px', color: 'white', outline: 'none' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}
                    style={{ width: '100%', padding: '0.7rem', background: '#080c14', border: '1px solid #1e293b', borderRadius: '8px', color: 'white' }}>
                    {['Applied', 'Interview', 'Selected', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>Date Applied</label>
                  <input type="date" name="applicationDate" value={formData.applicationDate} onChange={handleChange}
                    style={{ width: '100%', padding: '0.7rem', background: '#080c14', border: '1px solid #1e293b', borderRadius: '8px', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>🔔 Follow-up Reminder</label>
                  <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange}
                    style={{ width: '100%', padding: '0.7rem', background: '#080c14', border: '1px solid #1e293b', borderRadius: '8px', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>📎 Resume URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="url" name="resumeUrl" placeholder="https://drive.google.com/..." value={formData.resumeUrl} onChange={handleChange}
                      style={{ flex: 1, padding: '0.7rem', background: '#080c14', border: '1px solid #1e293b', borderRadius: '8px', color: 'white', outline: 'none' }} />
                    <button type="button" onClick={() => alert('Simulation: In a real app, this would open Cloudinary/Firebase file picker and set the URL.')}
                      style={{ padding: '0 1rem', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                      ⬆️ Upload
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>Notes</label>
                <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange}
                  style={{ width: '100%', padding: '0.7rem', background: '#080c14', border: '1px solid #1e293b', borderRadius: '8px', color: 'white', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving}
                  style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                  {saving ? 'Saving…' : editingId ? 'Update Application' : 'Save Application'}
                </button>
                <button type="button" onClick={cancelForm}
                  style={{ padding: '0.75rem 1.5rem', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── List Tab ── */}
        {activeTab === 'list' && (
          <>
            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input placeholder="🔍 Search by company…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '0.7rem 1rem', background: '#0d1117', border: '1px solid #1e293b', borderRadius: '8px', color: 'white', outline: 'none' }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '0.7rem 1rem', background: '#0d1117', border: '1px solid #1e293b', borderRadius: '8px', color: 'white' }}>
                {['All', 'Applied', 'Interview', 'Selected', 'Rejected'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Job Cards */}
            {safeJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#334155' }}>
                <div style={{ fontSize: '3rem' }}>📭</div>
                <p style={{ marginTop: '1rem' }}>No applications yet. Add your first one!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {safeJobs.map(job => {
                  const sc = statusColors[job.status] || statusColors.Applied;
                  return (
                    <div key={job._id} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#334155'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                          <h3 style={{ fontWeight: '700', fontSize: '1rem', color: '#e2e8f0' }}>{job.role}</h3>
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>at</span>
                          <span style={{ fontWeight: '600', color: '#a78bfa' }}>{job.company}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#475569', flexWrap: 'wrap' }}>
                          <span>📅 {new Date(job.applicationDate).toLocaleDateString()}</span>
                          {job.followUpDate && <span>🔔 Follow-up: {new Date(job.followUpDate).toLocaleDateString()}</span>}
                          {job.jobLink && <a href={job.jobLink} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>🔗 Link</a>}
                          {job.resumeUrl && <a href={job.resumeUrl} target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'none' }}>📎 Resume</a>}
                          {job.notes && <span title={job.notes}>📝 {job.notes.slice(0, 40)}{job.notes.length > 40 ? '…' : ''}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <select value={job.status} onChange={e => updateStatus(job._id, e.target.value)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '20px', border: 'none', background: sc.bg, color: sc.text, fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>
                          {['Applied', 'Interview', 'Selected', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => startEdit(job)}
                          style={{ padding: '0.4rem 0.9rem', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                          ✎ Edit
                        </button>
                        <button onClick={() => handleDelete(job._id)}
                          style={{ padding: '0.4rem 0.9rem', background: '#2e1a1a', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && analytics && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', color: '#e2e8f0', fontWeight: '700' }}>📊 Your Job Hunt Analytics</h3>
            {/* Progress Bars */}
            {[
              { label: 'Application → Interview Rate', value: analytics.interviewRate, color: '#f59e0b' },
              { label: 'Interview → Success (Offer) Rate', value: analytics.successRate, color: '#10b981' },
              { label: 'Rejection Rate', value: analytics.total > 0 ? Math.round((analytics.rejected / analytics.total) * 100) : 0, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{label}</span>
                  <span style={{ color, fontWeight: '700' }}>{value}%</span>
                </div>
                <div style={{ background: '#1e293b', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${value}%`, background: color, height: '100%', borderRadius: '100px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}

            {/* Status Breakdown */}
            <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.5rem', marginTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', color: '#94a3b8', fontWeight: '600' }}>Status Breakdown</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem' }}>
                {[
                  { label: 'Applied',    value: analytics.applied,   color: '#3b82f6' },
                  { label: 'Interview',  value: analytics.interview,  color: '#f59e0b' },
                  { label: 'Selected',   value: analytics.selected,   color: '#10b981' },
                  { label: 'Rejected',   value: analytics.rejected,   color: '#ef4444' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '1rem', background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '10px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color }}>{value}</div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice */}
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '1.5rem', marginTop: '1.5rem' }}>
              <h4 style={{ color: '#a78bfa', marginBottom: '0.75rem', fontWeight: '700' }}>💡 Strategy Tips</h4>
              {analytics.interviewRate < 20 && <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>→ Your interview rate is below 20%. Try tailoring your resume to each role.</p>}
              {analytics.interviewRate >= 20 && analytics.successRate < 30 && <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>→ You're getting interviews! Focus on interview preparation to boost your offer rate.</p>}
              {analytics.successRate >= 30 && <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>→ Excellent success rate! Keep applying consistently.</p>}
              {reminders.length > 0 && <p style={{ color: '#fcd34d' }}>→ You have {reminders.length} overdue follow-up(s). Consider sending a follow-up email!</p>}
            </div>
          </div>
        )}


        {/* ── Kanban Tab ── */}
        {activeTab === 'kanban' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {['Applied', 'Interview', 'Selected', 'Rejected'].map(status => {
              const sc = statusColors[status];
              const columnJobs = safeJobs.filter(j => j.status === status);
              return (
                <div key={status} style={{ background: '#0d1117', borderRadius: '16px', border: '1px solid #1e293b', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: `2px solid ${sc.dot}`, paddingBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: sc.text }}>{status}</h3>
                    <span style={{ background: sc.bg, color: sc.text, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>{columnJobs.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {columnJobs.map(job => (
                      <div key={job._id} style={{ background: '#080c14', border: '1px solid #1e293b', borderRadius: '10px', padding: '1rem', position: 'relative' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.25rem', color: '#e2e8f0' }}>{job.role}</div>
                        <div style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>{job.company}</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => startEdit(job)} style={{ flex: 1, padding: '0.35rem', background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                        </div>
                      </div>
                    ))}
                    {columnJobs.length === 0 && <div style={{ textAlign: 'center', color: '#1e293b', padding: '2rem 0', fontSize: '0.85rem' }}>Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Admin Tab ── */}
        {activeTab === 'admin' && isAdmin && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', color: '#ef4444', fontWeight: '800' }}>🛡️ System Administration</h3>
            
            {adminData.stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#0d1117', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3b82f6' }}>{adminData.stats.totalUsers}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Active Users</div>
                </div>
                <div style={{ background: '#0d1117', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>{adminData.stats.totalJobs}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Applications Tracked</div>
                </div>
              </div>
            )}

            <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead style={{ background: '#1e293b', color: '#94a3b8' }}>
                  <tr>
                    <th style={{ padding: '1rem' }}>User Email</th>
                    <th style={{ padding: '1rem' }}>Company</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Created At</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {safeAdminJobs.map(j => (
                    <tr key={j._id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '1rem', color: '#6366f1' }}>{j.userEmail || 'Unknown'}</td>
                      <td style={{ padding: '1rem' }}>{j.company}</td>
                      <td style={{ padding: '1rem' }}>{j.role}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: statusColors[j.status]?.bg, color: statusColors[j.status]?.text, fontSize: '0.7rem' }}>{j.status}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={async () => {
                          if (!window.confirm('Admin: Delete this user data?')) return;
                          const h = await headers();
                          await axios.delete(`${API}/admin/${j._id}`, { headers: h });
                          fetchAdmin();
                        }} style={{ padding: '0.3rem 0.6rem', background: '#2e1a1a', color: '#f87171', border: '1px solid #7f1d1d', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>
                          Delete Spam
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
        option { background: #0d1117; }
        select option { background: #0d1117 !important; }
        
        button:hover { transform: translateY(-1px); }
        button:active { transform: translateY(0); }
        
        tr:hover { background: #161b22; }
      `}</style>
    </div>
  );
}
