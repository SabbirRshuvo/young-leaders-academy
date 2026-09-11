import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-navy text-white py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gold bg-navy text-gold font-bold text-xl">
                YLA
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-tight tracking-wider">YOUNG LEADERS</div>
                <div className="flex items-center gap-2">
                  <div className="h-[1px] w-8 bg-gold"></div>
                  <div className="text-[10px] font-semibold text-gold tracking-[0.2em] leading-tight">ACADEMY</div>
                  <div className="h-[1px] w-8 bg-gold"></div>
                </div>
              </div>
            </Link>
            <p className="text-white text-sm font-bold leading-relaxed max-w-[250px]">
              One Academy. One Journey.<br/>A Lifetime of Impact.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gold hover:text-gold transition-all"><FaFacebook className="w-4 h-4" /></Link>
              <Link href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gold hover:text-gold transition-all"><FaInstagram className="w-4 h-4" /></Link>
              <Link href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gold hover:text-gold transition-all"><FaLinkedin className="w-4 h-4" /></Link>
              <Link href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-300 hover:border-gold hover:text-gold transition-all"><FaYoutube className="w-4 h-4" /></Link>
            </div>
          </div>
          
          <div className="space-y-6 lg:pl-8">
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/" className="hover:text-gold transition-colors flex items-center justify-between group">Home <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span></Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors flex items-center justify-between group">About <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span></Link></li>
              <li><Link href="/programs" className="hover:text-gold transition-colors flex items-center justify-between group">Programs <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span></Link></li>
              <li><Link href="/universities" className="hover:text-gold transition-colors flex items-center justify-between group">Universities <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span></Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors flex items-center justify-between group">Contact <span className="opacity-0 group-hover:opacity-100 transition-opacity">›</span></Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                <span>info@ylaacademy.com</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white mb-6">Newsletter</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Get the latest updates, program news and inspiring stories.
            </p>
            <form className="flex flex-col gap-3 pt-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex h-10 w-full rounded-sm bg-white px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                required
              />
              <button 
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-sm bg-gold px-4 text-sm font-bold text-navy shadow hover:bg-gold/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-xs text-gray-400 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Young Leaders Academy. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
