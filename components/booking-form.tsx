"use client";

import { useState, type FormEvent } from "react";

const hourOptions = Array.from({ length: 12 }, (_, i) => {
  const hour = 10 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

interface BookingData {
  name: string;
  whatsapp: string;
  date: string;
  time: string;
  guests: string;
  notes: string;
}

const initialData: BookingData = {
  name: "",
  whatsapp: "",
  date: "",
  time: "",
  guests: "",
  notes: "",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const inputClass =
  "w-full rounded-xl border border-espresso/15 bg-cream px-4 py-2.5 text-espresso placeholder:text-espresso/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const labelClass = "text-sm font-semibold text-espresso";

export default function BookingForm() {
  const [formData, setFormData] = useState<BookingData>(initialData);
  const [submittedData, setSubmittedData] = useState<BookingData | null>(
    null,
  );

  function handleChange(field: keyof BookingData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedData(formData);
  }

  function handleReset() {
    setFormData(initialData);
    setSubmittedData(null);
  }

  if (submittedData) {
    return (
      <div className="flex flex-col gap-6 rounded-3xl border border-espresso/10 bg-white/70 p-8 text-center shadow-sm sm:p-10">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-3xl">
            ✅
          </span>
          <h2 className="text-2xl font-bold text-espresso">
            Booking kamu kami terima!
          </h2>
          <p className="text-espresso/70">
            Berikut ringkasan booking meja Kopi Kita kamu.
          </p>
        </div>

        <dl className="flex flex-col divide-y divide-espresso/10 rounded-2xl bg-cream text-left">
          {[
            { label: "Nama Lengkap", value: submittedData.name },
            { label: "Nomor WhatsApp", value: submittedData.whatsapp },
            { label: "Tanggal", value: formatDate(submittedData.date) },
            { label: "Jam", value: submittedData.time },
            { label: "Jumlah Orang", value: `${submittedData.guests} orang` },
            { label: "Catatan", value: submittedData.notes || "-" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <dt className="text-sm font-medium text-espresso/60">
                {row.label}
              </dt>
              <dd className="text-sm font-semibold text-espresso sm:text-right">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={handleReset}
          className="mx-auto rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-espresso/90"
        >
          Buat Booking Baru
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-espresso/10 bg-white/70 p-8 shadow-sm sm:p-10"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            Nama Lengkap
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="Nama kamu"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="whatsapp" className={labelClass}>
            Nomor WhatsApp
          </label>
          <input
            id="whatsapp"
            type="tel"
            required
            placeholder="08xx-xxxx-xxxx"
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className={labelClass}>
            Tanggal
          </label>
          <input
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="time" className={labelClass}>
            Jam
          </label>
          <select
            id="time"
            required
            value={formData.time}
            onChange={(e) => handleChange("time", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Pilih jam
            </option>
            {hourOptions.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="guests" className={labelClass}>
            Jumlah Orang
          </label>
          <input
            id="guests"
            type="number"
            required
            min={1}
            max={8}
            placeholder="1 - 8 orang"
            value={formData.guests}
            onChange={(e) => handleChange("guests", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className={labelClass}>
          Catatan{" "}
          <span className="font-normal text-espresso/50">(opsional)</span>
        </label>
        <textarea
          id="notes"
          rows={4}
          placeholder="Permintaan khusus, misalnya kursi bayi atau area outdoor"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-accent-dark"
      >
        Booking Sekarang
      </button>
    </form>
  );
}
