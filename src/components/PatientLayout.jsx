import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const PatientLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default PatientLayout;
