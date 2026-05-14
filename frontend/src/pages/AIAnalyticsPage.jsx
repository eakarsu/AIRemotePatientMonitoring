import React,{useState,useEffect} from 'react';
import{api} from'../services/api';
import AIOutput from'../components/AIOutput';
export default function AIAnalyticsPage(){
const[patients,setPatients]=useState([]);const[selectedPatient,setSelectedPatient]=useState('');const[symptoms,setSymptoms]=useState('');const[meds,setMeds]=useState('aspirin, metformin, lisinopril');const[loading,setLoading]=useState(false);const[aiResult,setAiResult]=useState(null);const[activeType,setActiveType]=useState('');const[history,setHistory]=useState([]);const[showHistory,setShowHistory]=useState(false);const[histPage,setHistPage]=useState(1);const[histTotalPages,setHistTotalPages]=useState(1);
useEffect(()=>{api.getAll('patients',{limit:200}).then(r=>setPatients(Array.isArray(r)?r:(r?.data||[]))).catch(console.error);},[]);
const runAnalysis=async(type)=>{
if(!selectedPatient&&!['billing','interactions'].includes(type)){alert('Please select a patient first');return;}
setLoading(true);setActiveType(type);
try{
let result;
switch(type){
case'health-risk':result=await api.aiHealthRisk(selectedPatient);break;
case'symptom':if(!symptoms.trim()){alert('Enter symptoms');setLoading(false);return;}result=await api.aiSymptomAnalysis(selectedPatient,symptoms);break;
case'predictive':result=await api.aiPredictive(selectedPatient);break;
case'treatment':result=await api.aiTreatment(selectedPatient);break;
case'care-plan':result=await api.aiCarePlan(selectedPatient);break;
case'billing':result=await api.aiBilling();break;
case'report':result=await api.aiGenerateReport(selectedPatient);break;
case'interactions':result=await api.aiCheckInteractions(meds.split(',').map(m=>m.trim()).filter(Boolean),selectedPatient||null);break;
}
setAiResult(result?.analysis||result?.report||result);
}catch(err){setAiResult({error:err.message});}
setLoading(false);};
const loadHistory=async(page=1)=>{try{const d=await api.aiHistory({page,limit:20});setHistory(d.data||d);setHistTotalPages(d.pagination?.totalPages||1);setHistPage(page);setShowHistory(true);}catch(err){alert(err.message);}};
const labels={'health-risk':'Health Risk Assessment','symptom':'Symptom Analysis','predictive':'Predictive Analytics','treatment':'Treatment Recommendations','care-plan':'AI Care Plan','billing':'Billing Optimization','report':'Patient Clinical Report','interactions':'Medication Interactions'};
return(<div>
<div className="detail-card" style={{marginBottom:24}}>
<div className="detail-header"><h2>🤖 AI-Powered Analytics</h2><button className="btn btn-secondary btn-sm" onClick={()=>loadHistory(1)}>View History</button></div>
<div className="detail-body">
<div className="form-row" style={{marginBottom:20}}>
<div className="form-group"><label>Patient</label><select className="form-control" value={selectedPatient} onChange={e=>setSelectedPatient(e.target.value)}><option value="">Choose a patient...</option>{patients.map(p=><option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}</select></div>
<div className="form-group"><label>Symptoms (for Symptom Analysis)</label><input className="form-control" value={symptoms} onChange={e=>setSymptoms(e.target.value)} placeholder="e.g., chest pain, shortness of breath..."/></div>
<div className="form-group"><label>Medications (for Interaction Check, comma-separated)</label><input className="form-control" value={meds} onChange={e=>setMeds(e.target.value)} placeholder="aspirin, metformin, lisinopril..."/></div>
</div>
<div style={{display:'flex',flexWrap:'wrap',gap:10}}>
{Object.keys(labels).map(t=><button key={t} className="btn btn-ai" onClick={()=>runAnalysis(t)} disabled={loading}>{labels[t]}</button>)}
</div></div></div>
{loading&&<div className="loading" style={{padding:40}}><div className="spinner"></div>AI is processing...</div>}
{aiResult&&!loading&&<AIOutput content={aiResult} title={labels[activeType]||'AI Analysis'}/>}
{showHistory&&(<div className="detail-card" style={{marginTop:24}}>
<div className="detail-header"><h2>Analysis History</h2><button className="btn btn-secondary btn-sm" onClick={()=>setShowHistory(false)}>Close</button></div>
<div className="table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Patient</th><th>Type</th><th>Model</th><th>Actions</th></tr></thead>
<tbody>{history.map(h=><tr key={h.id}><td>{new Date(h.created_at).toLocaleString()}</td><td>{h.first_name?`${h.first_name} ${h.last_name}`:'System'}</td><td><span className="badge badge-medium">{h.analysis_type}</span></td><td style={{fontSize:11}}>{h.model_used}</td><td><button className="btn btn-sm btn-outline" onClick={()=>{try{setAiResult(JSON.parse(h.result));}catch{setAiResult(h.result);}setActiveType(h.analysis_type);setShowHistory(false);}}>View</button></td></tr>)}</tbody>
</table></div>
<div style={{display:'flex',justifyContent:'center',gap:8,padding:12}}>
<button className="btn btn-sm btn-secondary" disabled={histPage<=1} onClick={()=>loadHistory(histPage-1)}>Prev</button>
<span style={{lineHeight:'32px',fontSize:13}}>Page {histPage} of {histTotalPages}</span>
<button className="btn btn-sm btn-secondary" disabled={histPage>=histTotalPages} onClick={()=>loadHistory(histPage+1)}>Next</button>
</div>
</div>)}
</div>);
}
