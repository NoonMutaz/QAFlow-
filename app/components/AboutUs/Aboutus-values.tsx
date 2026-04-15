import React from "react";

export default function AboutusValues() {
  const values = [
    {
      title: "Innovation",
      description:
        "We use automation and smart workflows to simplify how teams handle testing and quality assurance.",
    },
    {
      title: "Collaboration",
      description:
        "QAFlow enables teams to stay aligned, share context, and move faster together.",
    },
    {
      title: "Efficiency",
      description:
        "From tracking to resolution, everything is designed to reduce friction and save time.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
            Our values
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl">
            Principles that shape how we build and improve QAFlow.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-10">
          {values.map((item, index) => (
            <div key={item.title} className="flex flex-col gap-4">

              {/* Number (cleaner than icons) */}
              <div className="text-sm font-medium text-gray-400">
                0{index + 1}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-sm">
                {item.description}
              </p>

              {/* subtle divider */}
              <div className="mt-2 h-px bg-gray-200 w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}