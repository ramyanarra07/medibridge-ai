import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Heart,
  Droplets,
  Zap,
  ShieldAlert,
  Users,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  HeartHandshake,
  Shield
} from 'lucide-react';

export default function LandingPage() {
  const conditions = [
    {
      title: 'Type-2 Diabetes Mellitus',
      icon: Droplets,
      color: 'from-amber-500 to-orange-500',
      desc: 'Predicts glycemic instability and complication likelihood based on fasting glucose, HbA1c, BMI, and metabolic markers.',
      features: ['ADA Aligned Targets', 'Glycemic Trajectory Tracking', 'Ketone & Insulin Guidance']
    },
    {
      title: 'Chronic Kidney Disease (CKD)',
      icon: Activity,
      color: 'from-purple-500 to-indigo-600',
      desc: 'Monitors renal clearance decline using Serum Creatinine, Blood Urea, eGFR, Albumin, and Hemoglobin indices.',
      features: ['KDIGO Staging Criteria', 'Glomerular Filtration Monitoring', 'Anemia Complication Warnings']
    },
    {
      title: 'Hypertension & Arterial Strain',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      desc: 'Classifies arterial resistance, stage 1/2 hypertension, and hypertensive crisis based on systolic/diastolic blood pressure.',
      features: ['AHA/ACC Classification', 'Hemodynamic Delta Tracking', 'Red-line Safety Escalation']
    },
    {
      title: 'Cardiovascular Disease (CVD)',
      icon: Heart,
      color: 'from-rose-500 to-red-600',
      desc: 'Assesses coronary artery vulnerability through lipid profiles, resting heart rate, exertional angina, and blood pressure.',
      features: ['Framingham Aligned Model', 'Lipid Load Evaluation', 'Exertional Angina Detection']
    }
  ];

  const roles = [
    {
      title: 'Patients',
      roleKey: 'patient',
      icon: Users,
      desc: 'Log daily home telemetry, view real-time disease risk assessments with Explainable AI insights, and access clinical reports.',
      demoUser: 'john_doe / patient123'
    },
    {
      title: 'Attending Physicians',
      roleKey: 'doctor',
      icon: Stethoscope,
      desc: 'Triage virtual ward patients by risk level, review physiological trajectory graphs, post clinical notes, and manage care plans.',
      demoUser: 'dr_mitchell / doctor123'
    },
    {
      title: 'Caregivers & Family',
      roleKey: 'caregiver',
      icon: HeartHandshake,
      desc: 'Stay informed with real-time patient alerts, acknowledge clinical notifications, and coordinate closely with doctors.',
      demoUser: 'caregiver_emma / caregiver123'
    },
    {
      title: 'Administrators',
      roleKey: 'admin',
      icon: Shield,
      desc: 'Oversee system telemetry, manage user access permissions, inspect machine learning model benchmarks and database health.',
      demoUser: 'admin / admin123'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-200">
              <BrainCircuit className="w-4 h-4 text-blue-600" />
              <span>Next-Generation Virtual Ward Prototype</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Medi Bridge <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">AI</span>
            </h1>

            <p className="mt-4 text-lg sm:text-xl text-slate-600 font-medium leading-relaxed">
              An Adaptive AI-Driven Virtual Ward for Enhanced Remote Monitoring of 
              <span className="text-slate-900 font-semibold"> Diabetes</span>, 
              <span className="text-slate-900 font-semibold"> Chronic Kidney Disease</span>, 
              <span className="text-slate-900 font-semibold"> Hypertension</span>, and 
              <span className="text-slate-900 font-semibold"> Cardiovascular Conditions</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 group"
              >
                <span>Enter Virtual Ward</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/predictions"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition-all flex items-center gap-2"
              >
                <BrainCircuit className="w-4 h-4 text-blue-600" />
                <span>AI Prediction Playground</span>
              </Link>
            </div>

            {/* Disclaimer pill */}
            <div className="mt-6 text-xs text-slate-500 bg-white/70 backdrop-blur-sm border border-slate-200/80 rounded-full px-4 py-1.5 inline-block">
              Academic Research Prototype • Decision-support assistance only • Not a medical device
            </div>
          </div>
        </div>
      </section>

      {/* 4 Chronic Conditions Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Four Integrated Chronic Disease AI Modules
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
            Separate trained classification models evaluate multi-parameter biometric telemetry, calculate calibrated risk probabilities, and produce Explainable AI breakdowns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {conditions.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-white shadow-md mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{c.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{c.desc}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  {c.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Multi-Role System Architecture */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Coordinated Care Team Modules
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
              Medi Bridge AI connects all clinical stakeholders in the virtual ward through specialized interfaces and real-time alert dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">{r.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{r.desc}</p>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600">Demo User:</span> {r.demoUser}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Medi Bridge AI Virtual Ward</span>
          </div>
          <div>Final Year Academic Project • Full-Stack Healthcare AI Engineering Prototype</div>
          <div className="text-slate-500">Python Flask • React.js • Scikit-Learn • SQLite</div>
        </div>
      </footer>
    </div>
  );
}
