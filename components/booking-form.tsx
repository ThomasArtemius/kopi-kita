"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";

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

interface BookingApiResponse {
  id: number;
  customer_name: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  notes: string | null;
  status: string;
}

type FieldErrors = Partial<Record<keyof BookingData, string>>;

const initialData: BookingData = {
  name: "",
  whatsapp: "",
  date: "",
  time: "",
  guests: "",
  notes: "",
};

const allTouched: Record<keyof BookingData, boolean> = {
  name: true,
  whatsapp: true,
  date: true,
  time: true,
  guests: true,
  notes: true,
};

// Field API (bookings.ts) -> field form ini, dipakai buat memetakan pesan
// error 400 dari server ke input yang tepat.
const API_FIELD_TO_FORM_FIELD: Record<string, keyof BookingData> = {
  customer_name: "name",
  whatsapp: "whatsapp",
  booking_date: "date",
  booking_time: "time",
  party_size: "guests",
  notes: "notes",
};

function parseServerFieldErrors(message: string): FieldErrors {
  const result: FieldErrors = {};
  for (const part of message.split(";").map((p) => p.trim()).filter(Boolean)) {
    const apiField = Object.keys(API_FIELD_TO_FORM_FIELD).find((key) =>
      part.startsWith(key),
    );
    if (apiField) {
      result[API_FIELD_TO_FORM_FIELD[apiField]] = part;
    }
  }
  return result;
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validate(data: BookingData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.name.trim()) {
    errors.name = "Nama lengkap wajib diisi";
  }

  const whatsapp = data.whatsapp.trim();
  if (!whatsapp) {
    errors.whatsapp = "Nomor WhatsApp wajib diisi";
  } else if (!/^\d+$/.test(whatsapp)) {
    errors.whatsapp = "Nomor WhatsApp harus angka saja, tanpa spasi atau simbol";
  } else if (whatsapp.length < 10) {
    errors.whatsapp = "Nomor WhatsApp minimal 10 digit";
  }

  if (!data.date) {
    errors.date = "Tanggal wajib diisi";
  } else if (data.date < getTodayString()) {
    errors.date = "Tanggal tidak boleh sebelum hari ini";
  }

  if (!data.time) {
    errors.time = "Jam wajib dipilih";
  }

  const guests = data.guests.trim();
  if (!guests) {
    errors.guests = "Jumlah orang wajib diisi";
  } else {
    const n = Number(guests);
    if (!Number.isInteger(n) || n < 1 || n > 8) {
      errors.guests = "Jumlah orang harus antara 1 sampai 8";
    }
  }

  return errors;
}

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

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-cream px-4 py-2.5 text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
      : "border-espresso/15 focus:border-accent focus:ring-accent/30"
  }`;
}

const labelClass = "text-sm font-semibold text-espresso";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-600">{message}</p>;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<BookingData>(initialData);
  const [touched, setTouched] = useState<Partial<Record<keyof BookingData, boolean>>>(
    {},
  );
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});
  const [confirmedBooking, setConfirmedBooking] = useState<BookingApiResponse | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clientErrors = validate(formData);
  const isValid = Object.keys(clientErrors).length === 0;

  function fieldMessage(field: keyof BookingData): string | undefined {
    return serverFieldErrors[field] ?? clientErrors[field];
  }

  function handleChange(field: keyof BookingData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleBlur(field: keyof BookingData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) {
      setTouched(allTouched);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setServerFieldErrors({});

    try {
      const res = await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          customer_name: formData.name,
          whatsapp: formData.whatsapp,
          booking_date: formData.date,
          booking_time: formData.time,
          party_size: Number(formData.guests),
          notes: formData.notes || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message: string | undefined = body?.error;

        if (res.status === 400 && message) {
          const fieldErrors = parseServerFieldErrors(message);
          if (Object.keys(fieldErrors).length > 0) {
            setServerFieldErrors(fieldErrors);
            setTouched(allTouched);
            return;
          }
        }

        setSubmitError(message ?? "Gagal mengirim booking, coba lagi.");
        return;
      }

      const booking: BookingApiResponse = await res.json();
      setConfirmedBooking(booking);
    } catch {
      setSubmitError("Koneksi bermasalah, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setFormData(initialData);
    setTouched({});
    setServerFieldErrors({});
    setConfirmedBooking(null);
    setSubmitError(null);
  }

  if (confirmedBooking) {
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
            { label: "ID Booking", value: `#${confirmedBooking.id}` },
            { label: "Nama Lengkap", value: confirmedBooking.customer_name },
            { label: "Nomor WhatsApp", value: confirmedBooking.whatsapp },
            { label: "Tanggal", value: formatDate(confirmedBooking.booking_date) },
            { label: "Jam", value: confirmedBooking.booking_time },
            { label: "Jumlah Orang", value: `${confirmedBooking.party_size} orang` },
            { label: "Catatan", value: confirmedBooking.notes || "-" },
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
      noValidate
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
            placeholder="Nama kamu"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={touched.name && !!fieldMessage("name")}
            className={inputClass(!!(touched.name && fieldMessage("name")))}
          />
          {touched.name && <FieldError message={fieldMessage("name")} />}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="whatsapp" className={labelClass}>
            Nomor WhatsApp
          </label>
          <input
            id="whatsapp"
            type="tel"
            inputMode="numeric"
            placeholder="081234567890"
            value={formData.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            onBlur={() => handleBlur("whatsapp")}
            aria-invalid={touched.whatsapp && !!fieldMessage("whatsapp")}
            className={inputClass(!!(touched.whatsapp && fieldMessage("whatsapp")))}
          />
          {touched.whatsapp && <FieldError message={fieldMessage("whatsapp")} />}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className={labelClass}>
            Tanggal
          </label>
          <input
            id="date"
            type="date"
            min={getTodayString()}
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            onBlur={() => handleBlur("date")}
            aria-invalid={touched.date && !!fieldMessage("date")}
            className={inputClass(!!(touched.date && fieldMessage("date")))}
          />
          {touched.date && <FieldError message={fieldMessage("date")} />}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="time" className={labelClass}>
            Jam
          </label>
          <select
            id="time"
            value={formData.time}
            onChange={(e) => handleChange("time", e.target.value)}
            onBlur={() => handleBlur("time")}
            aria-invalid={touched.time && !!fieldMessage("time")}
            className={inputClass(!!(touched.time && fieldMessage("time")))}
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
          {touched.time && <FieldError message={fieldMessage("time")} />}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="guests" className={labelClass}>
            Jumlah Orang
          </label>
          <input
            id="guests"
            type="number"
            min={1}
            max={8}
            placeholder="1 - 8 orang"
            value={formData.guests}
            onChange={(e) => handleChange("guests", e.target.value)}
            onBlur={() => handleBlur("guests")}
            aria-invalid={touched.guests && !!fieldMessage("guests")}
            className={inputClass(!!(touched.guests && fieldMessage("guests")))}
          />
          {touched.guests && <FieldError message={fieldMessage("guests")} />}
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
          className={`${inputClass(false)} resize-none`}
        />
        {touched.notes && <FieldError message={fieldMessage("notes")} />}
      </div>

      {submitError && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-espresso/20 disabled:text-espresso/40 disabled:hover:bg-espresso/20"
      >
        {submitting ? "Mengirim..." : "Booking Sekarang"}
      </button>
    </form>
  );
}
