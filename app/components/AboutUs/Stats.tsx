import React from "react";

export default function Stats() {
  const features = [
    {
      title: "Bug tracking",
      description: "Automated detection and structured workflows",
    },
    {
      title: "Analytics",
      description: "Real-time insights to monitor quality and performance",
    },
    {
      title: "Collaboration",
      description: "Keep your team aligned with shared context",
    },
  ];

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">

        {/* Grid */}
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">

          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="py-6 md:px-6 flex flex-col gap-2"
            >
              {/* Number (anchor) */}
              <span className="text-sm text-gray-400 font-medium">
                0{index + 1}
              </span>

              {/* Title */}
              <h3 className="text-base font-semibold text-gray-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}