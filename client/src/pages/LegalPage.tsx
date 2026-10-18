import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, FileText } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#86EFAC] hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <GlassCard glow className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[#86EFAC]/15 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A]/20 border border-[#86EFAC]/30 flex items-center justify-center text-[#4ADE80]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
            <p className="text-xs text-[#A7C9B1]">Effective Date: October 2026 • GT Protocol</p>
          </div>
        </div>

        {isPrivacy ? (
          <div className="space-y-4 text-xs sm:text-sm text-[#A7C9B1] leading-relaxed">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              GT Mining collects only the data strictly necessary to operate your virtual mining session and referral relationships: full name, email address, password hash, and UTC mining timestamps.
            </p>

            <h2 className="text-base font-bold text-white">2. Right to Account Deletion (GDPR / CCPA)</h2>
            <p>
              Users have the unconditional right to erase their personal information. Initiating account deletion from your Profile irreversibly replaces identifying fields with randomized anonymized placeholders while maintaining necessary mathematical ledger consistency.
            </p>

            <h2 className="text-base font-bold text-white">3. Data Security & Storage</h2>
            <p>
              Passwords are salted and hashed with modern bcrypt cryptography. We never transmit or store plain text passwords or private session credentials.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-[#A7C9B1] leading-relaxed">
            <h2 className="text-base font-bold text-white">1. Nature of GT Coins</h2>
            <p>
              GT coins are purely in-app virtual utility units created for simulation, engagement, and decentralized community testing. GT coins do not constitute securities, commodities, legal tender, or investment instruments.
            </p>

            <h2 className="text-base font-bold text-white">2. Fair Mining & 4-Hour Cooldown</h2>
            <p>
              Each user is permitted 1 verified claim per four-hour window (14,400 seconds). Attempts to bypass cooldowns through scripts, multi-accounting, or clock tampering will result in automated node suspension.
            </p>

            <h2 className="text-base font-bold text-white">3. Referral Attribution Policy</h2>
            <p>
              Referral links must not be used in spam campaigns. Self-referrals and circular attribution chains are intercepted and disqualified by our atomic ledger.
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
