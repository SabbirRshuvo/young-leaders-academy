import { User, Brain, Flag, Briefcase, HeartPulse, Users, Home } from 'lucide-react';

const pillars = [
  {
    name: 'SELF',
    icon: User,
    points: ['Identity', 'Values', 'Confidence', 'Purpose', 'Discipline'],
  },
  {
    name: 'MIND',
    icon: Brain,
    points: ['Critical Thinking', 'AI & Technology', 'Innovation', 'Problem Solving', 'Creativity'],
  },
  {
    name: 'LEADERSHIP',
    icon: Flag,
    points: ['Leadership', 'Communication', 'Influence', 'Public Speaking', 'Teamwork'],
  },
  {
    name: 'CAREER',
    icon: Briefcase,
    points: ['University Guidance', 'Career Planning', 'Entrepreneurship', 'Internships', 'Financial Literacy'],
  },
  {
    name: 'HEALTH',
    icon: HeartPulse,
    points: ['Sports & Fitness', 'Nutrition', 'Mental Wellbeing', 'Sleep & Recovery', 'Healthy Habits'],
  },
  {
    name: 'SOCIETY',
    icon: Users,
    points: ['Ethics & Integrity', 'Community Service', 'Social Intelligence', 'Patriotism', 'Global Awareness'],
  },
  {
    name: 'FAMILY',
    icon: Home,
    points: ['Parent Coaching', 'Teen Coaching', 'Parenting Skills', 'Family Communication', 'Stronger Relationships'],
  },
];

export default function Pillars() {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-gold"></div>
            <span className="text-gold font-bold tracking-widest text-sm">THE 7 PILLARS</span>
            <div className="h-[1px] w-12 bg-gold"></div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-navy">
            Holistic Development for a Brighter Future
          </h2>
          <p className="max-w-[700px] text-gray-500 md:text-lg">
            We nurture every aspect of a young person's growth, helping them build the skills,
            character and confidence to lead a meaningful life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={i} 
                className="flex flex-col items-center p-6 bg-white rounded-xl border-2 border-gold/40 hover:border-gold hover:shadow-lg transition-all duration-300"
              >
                <div className="p-4 rounded-full border-2 border-navy text-navy mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-bold mb-6 text-navy tracking-wider">{pillar.name}</h3>
                <ul className="text-xs text-gray-600 space-y-3 w-full text-left">
                  {pillar.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold mt-1 text-[10px]">●</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
