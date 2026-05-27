import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ImageWithFallback } from "../../components/fallbackImg/ImageWithFallback";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
}

interface Stat {
  label: string;
  value: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Pharmacist",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    description: "15+ years of experience in clinical pharmacy",
  },
  {
    name: "Michael Chen",
    role: "Quality Assurance Manager",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    description: "Ensuring highest standards in medication safety",
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Clinical Consultant",
    image:
      "https://images.unsplash.com/photo-1594824904353-77b30ba45c2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    description: "Specialized in patient consultation and care",
  },
  {
    name: "James Wilson",
    role: "Customer Service Director",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    description: "Dedicated to exceptional customer experience",
  },
];

const stats: Stat[] = [
  { label: "Years of Service", value: "10+" },
  { label: "Happy Customers", value: "50K+" },
  { label: "Products Available", value: "25K+" },
  { label: "Pharmacist Partners", value: "100+" },
];

export function AboutPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4">About Pharmacie Nouni</Badge>
          <h1 className="text-4xl lg:text-5xl mb-6 text-gray-900 font-bold">
            Your Trusted Health Partner Since 2014
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to providing authentic medications, expert
            healthcare advice, and exceptional service to help you live your
            healthiest life.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl text-primary font-bold mb-2">
                {stat.value}
              </div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardContent className="p-8">
              <div className="bg-cyan-100 p-3 rounded-full w-fit mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl mb-4 text-gray-900 font-bold">
                Our Mission
              </h3>
              <p className="text-gray-600">
                To make healthcare accessible and affordable for everyone by
                providing authentic medications, expert advice, and convenient
                delivery services that you can trust.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="bg-cyan-100 p-3 rounded-full w-fit mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="text-2xl mb-4 text-gray-900 font-bold">
                Our Vision
              </h3>
              <p className="text-gray-600">
                To become the most trusted online pharmacy, revolutionizing
                healthcare delivery through technology while maintaining the
                highest standards of pharmaceutical care and patient safety.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl text-center mb-12 text-gray-900 font-bold">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white p-4 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl mb-3 text-gray-900 font-semibold">
                Trust & Safety
              </h3>
              <p className="text-gray-600">
                Every medication is sourced from licensed manufacturers and
                verified by our qualified pharmacists.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white p-4 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl mb-3 text-gray-900 font-semibold">
                Speed & Convenience
              </h3>
              <p className="text-gray-600">
                Fast ordering, quick delivery, and 24/7 customer support to
                serve you whenever you need us.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-white p-4 rounded-full w-fit mx-auto mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl mb-3 text-gray-900 font-semibold">
                Care & Compassion
              </h3>
              <p className="text-gray-600">
                We treat every customer like family, providing personalized care
                and expert guidance for your health journey.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl text-center mb-12 text-gray-900 font-bold">
            Meet Our Expert Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center overflow-hidden">
                <CardContent className="p-6">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h4 className="text-lg mb-1 text-gray-900 font-semibold">
                    {member.name}
                  </h4>
                  <p className="text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-cyan-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl mb-6 text-gray-900 font-bold">
              Licensed & Certified
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏥</span>
                <span className="text-gray-700">FDA Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="text-gray-700">Licensed Pharmacy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                <span className="text-gray-700">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-gray-700">ISO 9001 Certified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
