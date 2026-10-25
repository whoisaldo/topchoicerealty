import 'dotenv/config';
import { supabase } from '../api/_lib/supabase.js';
import { hashPassword } from '../api/_lib/auth.js';

const SEED_PASSWORD = 'test12345';

// photo_url is left null: the old seed used '/src/assets/topchoicerealtypfp.jpg', which
// only resolves under the Vite dev server. AgentCard imports the bundled image directly
// and ignores this field; Profile.tsx falls back to a placeholder when it's empty.
const agents = [
  {
    email: 'john.doe@topchoicerealty.com',
    name: 'John Doe',
    phone: '929-488-3666',
    bio: "With over 8 years of experience in the New York real estate market, John specializes in luxury waterfront properties and historic homes. A Staten Island native, he understands the unique character of each neighborhood and helps clients navigate complex transactions with ease. John's attention to detail and personalized approach have earned him recognition as a top producer, consistently ranking in the top 5% of agents in the borough.",
  },
  {
    email: 'jane.lee@topchoicerealty.com',
    name: 'Jane Lee',
    phone: '929-488-3666',
    bio: 'Jane brings a fresh perspective to real estate with her background in interior design and her passion for helping families find their perfect home. Specializing in first-time homebuyers and young professionals, she makes the complex process of purchasing a home feel approachable and exciting. Her clients appreciate her patience, thoroughness, and ability to explain every step of the journey. Jane is fluent in English and Korean, serving a diverse community across Staten Island and Brooklyn.',
  },
  {
    email: 'ola.tleis@topchoicerealty.com',
    name: 'Ola Tleis',
    phone: '929-488-3666',
    bio: "Ola is a dedicated real estate professional with a deep understanding of the Staten Island and Brooklyn markets. Born and raised in the area, she has an intimate knowledge of local neighborhoods, schools, and community amenities. Ola specializes in investment properties and helps clients build wealth through strategic real estate decisions. Her analytical approach, combined with her warm personality, makes her a trusted advisor for both seasoned investors and first-time buyers. She's also a certified negotiation expert.",
  },
];

const listings = [
  {
    title: 'Beautiful Colonial Home with Water Views',
    address: '123 Seaside Ave',
    neighborhood: 'Great Kills',
    price: 750000,
    beds: 4,
    baths: 2.5,
    sqft: 2400,
    description:
      'Stunning colonial-style home featuring breathtaking water views. This spacious property includes a modern kitchen with granite countertops, hardwood floors throughout, and a large backyard perfect for entertaining. Close to schools, shopping, and transportation.',
    image_urls: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    ],
    status: 'active',
  },
  {
    title: 'Modern Townhouse in Prime Location',
    address: '456 Victory Blvd',
    neighborhood: 'St. George',
    price: 625000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    description:
      'Contemporary townhouse in the heart of St. George. Features include an open floor plan, stainless steel appliances, central air, and a private rooftop deck with Manhattan views. Walk to ferry, restaurants, and cultural attractions.',
    image_urls: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600607688960-e095ff83135b?w=800',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800',
    ],
    status: 'active',
  },
  {
    title: 'Spacious Ranch with Updated Kitchen',
    address: '789 Hylan Blvd',
    neighborhood: 'New Dorp',
    price: 550000,
    beds: 3,
    baths: 2,
    sqft: 1600,
    description:
      'Charming ranch home with recently renovated kitchen and bathrooms. Large living room with fireplace, finished basement, and two-car garage. Beautifully landscaped yard with patio. Excellent condition and move-in ready.',
    image_urls: [
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800',
      'https://images.unsplash.com/photo-1600566752229-250ed79470c1?w=800',
    ],
    status: 'active',
  },
  {
    title: 'Luxury Waterfront Estate',
    address: '1000 Ocean Terrace',
    neighborhood: 'Tottenville',
    price: 1250000,
    beds: 5,
    baths: 4,
    sqft: 4200,
    description:
      'Magnificent waterfront estate offering unparalleled luxury and privacy. Custom-built home with high-end finishes, gourmet kitchen, home theater, and wine cellar. Private dock and beach access. Truly one-of-a-kind property.',
    image_urls: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    ],
    status: 'active',
  },
  {
    title: 'Cozy Cape Cod Starter Home',
    address: '234 Richmond Ave',
    neighborhood: 'Eltingville',
    price: 425000,
    beds: 2,
    baths: 1,
    sqft: 1200,
    description:
      'Perfect starter home or investment property! Well-maintained Cape Cod style home with eat-in kitchen, hardwood floors, and full basement. Nice-sized yard with shed. Great opportunity for first-time buyers.',
    image_urls: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    ],
    status: 'active',
  },
  {
    title: 'Updated Split-Level with Pool',
    address: '567 Amboy Rd',
    neighborhood: 'Huguenot',
    price: 685000,
    beds: 4,
    baths: 3,
    sqft: 2200,
    description:
      'Beautifully updated split-level home featuring an in-ground pool and spacious deck. Modern kitchen with island, renovated bathrooms, and finished basement with home office. Quiet neighborhood close to schools and parks.',
    image_urls: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800',
    ],
    status: 'pending',
  },
  {
    title: 'Classic Victorian with Original Details',
    address: '890 Castleton Ave',
    neighborhood: 'Stapleton',
    price: 595000,
    beds: 3,
    baths: 2,
    sqft: 2000,
    description:
      'Meticulously maintained Victorian home with original architectural details. High ceilings, decorative moldings, and stained glass windows. Updated systems while preserving historic charm. Large corner lot with wrap-around porch.',
    image_urls: [
      'https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=800',
      'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800',
      'https://images.unsplash.com/photo-1600566752229-250ed79470c1?w=800',
    ],
    status: 'sold',
  },
  {
    title: 'Brand New Construction',
    address: '345 Arthur Kill Rd',
    neighborhood: 'Annadale',
    price: 799000,
    beds: 4,
    baths: 3.5,
    sqft: 2800,
    description:
      "Never lived in! Brand new construction with all the latest features and finishes. Open concept living, chef's kitchen with quartz countertops, smart home technology, and energy-efficient systems. Two-car garage and professionally landscaped.",
    image_urls: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
    ],
    status: 'active',
  },
];

async function seed() {
  console.log('🌱 Seeding Supabase...');

  // Only the seeded accounts are removed, never the whole users table: real accounts
  // created with `pnpm create-user` live alongside this demo data and must survive a
  // re-seed. Their listings, customers and inquiries cascade from the user row.
  console.log('🗑️  Clearing previously seeded data...');
  const { error: clearError } = await supabase
    .from('users')
    .delete()
    .in(
      'email',
      agents.map((agent) => agent.email)
    );
  if (clearError) throw clearError;

  console.log('👤 Creating agents...');
  const passwordHash = await hashPassword(SEED_PASSWORD);
  const { data: createdAgents, error: agentError } = await supabase
    .from('users')
    .insert(agents.map((agent) => ({ ...agent, password_hash: passwordHash, role: 'agent' })))
    .select('id, name, email');

  if (agentError) throw agentError;
  if (!createdAgents?.length) throw new Error('No agents were created');

  console.log('🏠 Creating listings...');
  const { error: listingError } = await supabase.from('listings').insert(
    listings.map((listing, index) => ({
      ...listing,
      agent_id: createdAgents[index % createdAgents.length].id,
    }))
  );

  if (listingError) throw listingError;

  console.log(`\n✅ ${createdAgents.length} agents, ${listings.length} listings`);
  console.log('\n📝 Test accounts (password for all: %s)', SEED_PASSWORD);
  for (const agent of createdAgents) {
    console.log(`   ${agent.name.padEnd(10)} ${agent.email}`);
  }
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
