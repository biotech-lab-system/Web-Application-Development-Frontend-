"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Clock, Microscope, Plus, Search, Settings2, Wrench } from "lucide-react";
import { bookings, equipment } from "@/data/mock";
import { Badge, Modal, PageHeader, StatCard, StatusBadge, Toast } from "@/components/ui";

export default function EquipmentPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("Week");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState("PCR Machine");
  const [date, setDate] = useState("2026-07-18");
  const [time, setTime] = useState("09:00");
  const [conflict, setConflict] = useState(false);
  const [toast, setToast] = useState(false);
  const filtered = useMemo(() => equipment.filter((item) => (!query || item.name.toLowerCase().includes(query.toLowerCase())) && (filter === "All" || item.status === filter)), [query, filter]);
  const openBooking = (name?: string) => { if (name) setSelectedEquipment(name); setConflict(false); setBookingOpen(true); };
  const book = () => {
    if (selectedEquipment === "PCR Machine" && date === "2026-07-18" && time === "09:00") { setConflict(true); return; }
    setBookingOpen(false); setConflict(false); setToast(true); window.setTimeout(() => setToast(false), 2200);
  };
  return (
    <div className="page">
      <PageHeader eyebrow="Shared instruments" title="Equipment booking" description="See availability, reserve instruments, and plan around maintenance windows." actions={<button className="btn btn-primary" onClick={() => openBooking()}><Plus /> New booking</button>} />
      <section className="stat-grid"><StatCard icon={<Microscope />} value="5" label="Available now" trend="of 8 instruments"/><StatCard icon={<Clock />} value="3" label="In use" trend="2 free by 4 PM"/><StatCard icon={<Wrench />} value="1" label="In maintenance" trend="Returns Jul 20"/><StatCard icon={<CalendarDays />} value="10" label="Upcoming bookings" trend="Next 7 days"/></section>
      <div className="toolbar"><label className="search-field"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search equipment…" aria-label="Search equipment" /></label><select className="select" style={{ width: 160 }} value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Availability filter"><option>All</option><option>Available</option><option>In Use</option><option>Maintenance</option></select><div className="segmented">{["Day", "Week", "Month"].map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item}</button>)}</div></div>
      <section className="equipment-grid section-gap">{filtered.map((item) => <article className="card equipment-card" key={item.id}><div className="equipment-visual"><Microscope /></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}><div><h3>{item.name}</h3><p>{item.room}</p></div><StatusBadge status={item.status}/></div><div className="metric-row"><span className="cell-sub">Utilization</span><strong>{item.utilization}%</strong></div><div className="progress"><span style={{ width: `${item.utilization}%` }}/></div><div className="metric-row"><span>Next available</span><strong>{item.nextAvailable}</strong></div><button className="btn btn-secondary" style={{ width: "100%" }} disabled={item.status === "Maintenance"} onClick={() => openBooking(item.name)}>{item.status === "Maintenance" ? "View maintenance" : "Book instrument"}</button></article>)}</section>
      <section className="grid-main">
        <div className="card"><div className="card-header"><div><h2>{view} booking calendar</h2><p>July 18–22, 2026 · Bangkok time</p></div><div style={{ display: "flex", gap: 5 }}><button className="btn btn-secondary btn-icon" aria-label="Previous period" onClick={() => setToast(true)}><ChevronLeft /></button><button className="btn btn-secondary btn-sm" onClick={() => setToast(true)}>Today</button><button className="btn btn-secondary btn-icon" aria-label="Next period" onClick={() => setToast(true)}><ChevronRight /></button></div></div><div className="card-body"><div className="calendar"><div className="calendar-head">Time</div>{["Sat 18", "Sun 19", "Mon 20", "Tue 21", "Wed 22"].map((day) => <div className="calendar-head" key={day}>{day}</div>)}{["08:00", "10:00", "12:00", "14:00", "16:00"].flatMap((hour, row) => [<div key={`${hour}-label`} className="cell-sub">{hour}</div>, ...Array.from({ length: 5 }, (_, col) => { const booking = bookings[(row + col) % bookings.length]; const show = (row + col) % 3 === 0; return <div key={`${row}-${col}`}>{show && <button className="booking-block" style={{ width: "100%", textAlign: "left" }} onClick={() => openBooking(booking.equipment)}>{booking.equipment}<br/><small>{booking.researcher}</small></button>}</div>; })])}</div></div></div>
        <aside className="stack"><div className="card"><div className="card-header"><div><h2>Upcoming bookings</h2><p>Your next reservations</p></div><Badge tone="info">4 scheduled</Badge></div><div className="card-body"><div className="list">{bookings.slice(0,5).map((item) => <div className="list-item" key={item.id}><div className="list-icon"><Clock /></div><div className="list-copy"><strong>{item.equipment}</strong><span>{item.date}, {item.time} · {item.purpose}</span></div></div>)}</div></div></div><div className="card"><div className="card-header"><div><h2>Maintenance</h2><p>Planned service windows</p></div><Settings2 size={18}/></div><div className="card-body"><div className="alert alert-warning"><Wrench /><div><strong>Autoclave unavailable</strong><p>Preventive maintenance through Jul 20, 3:00 PM.</p></div></div></div></div></aside>
      </section>

      <Modal open={bookingOpen} onClose={() => setBookingOpen(false)} title="Book equipment" description="Reserve a time in the shared instrument calendar." footer={<><button className="btn btn-secondary" onClick={() => setBookingOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={book}>Confirm booking</button></>}>
        {conflict && <div className="alert alert-danger section-gap"><AlertTriangle /><div><strong>Booking conflict</strong><p>PCR Machine is already reserved from 09:00–11:30 on Jul 18.</p></div></div>}
        <div className="form-grid"><div className="field span-2"><label htmlFor="booking-equipment">Equipment</label><select id="booking-equipment" className="select" value={selectedEquipment} onChange={(event) => { setSelectedEquipment(event.target.value); setConflict(false); }}>{equipment.map((item) => <option key={item.id}>{item.name}</option>)}</select></div><div className="field"><label htmlFor="booking-date">Date</label><input id="booking-date" className="input" type="date" value={date} onChange={(event) => { setDate(event.target.value); setConflict(false); }}/></div><div className="field"><label htmlFor="booking-time">Start time</label><input id="booking-time" className="input" type="time" value={time} onChange={(event) => { setTime(event.target.value); setConflict(false); }}/></div><div className="field span-2"><label htmlFor="booking-purpose">Purpose</label><input id="booking-purpose" className="input" defaultValue="CRISPR validation" /></div></div>
        {conflict && <div style={{ marginTop: 16 }}><strong>Suggested alternatives</strong><div className="grid-3" style={{ margin: "9px 0 0", gap: 8 }}>{["12:00", "13:30", "15:00"].map((slot) => <button key={slot} className="btn btn-secondary" onClick={() => { setTime(slot); setConflict(false); }}>{slot}</button>)}</div></div>}
      </Modal>
      <Toast show={toast} title="Booking confirmed" description={`${selectedEquipment} is reserved for Dr. Kan.`}/>
    </div>
  );
}
