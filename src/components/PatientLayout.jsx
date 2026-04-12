import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MaBot from './MaBot';

const PatientLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            {/* pl-64 offsets all child pages for the fixed 256px sidebar */}
            <main className="flex-1 pl-64 min-w-0">
                <Outlet />
            </main>
            {/* MaBot — floating patient assistant */}
            <MaBot />
        </div>
    );
};

export default PatientLayout;
