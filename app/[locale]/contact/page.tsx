import ContactHero from '@/components/contact/ContactHero';
import ContactFormSection from '@/components/contact/ContactFormSection';
import GlobalPresence from '@/components/contact/GlobalPresence';
import ContactImageBanner from '@/components/contact/ContactImageBanner';
import ContactCta from '@/components/contact/ContactCta';

export const metadata = {
  title: 'Contact Us | Young Leaders Academy',
  description: 'Get in touch with Young Leaders Academy. We are here to answer your questions about our programs, university pathways, and global opportunities.',
};

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start w-full bg-white">
      <ContactHero />
      <ContactFormSection />
      <GlobalPresence />
      <ContactImageBanner />
      <ContactCta />
    </main>
  );
}
