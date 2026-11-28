'use client';

import React from 'react';
import { Header } from '../../components/layout/Header';
import { NotificationEmailsCard } from '../../components/settings/NotificationEmailsCard';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="System Settings"
        subtitle="Manage EOD Summary & Operational Alert Email Recipients"
      />
      <div className="p-6 max-w-4xl">
        <NotificationEmailsCard />
      </div>
    </div>
  );
}
