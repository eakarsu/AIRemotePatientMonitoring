import React,{useState,useEffect} from 'react';

// === Batch 07 Gaps & Frontend Mounts ===
import CfPredictiveDecompensationAlerts from './pages/CfPredictiveDecompensationAlerts';
import CfSharedDecisionmakingTool from './pages/CfSharedDecisionmakingTool';
import CfSocialPrescribingRecommendations from './pages/CfSocialPrescribingRecommendations';
import CfLongitudinalHealthTrajectory from './pages/CfLongitudinalHealthTrajectory';
import CfCostawareTreatmentPlanning from './pages/CfCostawareTreatmentPlanning';
import CfCaregiverSupportCoaching from './pages/CfCaregiverSupportCoaching';
import GapNoDecompensationalertPredictAcuteEvents from './pages/GapNoDecompensationalertPredictAcuteEvents';
import GapNoMedicationoptimizationAppropriatenessCo from './pages/GapNoMedicationoptimizationAppropriatenessCo';
import GapNoSocialdeterminantsassessment from './pages/GapNoSocialdeterminantsassessment';
import GapNoMentalhealthscreeningPhq9Gad7Automatio from './pages/GapNoMentalhealthscreeningPhq9Gad7Automatio';
import GapNoPatienteducationcustomizerLiteracylangua from './pages/GapNoPatienteducationcustomizerLiteracylangua';
import GapNoAnomalyDetectionOnVitalsStream from './pages/GapNoAnomalyDetectionOnVitalsStream';
import GapNoWearableIntegrationAppleHealthFitbit from './pages/GapNoWearableIntegrationAppleHealthFitbit';
import GapNoCgmDataPipelineDexcomLibre from './pages/GapNoCgmDataPipelineDexcomLibre';
import GapNoMedicationRefillAutomationPharmacyInt from './pages/GapNoMedicationRefillAutomationPharmacyInt';
import GapNoTelehealthVideoIntegration from './pages/GapNoTelehealthVideoIntegration';
import GapNoPatientMessagingSecureInbox from './pages/GapNoPatientMessagingSecureInbox';
import GapNoPhrExportCcdaFhirBulk from './pages/GapNoPhrExportCcdaFhirBulk';
import GapNoEhrHl7fhirConnector from './pages/GapNoEhrHl7fhirConnector';
import GapNoCaregiverPortal from './pages/GapNoCaregiverPortal';
// === End Batch 07 ===

import{BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Login from'./pages/Login';import Layout from'./components/Layout';
import Dashboard from'./pages/Dashboard';import PatientsPage from'./pages/PatientsPage';
import VitalsPage from'./pages/VitalsPage';import MedicationsPage from'./pages/MedicationsPage';
import AppointmentsPage from'./pages/AppointmentsPage';import AlertsPage from'./pages/AlertsPage';
import CarePlansPage from'./pages/CarePlansPage';import DevicesPage from'./pages/DevicesPage';
import ConsultationsPage from'./pages/ConsultationsPage';import ReportsPage from'./pages/ReportsPage';
import BillingPage from'./pages/BillingPage';import EmergencyPage from'./pages/EmergencyPage';
import AIAnalyticsPage from'./pages/AIAnalyticsPage';import VitalsSimulatorPage from'./pages/VitalsSimulatorPage';
import DecompensationAlertPage from'./pages/DecompensationAlertPage';
import SocialDeterminantsPage from'./pages/SocialDeterminantsPage';
import MentalHealthScreeningPage from'./pages/MentalHealthScreeningPage';
import MedicationOptimizationPage from'./pages/MedicationOptimizationPage';
import PatientEducationPage from'./pages/PatientEducationPage';
import SharedDecisionPage from'./pages/SharedDecisionPage';
import LongitudinalTrajectoryPage from'./pages/LongitudinalTrajectoryPage';
import CostAwarePlanPage from'./pages/CostAwarePlanPage';
import CaregiverCoachingPage from'./pages/CaregiverCoachingPage';
function App(){
const[user,setUser]=useState(null);const[loading,setLoading]=useState(true);
useEffect(()=>{const t=localStorage.getItem('token');const u=localStorage.getItem('user');if(t&&u)setUser(JSON.parse(u));setLoading(false);},[]);
const handleLogin=(u,t)=>{localStorage.setItem('token',t);localStorage.setItem('user',JSON.stringify(u));setUser(u);};
const handleLogout=()=>{localStorage.removeItem('token');localStorage.removeItem('user');setUser(null);};
if(loading)return<div className="loading"><div className="spinner"></div>Loading...</div>;
return(<BrowserRouter><Routes>
<Route path="/login" element={user?<Navigate to="/"/>:<Login onLogin={handleLogin}/>}/>
<Route path="/*" element={user?(<Layout user={user} onLogout={handleLogout}><Routes>
<Route path="/" element={<Dashboard/>}/><Route path="/patients" element={<PatientsPage/>}/>
<Route path="/vitals" element={<VitalsPage/>}/><Route path="/medications" element={<MedicationsPage/>}/>
<Route path="/appointments" element={<AppointmentsPage/>}/><Route path="/alerts" element={<AlertsPage/>}/>
<Route path="/care-plans" element={<CarePlansPage/>}/><Route path="/devices" element={<DevicesPage/>}/>
<Route path="/consultations" element={<ConsultationsPage/>}/><Route path="/reports" element={<ReportsPage/>}/>
<Route path="/billing" element={<BillingPage/>}/><Route path="/emergency" element={<EmergencyPage/>}/>
<Route path="/ai-analytics" element={<AIAnalyticsPage/>}/><Route path="/simulator" element={<VitalsSimulatorPage/>}/>
<Route path="/decompensation-alert" element={<DecompensationAlertPage/>}/>
<Route path="/social-determinants" element={<SocialDeterminantsPage/>}/>
<Route path="/mental-health-screening" element={<MentalHealthScreeningPage/>}/>
<Route path="/medication-optimization" element={<MedicationOptimizationPage/>}/>
<Route path="/patient-education" element={<PatientEducationPage/>}/>
<Route path="/shared-decision" element={<SharedDecisionPage/>}/>
<Route path="/longitudinal-trajectory" element={<LongitudinalTrajectoryPage/>}/>
<Route path="/cost-aware-plan" element={<CostAwarePlanPage/>}/>
<Route path="/caregiver-coaching" element={<CaregiverCoachingPage/>}/>
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-predictive-decompensation-alerts' element={<CfPredictiveDecompensationAlerts />} />
          <Route path='/cf-shared-decisionmaking-tool' element={<CfSharedDecisionmakingTool />} />
          <Route path='/cf-social-prescribing-recommendations' element={<CfSocialPrescribingRecommendations />} />
          <Route path='/cf-longitudinal-health-trajectory' element={<CfLongitudinalHealthTrajectory />} />
          <Route path='/cf-costaware-treatment-planning' element={<CfCostawareTreatmentPlanning />} />
          <Route path='/cf-caregiver-support-coaching' element={<CfCaregiverSupportCoaching />} />
          <Route path='/gap-no-decompensationalert-predict-acute-events' element={<GapNoDecompensationalertPredictAcuteEvents />} />
          <Route path='/gap-no-medicationoptimization-appropriateness-co' element={<GapNoMedicationoptimizationAppropriatenessCo />} />
          <Route path='/gap-no-socialdeterminantsassessment' element={<GapNoSocialdeterminantsassessment />} />
          <Route path='/gap-no-mentalhealthscreening-phq9-gad7-automatio' element={<GapNoMentalhealthscreeningPhq9Gad7Automatio />} />
          <Route path='/gap-no-patienteducationcustomizer-literacylangua' element={<GapNoPatienteducationcustomizerLiteracylangua />} />
          <Route path='/gap-no-anomaly-detection-on-vitals-stream' element={<GapNoAnomalyDetectionOnVitalsStream />} />
          <Route path='/gap-no-wearable-integration-apple-health-fitbit' element={<GapNoWearableIntegrationAppleHealthFitbit />} />
          <Route path='/gap-no-cgm-data-pipeline-dexcom-libre' element={<GapNoCgmDataPipelineDexcomLibre />} />
          <Route path='/gap-no-medication-refill-automation-pharmacy-int' element={<GapNoMedicationRefillAutomationPharmacyInt />} />
          <Route path='/gap-no-telehealth-video-integration' element={<GapNoTelehealthVideoIntegration />} />
          <Route path='/gap-no-patient-messaging-secure-inbox' element={<GapNoPatientMessagingSecureInbox />} />
          <Route path='/gap-no-phr-export-ccda-fhir-bulk' element={<GapNoPhrExportCcdaFhirBulk />} />
          <Route path='/gap-no-ehr-hl7fhir-connector' element={<GapNoEhrHl7fhirConnector />} />
          <Route path='/gap-no-caregiver-portal' element={<GapNoCaregiverPortal />} />
          // === End Batch 07 ===
</Routes></Layout>):<Navigate to="/login"/>}/>
</Routes></BrowserRouter>);
}
export default App;
