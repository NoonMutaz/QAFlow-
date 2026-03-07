import React from "react";

export default function TeamSection() {
  const teamMembers = [
    {
      name: "Noon Almutaz",
      role: "Frontend Developer",
      photo:
        "https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
      socials: [
        { name: "LinkedIn", link: "#", icon: " <FaLinkedin /> " },
        { name: "Twitter", link: "#", icon: "<FaTwitter />" },
        { name: "GitHub", link: "#", icon: "<FaGithub />" },
      ],
    },
    {
      name: "Jane Doe",
      role: "Backend Developer",
      photo:
        "https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
      socials: [
        { name: "LinkedIn", link: "#", icon: "<FaLinkedin />" },
        { name: "GitHub", link: "#", icon: "<FaGithub />" },
      ],
    },
    {
      name: "Michael Brown",
      role: "QA Engineer",
      photo:
        "https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
      socials: [
        { name: "LinkedIn", link: "#", icon: "<FaLinkedin />" },
        { name: "Twitter", link: "#", icon: " <FaTwitter />" },
      ],
    },
  ];

  return (
    <div>
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet the Team
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The talented individuals behind QAFlow
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Circular Photo */}
              <div className="relative w-40 h-40 mx-auto mt-6 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-full"></div>
              </div>

              {/* Info */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{member.role}</p>

                {/* Social Links */}
                {/* <div className="flex justify-center gap-3">
                  {member.socials.map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
