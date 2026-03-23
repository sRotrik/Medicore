import React from 'react';
import { useHealth } from '../context/HealthContext';

const TestMedicationData = () => {
    const { medications, loading, refreshData } = useHealth();

    console.log('=== TEST PAGE ===');
    console.log('Loading:', loading);
    console.log('Medications:', medications);
    console.log('Count:', medications?.length);

    if (loading) {
        return <div className="p-8 text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Medication Data Test</h1>

            <button
                onClick={refreshData}
                className="px-4 py-2 bg-emerald-600 rounded mb-4"
            >
                Refresh Data
            </button>

            <div className="bg-slate-900 p-4 rounded">
                <h2 className="text-xl mb-2">Raw Data:</h2>
                <pre className="text-xs overflow-auto">
                    {JSON.stringify({ medications, count: medications?.length }, null, 2)}
                </pre>
            </div>

            <div className="mt-4">
                <h2 className="text-xl mb-2">Medications List:</h2>
                {medications && medications.length > 0 ? (
                    medications.map((med, idx) => (
                        <div key={idx} className="bg-slate-800 p-3 mb-2 rounded">
                            <p><strong>Name:</strong> {med.name}</p>
                            <p><strong>Time:</strong> {med.time}</p>
                            <p><strong>Dosage:</strong> {med.dosagePerIntake}</p>
                            <p><strong>Stock:</strong> {med.remainingQuantity}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-red-400">No medications found!</p>
                )}
            </div>
        </div>
    );
};

export default TestMedicationData;
