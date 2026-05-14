import React,{useState,useEffect,useRef} from 'react';
import{api}from'../services/api';
export default function VitalsSimulatorPage(){
const[patients,setPatients]=useState([]);const[pid,setPid]=useState('');const[running,setRunning]=useState(false);const[alerts,setAlerts]=useState([]);const[mews,setMews]=useState(null);const ref=useRef();
const[v,setV]=useState({heart_rate:72,blood_pressure_systolic:120,blood_pressure_diastolic:80,temperature:98.6,oxygen_saturation:98,respiratory_rate:16,blood_glucose:95,weight:160});
useEffect(()=>{api.getAll('patients',{limit:200}).then(r=>setPatients(Array.isArray(r)?r:(r?.data||[]))).catch(()=>{});return()=>clearInterval(ref.current);},[]);
const critical=()=>setV(x=>({...x,heart_rate:135,oxygen_saturation:87,blood_pressure_systolic:85}));
const send=async()=>{if(!pid)return alert('Pick patient');try{const r=await api.ingestVitals({patient_id:pid,...v});if(r.triggered_alerts?.length)setAlerts(a=>[...r.triggered_alerts,...a].slice(0,10));const m=await api.getMEWS(pid);setMews(m);}catch(e){alert(e.message);}};
const startAuto=()=>{if(!pid)return alert('Pick patient');setRunning(true);ref.current=setInterval(async()=>{const rv={heart_rate:Math.floor(Math.random()*60+60),blood_pressure_systolic:Math.floor(Math.random()*40+110),blood_pressure_diastolic:Math.floor(Math.random()*20+70),temperature:parseFloat((Math.random()*2+97.5).toFixed(1)),oxygen_saturation:parseFloat((Math.random()*5+94).toFixed(1)),respiratory_rate:Math.floor(Math.random()*6+14),blood_glucose:Math.floor(Math.random()*40+80),weight:v.weight};setV(rv);try{const r=await api.ingestVitals({patient_id:pid,device_id:'SIM-001',...rv});if(r.triggered_alerts?.length)setAlerts(a=>[...r.triggered_alerts,...a].slice(0,10));const m=await api.getMEWS(pid);setMews(m);}catch{}},5000);};
const stopAuto=()=>{setRunning(false);clearInterval(ref.current);};
const mc=mews?(mews.mews_score>=5?'#ef4444':mews.mews_score>=3?'#f97316':mews.mews_score>=1?'#eab308':'#22c55e'):'#6b7280';
return(<div>
<div className="detail-card"><div className="detail-header"><h2>Device Simulator</h2><div style={{display:'flex',gap:6}}><button className="btn btn-danger btn-sm" onClick={critical} disabled={running}>Critical</button>{!running?<button className="btn btn-ai btn-sm" onClick={startAuto}>Auto(5s)</button>:<button className="btn btn-primary btn-sm" onClick={stopAuto}>Stop</button>}<button className="btn btn-primary btn-sm" onClick={send} disabled={running}>Send Vitals</button></div></div>
<div className="detail-body">
<div className="form-group"><label>Patient</label><select className="form-control" value={pid} onChange={e=>setPid(e.target.value)}><option value="">Choose...</option>{patients.map(p=><option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}</select></div>
<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
{[['heart_rate','HR(bpm)',1,v=>v>120||v<40],['blood_pressure_systolic','BP Sys',1,null],['blood_pressure_diastolic','BP Dia',1,null],['temperature','Temp(F)',0.1,null],['oxygen_saturation','SpO2',0.1,v=>v<90],['respiratory_rate','RR',1,null],['blood_glucose','Glucose',1,null],['weight','Weight',1,null]].map(([k,l,s,c])=>{const cr=c&&c(parseFloat(v[k]));return(<div key={k} className="form-group"><label style={{color:cr?'#ef4444':undefined}}>{l}{cr?' ⚠️':''}</label><input type="number" className="form-control" style={{border:cr?'2px solid #ef4444':undefined}} value={v[k]} onChange={e=>setV(x=>({...x,[k]:parseFloat(e.target.value)}))} step={s}/></div>);})}
</div>
{mews&&<div style={{marginTop:16,padding:16,borderRadius:8,borderLeft:`4px solid ${mc}`,background:'#f9fafb'}}><strong>MEWS:<span style={{color:mc,fontSize:'1.5rem',marginLeft:8}}>{mews.mews_score}</span></strong> — {mews.risk_level} — {mews.recommendation}{alerts.length>0&&<div style={{marginTop:8}}>{alerts.slice(0,3).map((a,i)=><div key={i} style={{color:'#ef4444',fontSize:12}}>{a.message}</div>)}</div>}</div>}
</div></div>
</div>);
}
