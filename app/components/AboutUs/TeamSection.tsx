import React from "react";

export default function TeamSection() {
  const teamMembers = [
    {
      name: "Noon Almutaz",
      role: "Software Engineer",
      photo:
        "https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
      highlight: true,
      socials: [
        { name: "LinkedIn", icon: " ", link: "#" },
        { name: "GitHub", icon: " ", link: "#" },
      ],
    },
    {
      name: "Taif Alrashidi",
      role: "QA Engineer",
      photo:
        "https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
      socials: [
        { name: "LinkedIn", icon: " ", link: "#" },
        { name: "Twitter", icon: " ", link: "#" },
      ],
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Built by a focused engineering team
        </h2>

        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          QAFlow is built by engineers who care about speed, clarity, and real-world QA workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className={`rounded-2xl border p-6 text-center transition
              hover:-translate-y-1 hover:shadow-lg bg-white
              ${
                member.highlight
                  ? "border-blue-200 shadow-md"
                  : "border-blue-100"
              }
                  `
            
            }
          >
            {/* Avatar */}
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border border-gray-200">
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name */}
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {member.name}
            </h3>

            {/* Role */}
            <p className="text-sm text-gray-500">{member.role}</p>

            {/* Socials */}
            <div className="mt-4 flex justify-center gap-3">
              {member.socials.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-lg
                             hover:bg-gray-900 hover:text-white transition"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}