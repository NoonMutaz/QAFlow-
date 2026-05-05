'use client';

import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

/* ───────────────── Types ───────────────── */

interface InputProps {
  label: string;
  name: string;
  value: string;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  focused: string | null;
  setFocused: (v: string | null) => void;
}

interface TextareaProps {
  label: string;
  name: string;
  value: string;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  focused: string | null;
  setFocused: (v: string | null) => void;
}

interface InfoProps {
  title: string;
  children: React.ReactNode;
}

/* ───────────────── Page ───────────────── */

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message is too short (min 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

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
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white px-6 py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <h1 className="text-4xl font-semibold text-gray-900">Contact us</h1>
          <p className="mt-3 text-gray-600">
            Have a bug, feature request, or question? We usually reply within 3
            days.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* FORM */}
          <div className="border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition duration-300">
            {submitted ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Message sent successfully!
                </h2>

                <p className="text-gray-600 mb-8">
                  We’ll get back to you within 3 days.
                </p>

                <button
                  onClick={() => setSubmitted(false)}
                  className="text-blue-600 font-semibold hover:underline text-sm"
                >
                  Send another message →
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl">
                    {error}
                  </div>
                )}

                <Input
                  label="Full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                  errors={errors}
                />

                <Input
                  label="Email address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                  type="email"
                  errors={errors}
                />

                <Input
                  label="Subject (optional)"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                  errors={errors}
                />

                <Textarea
                  label="Your message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  focused={focused}
                  setFocused={setFocused}
                  errors={errors}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-black text-white font-semibold text-lg
                             flex items-center justify-center gap-3
                             hover:bg-gray-900 active:scale-[0.98] transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {loading ? 'Sending message...' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          {/* SIDE INFO */}
          <div className="flex flex-col justify-center space-y-8 text-sm">
            <Info title="  Email">
              support@qaflow.com
            </Info>

            <Info title=" Response time">
              Within 3 business days
            </Info>

            {/* <Info title="  What we help with">
              Bugs, feature requests, billing, account issues
            </Info> */}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── Components ───────────────── */

function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  focused,
  setFocused,
  errors,
}: InputProps) {
  const isActive = focused === name || value;
  const hasError = errors[name];

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused(null)}
          className={`w-full border rounded-xl px-4 pt-5 pb-2 text-sm outline-none transition-all duration-200
            ${hasError 
              ? 'border-red-300 bg-red-50 focus:border-red-400' 
              : isActive 
                ? 'border-black shadow-sm' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
        />
        <label
          className={`absolute left-4 transition-all duration-200 pointer-events-none
            ${isActive
              ? 'top-1 text-xs text-gray-500'
              : 'top-3 text-sm text-gray-400'
            } ${hasError && 'text-red-500'}`}
        >
          {label}
        </label>
      </div>

      {hasError && (
        <p className="text-xs text-red-600 mt-1 pl-3">{errors[name]}</p>
      )}
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
  errors,
}: TextareaProps) {
  const isActive = focused === name || value;
  const hasError = errors[name];

  return (
    <div className="space-y-1">
      <div className="relative">
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused(null)}
          rows={5}
          className={`w-full border rounded-xl px-4 pt-5 pb-3 text-sm outline-none transition-all duration-200 resize-vertical
            ${hasError 
              ? 'border-red-300 bg-red-50 focus:border-red-400' 
              : isActive 
                ? 'border-black shadow-sm' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
        />
        <label
          className={`absolute left-4 transition-all duration-200 pointer-events-none
            ${isActive
              ? 'top-1 text-xs text-gray-500'
              : 'top-3 text-sm text-gray-400'
            } ${hasError && 'text-red-500'}`}
        >
          {label}
        </label>
      </div>

      {hasError && (
        <p className="text-xs text-red-600 mt-1 pl-3">{errors[name]}</p>
      )}
    </div>
  );
}

function Info({ title, children }: InfoProps) {
  return (
    <div className="group">
      <p className="font-semibold text-gray-900 mb-1">{title}</p>
      <p className="text-gray-600 group-hover:text-gray-900 transition-colors">
        {children}
      </p>
    </div>
  );
}