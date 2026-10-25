import { useQuery } from '@tanstack/react-query';
import { Mail, MapPin, Phone, Users } from 'lucide-react';
import { agentsApi } from '../lib/api';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { ButtonLink } from '../components/ButtonLink';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { PageHeader } from '../components/PageHeader';
import { Reveal } from '../components/Reveal';
import { Skeleton } from '../components/Skeleton';

function AgentCardSkeleton() {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex h-64 items-center justify-center bg-gradient-to-br from-gold/10 to-gold/5">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </Card>
  );
}

export function Agents() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentsApi.getAll(),
  });

  const agents = data?.data.agents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <PageHeader
          align="center"
          title="Meet Our"
          accent="Expert Team"
          description="Our passionate real estate professionals are dedicated to helping you find your perfect home. With years of experience across New York and New Jersey, we're here to guide you every step of the way."
          className="mb-16"
        />

        {/* Agents Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {Array.from({ length: 3 }).map((_, index) => (
              <AgentCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            className="mb-16"
            title="Unable to load our team"
            description="Something went wrong while fetching our agents. Please try again."
            onRetry={() => refetch()}
          />
        ) : !agents || agents.length === 0 ? (
          <EmptyState
            className="mb-16"
            icon={Users}
            title="Our team is growing"
            description="Check back soon, or reach out to us directly."
            action={
              <ButtonLink href="tel:929-488-3666">
                <Phone className="h-5 w-5" aria-hidden="true" />
                Call 929-488-3666
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {agents.map((agent, index) => (
              <Reveal key={agent.id} delay={(index % 3) * 100}>
                <Card hover padding="none" className="h-full overflow-hidden border-gold/20">
                  {/* Agent Photo */}
                  <div className="relative h-64 bg-gradient-to-br from-gold/10 to-gold/5">
                    <Avatar
                      src={agent.photoUrl}
                      alt={agent.name}
                      size="xl"
                      className="mx-auto mt-8 shadow-2xl"
                    />
                    <Badge className="absolute top-4 right-4 bg-gold text-black border-transparent">
                      Licensed Agent
                    </Badge>
                  </div>

                  {/* Agent Info */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                    <p className="mb-4 flex items-center gap-2 font-semibold text-gold">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {agent.phone}
                    </p>

                    {agent.bio && (
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{agent.bio}</p>
                    )}

                    <div className="space-y-3">
                      <ButtonLink href={`mailto:${agent.email}`} fullWidth>
                        <Mail className="h-5 w-5" aria-hidden="true" />
                        Send Email
                      </ButtonLink>

                      <ButtonLink href={`tel:${agent.phone}`} variant="outline" fullWidth>
                        <Phone className="h-5 w-5" aria-hidden="true" />
                        Call Now
                      </ButtonLink>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <Reveal>
          <div className="bg-gradient-dark rounded-2xl p-8 md:p-12 text-center border-4 border-gold">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Work With Our <span className="text-gold">Expert Team</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Our agents are standing by to help you buy, sell, or invest in real estate. Contact
              us today for a free consultation!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ButtonLink href="tel:929-488-3666" size="lg" className="min-w-[200px]">
                <Phone className="h-5 w-5" aria-hidden="true" />
                Call 929-488-3666
              </ButtonLink>
              <ButtonLink
                href="mailto:info@topchoicerealty.com"
                size="lg"
                variant="outline"
                className="min-w-[200px]"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
                Send Email
              </ButtonLink>
            </div>

            <div className="mt-8 pt-8 border-t border-gold/30">
              <p className="flex items-center justify-center gap-2 text-gold font-semibold text-lg">
                <MapPin className="h-5 w-5" aria-hidden="true" />
                Serving New York &amp; New Jersey
              </p>
              <p className="text-gray-400 text-sm mt-2">Licensed Real Estate Professionals</p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
