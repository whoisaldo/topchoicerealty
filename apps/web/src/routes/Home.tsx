import { CheckCircle2, Home as HomeIcon, MapPin, Phone, Users } from 'lucide-react';
import { ButtonLink } from '../components/ButtonLink';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { SalesSlideshow } from '../components/SalesSlideshow';
import { cn } from '../lib/utils';
import heroImage from '../assets/hero.jpg';
import profileImage from '../assets/topchoicerealtypfp.jpg';

const stats = [
  { value: '10+', label: 'Years Experience' },
  { value: '500+', label: 'Happy Families' },
  { value: '100%', label: 'Client Satisfaction' },
];

const features = [
  {
    icon: Users,
    title: 'Expert Agents',
    description: 'Our experienced team knows NY & NJ markets inside and out',
    pulse: false,
  },
  {
    icon: HomeIcon,
    title: 'Wide Selection',
    description: 'Access to exclusive listings and off-market properties',
    pulse: false,
  },
  {
    icon: CheckCircle2,
    title: 'Client-Focused',
    description: 'Our passion is our clients - dedicated support every step of the way',
    pulse: true,
  },
];

export function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div
        className="relative flex items-center justify-center min-h-[560px] h-[calc(100svh-5rem)] max-h-[860px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.45)), url(${heroImage})`,
        }}
      >
        <div className="text-center text-white max-w-5xl px-4 animate-fade-in-up">
          <HomeIcon
            className="mx-auto mb-6 h-14 w-14 text-gold"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-2 tracking-tight">
            <span className="text-gold">TOP CHOICE</span> <span className="text-white">REALTY</span>
          </h1>
          <p className="text-gold/90 text-lg tracking-widest mb-8">REALTY LLC</p>
          <p className="text-2xl md:text-3xl mb-4 font-light text-gray-100">
            Our Passion is Our Clients
          </p>
          <p className="mb-10 flex items-center justify-center gap-2 text-lg md:text-xl text-gray-300">
            <MapPin className="h-5 w-5 text-gold" aria-hidden="true" />
            Serving New York and New Jersey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ButtonLink to="/listings" size="lg" className="min-w-[200px]">
              Browse Listings
            </ButtonLink>
            <ButtonLink href="tel:929-488-3666" size="lg" variant="outline" className="min-w-[200px]">
              <Phone className="h-5 w-5" aria-hidden="true" />
              929-488-3666
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Sales Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Reveal>
          <PageHeader
            as="h2"
            align="center"
            title="Recent"
            accent="Success Stories"
            description="See our latest successful transactions"
            className="mb-12"
          />
        </Reveal>

        <Reveal variant="scale" delay={150}>
          <SalesSlideshow />
        </Reveal>
      </div>

      {/* About Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal className="relative order-2 md:order-1">
              <div className="absolute inset-0 bg-gradient-gold opacity-10 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-dark rounded-3xl p-8 border-4 border-gold shadow-2xl">
                <div className="text-center">
                  <img
                    src={profileImage}
                    alt="Top Choice Realty"
                    className="w-48 h-48 mx-auto rounded-full object-cover border-4 border-gold shadow-2xl mb-6"
                  />
                  <h3 className="text-3xl font-bold text-gold mb-2">TOP CHOICE REALTY</h3>
                  <p className="text-gold/80 text-sm tracking-widest mb-4">REALTY LLC</p>
                  <div className="border-t border-gold/30 pt-4 space-y-2">
                    <p className="text-gray-300 text-lg">Our Passion is Our Clients</p>
                    <p className="flex items-center justify-center gap-2 text-gold/90 text-sm">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      Serving NY &amp; NJ
                    </p>
                    <a
                      href="tel:929-488-3666"
                      className="mt-4 flex items-center justify-center gap-2 text-gold font-bold text-2xl transition-colors hover:text-gold-light"
                    >
                      <Phone className="h-6 w-6" aria-hidden="true" />
                      929-488-3666
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150} className="order-1 md:order-2">
              <PageHeader as="h2" title="About" accent="Top Choice Realty" className="mb-6" />
              <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                Our passion is serving our clients across <strong>New York and New Jersey</strong>.
                We specialize in helping families and individuals find their perfect homes with
                personalized service and deep local market expertise.
              </p>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                Whether you&apos;re buying your first home, upgrading to a larger property, or
                looking for an investment opportunity, we&apos;re here to guide you through every
                step with integrity and dedication.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold">
                  <Phone className="h-6 w-6 text-black" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Call us today</p>
                  <a
                    href="tel:929-488-3666"
                    className="text-2xl font-bold text-gold transition-colors hover:text-gold-dark"
                  >
                    929-488-3666
                  </a>
                </div>
              </div>
              <ButtonLink to="/listings" size="lg">
                View All Properties
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-black py-16 border-y-2 border-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 100}>
                <div className="font-display text-5xl font-bold text-gold mb-2">{stat.value}</div>
                <p className="text-gray-300 text-lg">{stat.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <PageHeader
              as="h2"
              align="center"
              title="Why Choose"
              accent="Top Choice"
              className="mb-12"
            />
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 100}>
                <Card hover padding="lg" className="h-full text-center">
                  <div
                    className={cn(
                      'bg-gradient-gold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4',
                      feature.pulse && 'animate-pulse-slow'
                    )}
                  >
                    <feature.icon className="h-8 w-8 text-black" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black py-20 border-t-2 border-gold">
        <Reveal className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your <span className="text-gold">Dream Home</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Browse our current listings or contact our agents today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ButtonLink to="/listings" size="lg" className="min-w-[200px]">
              View Listings
            </ButtonLink>
            <ButtonLink href="tel:929-488-3666" size="lg" variant="outline" className="min-w-[200px]">
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call Now
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
