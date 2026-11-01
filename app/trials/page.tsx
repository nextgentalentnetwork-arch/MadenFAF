'use client';

import React, { useState } from 'react';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { JoinModal } from '@/components/modals/JoinModal';
import { AcademyDataManager } from '@/lib/academyDataManager';
import {
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function TrialsPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState('gayeshpur');
  const trialSlots = AcademyDataManager.getTrialSlots().filter((s) => s.status !== 'Closed');

  const handleBookSlot = (campusId: string) => {
    setSelectedCampus(campusId);
    setJoinModalOpen(true);
  };

  return (
    <PublicPageShell
      title="Official Player Trials & Intake"
      subtitle="Structured on-pitch evaluations conducted by AFC & UEFA certified coaches. Prove your talent and earn your place in the MADEN squad."
      badge="Intake 2026/27"
      breadcrumbs={[{ label: 'Trial Assessment' }]}
      ctaText="Register for Trial"
      ctaAction={() => setJoinModalOpen(true)}
    >
      <div className="py-10 space-y-16">
        {/* Trial Slots Active Schedule */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase text-amber-700 tracking-wider">
              Upcoming Assessment Sessions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              Select Your Assessment Pitch
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Limited slots per age category to guarantee personalized technical evaluation by licensed scouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trialSlots.map((slot) => {
              const isFull = slot.status === 'Closed' || slot.slotsBooked >= slot.slotsTotal;
              return (
                <div
                  key={slot.id}
                  className={`bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all hover:shadow-md ${
                    isFull ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold uppercase">
                        {slot.ageGroups}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isFull ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {isFull ? 'Slot Full' : `${slot.slotsTotal - slot.slotsBooked} Slots Available`}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{slot.campusName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.campusName} Pitch</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Date:</span>
                        <span className="font-bold text-slate-900">{slot.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Reporting Time:</span>
                        <span className="font-bold text-slate-900">{slot.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Head Evaluator:</span>
                        <span className="font-bold text-slate-900">{slot.evaluatorCoach}</span>
                      </div>
                    </div>

                    {slot.requirements && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        {slot.requirements}
                      </p>
                    )}
                  </div>

                  <button
                    disabled={isFull}
                    onClick={() => handleBookSlot(slot.campus)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFull
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                    }`}
                  >
                    <span>{isFull ? 'Waitlist Only' : 'Book Assessment Pass'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment Evaluation Rubric */}
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-amber-700 tracking-wider">
                What Scouts Look For
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
                Candidate Evaluation Rubric
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                Players are scored on five equal parameters during the 90-minute trial session.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center">1</div>
                <h3 className="text-sm font-bold text-slate-900">First Touch & Ball Control</h3>
                <p className="text-slate-500 leading-relaxed">
                  Ability to cushion pass trajectories with both feet, adjust body orientation before reception, and execute quick releases.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center">2</div>
                <h3 className="text-sm font-bold text-slate-900">1v1 Attacking & Defending</h3>
                <p className="text-slate-500 leading-relaxed">
                  Confidence to take on opponents with body feints, maintain defensive balance, and press immediately on ball loss.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center">3</div>
                <h3 className="text-sm font-bold text-slate-900">Game Speed & Spatial IQ</h3>
                <p className="text-slate-500 leading-relaxed">
                  Off-the-ball movements, scanning over the shoulder every 3 seconds, identifying passing lanes, and communication.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center">4</div>
                <h3 className="text-sm font-bold text-slate-900">Speed, Agility & Work Rate</h3>
                <p className="text-slate-500 leading-relaxed">
                  30m sprint mechanics, multi-directional shuttle deceleration, and sustained physical commitment until final whistle.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center">5</div>
                <h3 className="text-sm font-bold text-slate-900">Coachability & Mental Grip</h3>
                <p className="text-slate-500 leading-relaxed">
                  Attitude when receiving tactical corrections, respect toward peers and match referee, and response to match mistakes.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center">✓</div>
                <h3 className="text-sm font-bold text-slate-900">Official Decision Dossier</h3>
                <p className="text-slate-500 leading-relaxed">
                  Every participant receives a personalized performance feedback card and WhatsApp notification within 48 hours of trial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What to Bring Checklist */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900">
                  Trial Day Checklist: What to Bring
                </h3>
                <p className="text-xs text-slate-500">
                  Please arrive 30 minutes prior to scheduled reporting time for bib allocation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Football boots (firm ground moulded studs or turf shoes)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hard plastic shin guards with matching football socks</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Photocopy of Municipal Birth Certificate / Aadhaar card</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1-litre water hydration bottle with electrolytes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        defaultCampus={selectedCampus}
      />
    </PublicPageShell>
  );
}
