import React from "react";

export default function Contactus() {
  return (
    <section className="py-20 px-6 bg-white border-t border-gray-200">
      <div className="max-w-3xl mx-auto text-center">

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
          Get in touch
        </h2>

        {/* Description */}
        <p className="mt-3 text-gray-600">
          Have questions or feedback? We’d love to hear from you.
        </p>

        {/* CTA */}
        <div className="mt-8">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Contact us
          </a>
        </div>

      </div>
    </section>
  );
}