import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function WhoWeServe() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Students Card */}
          <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100">
            <div 
              className="w-full md:w-2/5 h-64 md:h-auto bg-cover bg-center"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}
            ></div>
            <div className="w-full md:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-8 bg-gold"></div>
                <span className="text-gold font-bold tracking-widest text-xs">WHO WE SERVE</span>
              </div>
              <h3 className="text-4xl font-extrabold text-navy mb-2">Students</h3>
              <p className="text-navy font-bold text-lg mb-4">Discover your potential.</p>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                We provide students with the tools, mentorship and opportunities to build confidence, develop essential skills and achieve their dreams.
              </p>
              <div>
                <Link 
                  href="/programs?audience=students" 
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gold px-6 text-sm font-bold text-navy hover:bg-gold/10 transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 text-gold" />
                </Link>
              </div>
            </div>
          </div>

          {/* Parents Card */}
          <div className="flex flex-col md:flex-row bg-navy rounded-lg overflow-hidden shadow-lg text-white">
            <div 
              className="w-full md:w-2/5 h-64 md:h-auto bg-cover bg-center"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}
            ></div>
            <div className="w-full md:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-[1px] w-8 bg-gold"></div>
              </div>
              <h3 className="text-4xl font-extrabold mb-2">Parents</h3>
              <p className="font-bold text-lg mb-4">Partner in the journey.</p>
              <p className="text-gray-300 mb-8 text-sm leading-relaxed">
                We support parents with expert guidance, resources and a trusted community to help their children grow and succeed.
              </p>
              <div>
                <Link 
                  href="/parents" 
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/50 px-6 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 text-gold" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
