import Link from 'next/link';
import { GraduationCap, Users, Lightbulb, ArrowRight } from 'lucide-react';

const programs = [
  {
    title: 'Academic Excellence',
    desc: 'Build a strong academic foundation with expert guidance, personalized support and real-world learning.',
    icon: GraduationCap,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Leadership Development',
    desc: 'Develop confidence, communication and decision-making skills to become effective and compassionate leaders.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Innovation',
    desc: 'Explore creativity, technology and problem-solving to turn ideas into real-world solutions.',
    icon: Lightbulb,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  }
];

export default function FeaturedPrograms() {
  return (
    <section className="w-full py-16 md:py-24 bg-gray-50/50">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-gold"></div>
            <span className="text-gold font-bold tracking-widest text-xs">FEATURED PROGRAMS</span>
            <div className="h-[1px] w-12 bg-gold"></div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-navy">
            Build Skills. Create Opportunities.
          </h2>
          <p className="max-w-[800px] text-gray-500 md:text-lg">
            Our specialized programs are designed to develop future-ready leaders.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((prog, i) => {
            const Icon = prog.icon;
            return (
              <div key={i} className="flex flex-col bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div 
                  className="w-full h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${prog.image})` }}
                >
                  <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-full bg-gold flex items-center justify-center border-4 border-white shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="p-6 pt-10 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-3 text-navy">{prog.title}</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-1">{prog.desc}</p>
                  <div className="mt-auto">
                    <Link 
                      href={`/programs`} 
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-navy px-6 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
                    >
                      Enroll Now
                      <ArrowRight className="w-4 h-4 text-white" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
