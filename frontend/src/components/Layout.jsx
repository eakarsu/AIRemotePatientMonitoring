import React from 'react';
import{NavLink,useLocation} from 'react-router-dom';
const navItems=[
{path:'/',icon:'📊',label:'Dashboard'},{section:'Patient Care'},
{path:'/patients',icon:'👥',label:'Patients'},{path:'/vitals',icon:'💓',label:'Vital Signs'},
{path:'/medications',icon:'💊',label:'Medications'},{path:'/care-plans',icon:'📋',label:'Care Plans'},
{section:'Operations'},{path:'/appointments',icon:'📅',label:'Appointments'},
{path:'/consultations',icon:'🩺',label:'Consultations'},{path:'/devices',icon:'📱',label:'Devices'},
{path:'/alerts',icon:'🔔',label:'Alerts'},{section:'Management'},
{path:'/reports',icon:'📈',label:'Reports'},{path:'/billing',icon:'💰',label:'Billing'},
{path:'/emergency',icon:'🚨',label:'Emergency'},{section:'AI Features'},
{path:'/ai-analytics',icon:'🤖',label:'AI Analytics'},
{path:'/simulator',icon:'🖥️',label:'Device Simulator'},
{path:'/shared-decision',icon:'🤝',label:'Shared Decision'},
{path:'/longitudinal-trajectory',icon:'📈',label:'Trajectory'},
{path:'/cost-aware-plan',icon:'💵',label:'Cost-Aware Plan'},
{path:'/caregiver-coaching',icon:'🫶',label:'Caregiver Coach'},
{path:'/custom-views',icon:'📉',label:'Patient Analytics'},
];
export default function Layout({children,user,onLogout}){
const location=useLocation();
const getTitle=()=>navItems.find(n=>n.path===location.pathname)?.label||'Dashboard';
return(<div className="app-layout">
<aside className="sidebar">
<div className="sidebar-header"><h2>RPM Platform</h2><p>AI Remote Patient Monitoring</p></div>
<nav className="sidebar-nav">
{navItems.map((item,i)=>{
if(item.section!==undefined&&!item.path)return<div key={i} className="sidebar-section">{item.section}</div>;
return<NavLink key={item.path} to={item.path} className={({isActive})=>isActive?'active':''} end={item.path==='/'}>
<span className="nav-icon">{item.icon}</span>{item.label}</NavLink>;
})}
<div className="sidebar-section">Account</div>
<button onClick={onLogout}><span className="nav-icon">🚪</span>Logout</button>
</nav></aside>
<div className="main-content">
<div className="top-bar"><h1>{getTitle()}</h1>
<div className="user-info"><span style={{fontSize:'14px',color:'var(--gray-500)'}}>{user.full_name}</span><span style={{fontSize:'11px',color:'var(--gray-400)',marginLeft:4}}>[{user.role}]</span>
<div className="user-avatar">{user.full_name?.split(' ').map(n=>n[0]).join('')}</div>
</div></div>
<div className="page-content">{children}</div>
</div></div>);
}
