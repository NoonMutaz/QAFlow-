'use client';

import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  focused: string | null;
  setFocused: (v: string | null) => void;
}

interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  focused: string | null;
  setFocused: (v: string | null) => void;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await emailjs.sendForm(
        'service_uoyks5l',
        'template_ck7c3fj',
        formRef.current!,
        'zpVFF6nwrrdvxlnKb'
      );

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <h1 className="text-4xl font-semibold text-gray-900">
            Contact us
          </h1>
          <p className="mt-3 text-gray-600">
            Have a bug, feature request, or question? We usually reply within 3 days.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* FORM */}
          <div className="border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition">

            {submitted ? (
              <div className="py-16 text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Message sent  
                </h2>
                <p className="text-gray-600 mt-2">
                  We’ll get back to you shortly.
                </p>

                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-blue-600 font-medium hover:underline"
                >
                  Send another →
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                />

                <Input
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                  type="email"
                />

                <Input
                  label="Subject (optional)"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                />

                <Textarea
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-black text-white font-medium
                             hover:bg-gray-900 active:scale-[0.98] transition
                             disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send message"}
                </button>

              </form>
            )}
          </div>

          {/* SIDE INFO */}
          <div className="flex flex-col justify-center space-y-6 text-sm">

            <Info title="Email">
              support@qaflow.com
            </Info>

            <Info title="Response time">
              Within 3 days
            </Info>

            {/* <Info title="Best for">
              Bug reports, feedback, feature requests
            </Info> */}

          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------- components ---------- */

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  focused,
  setFocused,
}: InputProps) {
  return (
    <div className="relative">
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        onFocus={() => setFocused(name)}
        onBlur={() => setFocused(null)}
        className="w-full border rounded-lg px-3 py-2"
      />
      <label className="text-sm text-gray-600">{label}</label>
    </div>
  );
}
function Textarea({
  label,
  name,
  value,
  onChange,
  focused,
  setFocused,
}: TextareaProps) {
  return (
    <div className="relative">
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(name)}
        onBlur={() => setFocused(null)}
        className="w-full border rounded-lg px-3 py-2"
      />
      <label className="text-sm text-gray-600">{label}</label>
    </div>
  );
}
function Info({ title, children }) {
  return (
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-gray-600">{children}</p>
    </div>
  );
}