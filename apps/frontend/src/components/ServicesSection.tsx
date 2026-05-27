import { Badge } from "./ui/badge";
import {
  Headphones,
  Award,
  Shield,
  FileText,
  Truck,
  Bell,
  Stethoscope,
  Clock,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const services: Service[] = [
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    description:
      "Our dedicated team is available round the clock to assist you with any questions",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Award,
    title: "Licensed Pharmacists",
    description:
      "Expert advice from certified professionals to ensure your health and safety",
    color: "from-primary to-[#2d9caf]",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description:
      "Your transactions are protected with industry-leading encryption technology",
    color: "from-green-500 to-green-600",
  },
  {
    icon: FileText,
    title: "Easy Prescription Upload",
    description:
      "Upload your prescriptions digitally and get your medicines delivered fast",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Truck,
    title: "Free Home Delivery",
    description:
      "Enjoy free shipping on orders over $50, delivered right to your doorstep",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Bell,
    title: "Medicine Reminders",
    description:
      "Never miss a dose with our automated medication reminder system",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: Stethoscope,
    title: "Health Consultation",
    description:
      "Book virtual consultations with healthcare professionals from home",
    color: "from-red-500 to-red-600",
  },
  {
    icon: Clock,
    title: "Quick Refills",
    description: "Hassle-free prescription refills with just a few clicks",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment Options",
    description:
      "Multiple payment methods including insurance claims and installments",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: MapPin,
    title: "Multiple Locations",
    description:
      "Find us at convenient locations across your city for in-store pickup",
    color: "from-teal-500 to-teal-600",
  },
];

export function ServicesSection() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="text-center mb-20">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Our Services
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Complete Healthcare Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We provide comprehensive pharmacy services designed to make your
            healthcare experience seamless, convenient, and reliable
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4">
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${service.color} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <service.icon className="h-6 w-6 text-white" />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-between">
            <StatCard endValue={50} suffix="K+" label="Happy Customers" />
            <StatCard endValue={10} suffix="K+" label="Products Available" />
            <StatCard endValue={24} suffix="/7" label="Customer Support" />
            <StatCard
              endValue={99.9}
              suffix="%"
              label="Customer Satisfaction"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  endValue,
  suffix,
  label,
}: {
  endValue: number;
  suffix: string;
  label: string;
}) {
  const [ref, displayValue] = useCountUp(endValue, 2000, true, suffix);

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-[#2d9caf] p-6"
    >
      <div className="text-3xl font-bold text-[#1a7a8c] mb-2">
        {displayValue}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
