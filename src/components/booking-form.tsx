"use client";

import { motion } from "motion/react";
import { AlertCircle, MessageCircle } from "lucide-react";
import { useId, useRef, useState } from "react";

import { site } from "@/lib/site";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

/* The WhatsApp number itself lives in src/lib/whatsapp.ts — change it there. */

type Fields = {
  name: string;
  phone: string;
  date: string;
  time: string;
  lessonType: string;
  message: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = {
  name: "",
  phone: "",
  date: "",
  time: "",
  lessonType: "",
  message: "",
};

/** Order decides which field gets focus after a failed submit. */
const FIELD_ORDER: (keyof Fields)[] = [
  "name",
  "phone",
  "date",
  "time",
  "lessonType",
];

const LABELS: Record<keyof Fields, string> = {
  name: "Your name",
  phone: "Phone number",
  date: "Preferred date",
  time: "Preferred time",
  lessonType: "Lesson type",
  message: "Anything else we should know",
};

const today = () => new Date().toISOString().slice(0, 10);

/* ── Dates are entered day-first ──────────────────────────────────────────
   `<input type="date">` renders in the *browser's* locale, not the page's,
   so a UK learner on a US-configured machine is shown mm/dd/yyyy and books
   the wrong month. This is a plain text field that only ever accepts
   dd/mm/yyyy, and echoes the date back in full underneath so there is
   nothing left to misread. */

/** dd/mm/yyyy -> yyyy-mm-dd, or "" if it is not a real date. */
function parseUkDate(input: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  const iso = `${yyyy}-${mm}-${dd}`;
  const d = new Date(`${iso}T00:00:00`);
  // Rejects 31/02 and friends, which Date would otherwise roll forward.
  if (
    Number.isNaN(d.getTime()) ||
    d.getDate() !== Number(dd) ||
    d.getMonth() + 1 !== Number(mm)
  ) {
    return "";
  }
  return iso;
}

/** Inserts the slashes as the visitor types, and never more than 8 digits. */
function formatUkDate(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
  return parts.filter(Boolean).join("/");
}

const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function validate(values: Fields): Errors {
  const errors: Errors = {};

  if (values.name.trim().length < 2) errors.name = "Enter your name.";

  const digits = values.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    errors.phone = "Enter a phone number we can reach you on.";
  }

  if (!values.date.trim()) {
    errors.date = "Enter a date, as dd/mm/yyyy.";
  } else if (!parseUkDate(values.date)) {
    errors.date = "That is not a date. Use dd/mm/yyyy, for example 06/03/2027.";
  } else if (parseUkDate(values.date) < today()) {
    errors.date = "Choose today or a date in the future.";
  }

  if (!values.time) errors.time = "Choose roughly when suits you.";
  if (!values.lessonType) errors.lessonType = "Choose the kind of lesson.";

  return errors;
}

/** The text that lands in WhatsApp, ready for the visitor to send. */
function composeMessage(v: Fields) {
  const iso = parseUkDate(v.date);
  // Spelled out, so the month can never be read the wrong way round.
  const when = iso
    ? LONG_DATE.format(new Date(`${iso}T00:00:00`))
    : v.date;

  const lines = [
    `Hello ${site.name} — I would like to book a lesson.`,
    "",
    `Name: ${v.name.trim()}`,
    `Phone: ${v.phone.trim()}`,
    `Lesson type: ${v.lessonType}`,
    `Preferred date: ${when}`,
    `Preferred time: ${v.time}`,
  ];
  if (v.message.trim()) lines.push("", `Notes: ${v.message.trim()}`);
  return lines.join("\n");
}

export function BookingForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sentLink, setSentLink] = useState<string | null>(null);

  const id = (f: keyof Fields) => `${uid}-${f}`;
  const errorId = (f: keyof Fields) => `${uid}-${f}-error`;

  const set = <K extends keyof Fields>(field: K, value: Fields[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    const firstBad = FIELD_ORDER.find((field) => found[field]);
    if (firstBad) {
      const el = formRef.current?.querySelector<HTMLElement>(
        `[data-field="${firstBad}"]`,
      );
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    // No backend and no API key: the visitor gets a pre-filled WhatsApp
    // message addressed to us, and presses send themselves.
    const link = whatsappLink(composeMessage(values));
    setSentLink(link);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  if (sentLink) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        role="status"
        aria-live="polite"
        className="mt-8"
      >
        <span className="grid size-11 place-items-center rounded-full bg-accent text-brand-deep">
          <MessageCircle className="size-5" aria-hidden="true" />
        </span>

        <h3 className="display mt-5 text-[1.5rem]">WhatsApp is opening.</h3>

        <p className="mt-3 max-w-[34rem] text-[1.01rem] leading-[1.62] text-ink-soft">
          Your details are written into a message addressed to us — press send
          in WhatsApp to finish. <strong>Nothing has been sent yet</strong>, and
          nothing is stored on this site.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={sentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Open WhatsApp again
          </a>
          <button
            type="button"
            onClick={() => {
              setValues(EMPTY);
              setSentLink(null);
            }}
            className="btn-quiet"
          >
            Start another enquiry
          </button>
        </div>

        <p className="mt-6 text-[0.88rem] text-muted-foreground">
          WhatsApp did not open? Message us directly on{" "}
          <span className="font-semibold text-ink">{WHATSAPP_DISPLAY}</span>.
        </p>
      </motion.div>
    );
  }

  const isoDate = parseUkDate(values.date);
  const longDate = isoDate
    ? LONG_DATE.format(new Date(`${isoDate}T00:00:00`))
    : "";

  const invalid = FIELD_ORDER.filter((f) => errors[f]);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8">
      {invalid.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="flex items-center gap-2 text-[0.94rem] font-semibold text-destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            {invalid.length === 1
              ? "One field needs attention"
              : `${invalid.length} fields need attention`}
          </p>
          <ul className="mt-2 ml-6 list-disc text-[0.9rem] text-destructive">
            {invalid.map((f) => (
              <li key={f}>
                {LABELS[f]} — {errors[f]}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={LABELS.name}
          htmlFor={id("name")}
          error={errors.name}
          errorId={errorId("name")}
        >
          <input
            data-field="name"
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? errorId("name") : undefined}
            className={control(Boolean(errors.name))}
          />
        </Field>

        <Field
          label={LABELS.phone}
          htmlFor={id("phone")}
          error={errors.phone}
          errorId={errorId("phone")}
        >
          <input
            data-field="phone"
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? errorId("phone") : undefined}
            className={control(Boolean(errors.phone))}
          />
        </Field>

        <Field
          label={LABELS.date}
          htmlFor={id("date")}
          error={errors.date}
          errorId={errorId("date")}
        >
          <input
            data-field="date"
            id={id("date")}
            name="date"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            placeholder="dd/mm/yyyy"
            maxLength={10}
            value={values.date}
            onChange={(e) => set("date", formatUkDate(e.target.value))}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={
              errors.date
                ? errorId("date")
                : longDate
                  ? `${id("date")}-echo`
                  : undefined
            }
            className={control(Boolean(errors.date))}
          />
          {longDate && !errors.date && (
            <p
              id={`${id("date")}-echo`}
              className="mt-2 text-[0.83rem] text-muted-foreground"
            >
              {longDate}
            </p>
          )}
        </Field>

        <Field
          label={LABELS.time}
          htmlFor={id("time")}
          error={errors.time}
          errorId={errorId("time")}
        >
          <select
            data-field="time"
            id={id("time")}
            name="time"
            value={values.time}
            onChange={(e) => set("time", e.target.value)}
            aria-invalid={Boolean(errors.time)}
            aria-describedby={errors.time ? errorId("time") : undefined}
            className={control(Boolean(errors.time))}
          >
            <option value="">Choose a time</option>
            {site.booking.timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={LABELS.lessonType}
          htmlFor={id("lessonType")}
          error={errors.lessonType}
          errorId={errorId("lessonType")}
          className="sm:col-span-2"
        >
          <select
            data-field="lessonType"
            id={id("lessonType")}
            name="lessonType"
            value={values.lessonType}
            onChange={(e) => set("lessonType", e.target.value)}
            aria-invalid={Boolean(errors.lessonType)}
            aria-describedby={
              errors.lessonType ? errorId("lessonType") : undefined
            }
            className={control(Boolean(errors.lessonType))}
          >
            <option value="">Choose a lesson type</option>
            {site.booking.lessonTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={LABELS.message}
          hint="Optional. Nerves, previous lessons, access needs — anything useful."
          htmlFor={id("message")}
          className="sm:col-span-2"
        >
          <textarea
            id={id("message")}
            name="message"
            rows={3}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            className={`${control(false)} h-auto py-3 leading-relaxed`}
          />
        </Field>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="btn-primary">
          <MessageCircle className="size-4" aria-hidden="true" />
          Send on WhatsApp
        </button>
        <p className="max-w-[26rem] text-[0.86rem] text-muted-foreground">
          Opens WhatsApp with your details ready to send. Nothing is charged,
          and nothing is stored on this site.
        </p>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- helpers */

function control(invalid: boolean) {
  return [
    "h-12 w-full rounded-xl border bg-white px-3.5 text-[0.97rem] text-ink",
    "outline-none transition-colors placeholder:text-muted-foreground",
    invalid ? "border-destructive" : "border-input hover:border-ink/25",
  ].join(" ");
}

function Field({
  label,
  hint,
  error,
  htmlFor,
  errorId,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  errorId?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-[0.92rem] font-medium text-ink"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-2 text-[0.83rem] text-muted-foreground">{hint}</p>
      )}
      {error && errorId && (
        <p
          id={errorId}
          className="mt-2 text-[0.86rem] font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
