import React from 'react'

export default function Contactus() {
  return (
    <div>
       <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 md:p-12 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full filter blur-3xl"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Team</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              We're always looking for talented developers to help us improve the QA experience.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
