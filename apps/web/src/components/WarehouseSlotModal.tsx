'use client';

import React, { useState } from 'react';
import { Warehouse, CheckCircle2, X } from 'lucide-react';
import { useWarehouseStore } from '../lib/store/warehouseStore';

interface WarehouseSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCommodity?: string;
  defaultVolumeKg?: number;
}

const DEPOTS = [
  { name: 'Jaipur North WDRA Hub', location: 'Chomu Road, Jaipur', docks: ['Dock Bay 1', 'Dock Bay 2', 'Dock Bay 3'] },
  { name: 'Phulera Depot #3', location: 'Sambhar Lake Agrarian Corridor', docks: ['Cold Bay 1', 'Grain Bay 2'] },
  { name: 'Ujjain Central Silo', location: 'Dewas Highway, Ujjain', docks: ['Silo Intake A', 'Silo Intake B'] },
];

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:30 AM - 12:30 PM',
  '01:30 PM - 03:30 PM',
  '04:00 PM - 06:00 PM',
];

export default function WarehouseSlotModal({
  isOpen,
  onClose,
  defaultCommodity = 'Wheat (Sharbati)',
  defaultVolumeKg = 5000,
}: WarehouseSlotModalProps) {
  const { bookSlot } = useWarehouseStore();

  const [selectedDepot, setSelectedDepot] = useState(DEPOTS[0].name);
  const [selectedDock, setSelectedDock] = useState(DEPOTS[0].docks[0]);
  const [scheduledDate, setScheduledDate] = useState('Tomorrow, Oct 12');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [volumeKg, setVolumeKg] = useState(defaultVolumeKg);
  const [farmerName] = useState('Rameshwar Lal Jat');
  const [farmerPhone] = useState('+91 98290 44102');
  const [isBooked, setIsBooked] = useState(false);
  const [bookedSlotId, setBookedSlotId] = useState('');

  if (!isOpen) return null;

  const currentDepotObj = DEPOTS.find((d) => d.name === selectedDepot) || DEPOTS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot = bookSlot({
      depotName: selectedDepot,
      depotLocation: currentDepotObj.location,
      dockNumber: selectedDock,
      farmerName,
      farmerPhone,
      commodity,
      estimatedVolumeKg: volumeKg,
      scheduledDate,
      timeSlot,
      eNwrPledgeEligible: true,
    });
    setBookedSlotId(newSlot.id);
    setIsBooked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isBooked ? (
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-3">
              <Warehouse className="w-3.5 h-3.5" />
              <span>WDRA Accredited Capacity Calendar</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
              Warehouse Slot Booking
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
              Reserve a dedicated unloading dock at an accredited depot to eliminate tractor queue times and generate e-NWR pledge receipts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                  Select WDRA Depot Hub
                </label>
                <select
                  value={selectedDepot}
                  onChange={(e) => {
                    setSelectedDepot(e.target.value);
                    const depot = DEPOTS.find((d) => d.name === e.target.value);
                    if (depot) setSelectedDock(depot.docks[0]);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {DEPOTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Dock Bay
                  </label>
                  <select
                    value={selectedDock}
                    onChange={(e) => setSelectedDock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {currentDepotObj.docks.map((dock) => (
                      <option key={dock} value={dock}>
                        {dock}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Preferred Date
                  </label>
                  <select
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Tomorrow, Oct 12">Tomorrow, Oct 12</option>
                    <option value="Tuesday, Oct 13">Tuesday, Oct 13</option>
                    <option value="Wednesday, Oct 14">Wednesday, Oct 14</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                  Time Window (2-Hour Window)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-colors ${
                        timeSlot === slot
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Commodity
                  </label>
                  <input
                    type="text"
                    required
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Volume (kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={volumeKg}
                    onChange={(e) => setVolumeKg(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Confirm Slot Booking
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
              Warehouse Slot Confirmed!
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Slot <strong>#{bookedSlotId}</strong> reserved at <strong>{selectedDepot}</strong> ({selectedDock}) for {scheduledDate} between {timeSlot}.
            </p>
            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              e-NWR Gatepass Generated • Priority Unloading Active
            </div>

            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
