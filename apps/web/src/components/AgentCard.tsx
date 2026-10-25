import { Mail, Phone, User as UserIcon } from 'lucide-react';
import { User } from '../lib/types';
import { Avatar } from './Avatar';
import { Card } from './Card';

interface AgentCardProps {
  agent: User;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-gold/20">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <UserIcon className="h-5 w-5 text-gold" aria-hidden="true" />
        Contact Agent
      </h3>

      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar src={agent.photoUrl} alt={agent.name} size="lg" />

        <div className="flex-1 w-full">
          <h4 className="font-bold text-xl text-gray-900">{agent.name}</h4>
          {agent.bio && (
            <p className="text-sm text-gray-600 mt-2 p-3 bg-white rounded-lg border-l-4 border-gold">
              {agent.bio}
            </p>
          )}

          <div className="mt-4 space-y-3 bg-white p-4 rounded-lg">
            <a
              href={`mailto:${agent.email}`}
              className="group flex items-center justify-center gap-2 text-sm text-gray-700 transition-colors hover:text-gold"
            >
              <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span className="group-hover:underline">{agent.email}</span>
            </a>

            <a
              href={`tel:${agent.phone}`}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold-dark"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              {agent.phone}
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
