import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./fallbackImg/ImageWithFallback";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  icon: string;
  category: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Prescription Medicines",
    description: "Get your prescribed medications",
    image:
      "https://images.unsplash.com/photo-1646392206581-2527b1cae5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVzY3JpcHRpb24lMjBtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzc1MDQwOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    icon: "💊",
    category: "prescription",
  },
  {
    id: 2,
    name: "Over-the-Counter",
    description: "Pain relief, cold & flu, allergies",
    image:
      "https://images.unsplash.com/photo-1595432576728-94e0e94a7663?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdmVyJTIwY291bnRlciUyMG1lZGljaW5lJTIwcGhhcm1hY3klMjBzaGVsdmVzfGVufDF8fHx8MTc3NTA0MDkwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    icon: "🏥",
    category: "otc",
  },
  {
    id: 3,
    name: "Vitamins & Supplements",
    description: "Boost your health naturally",
    image:
      "https://images.unsplash.com/photo-1763668331599-487470fb85b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXRhbWlucyUyMHN1cHBsZW1lbnRzJTIwYm90dGxlc3xlbnwxfHx8fDE3NzUwMTc2NTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    icon: "💊",
    category: "vitamins",
  },
  {
    id: 4,
    name: "Personal Care",
    description: "Skincare, oral care, hygiene",
    image:
      "https://images.unsplash.com/photo-1773754723152-0a31954e3036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMGNhcmUlMjBwcm9kdWN0cyUyMHNraW5jYXJlfGVufDF8fHx8MTc3NTA0MDkwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    icon: "🧴",
    category: "personal-care",
  },
  {
    id: 5,
    name: "Health Devices",
    description: "Blood pressure, thermometers",
    image:
      "https://images.unsplash.com/photo-1695048441386-0d6c4043d8c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhtZWRpY2FsJTIwaGVhbHRoJTIwZGV2aWNlcyUyMHRoZXJtb21ldGVyfGVufDF8fHx8MTc3NTA0MDkwOHww&ixlib=rb-4.1.0&q=80&w=1080",
    icon: "📱",
    category: "devices",
  },
  {
    id: 6,
    name: "Baby Care",
    description: "Everything for your little one",
    image:
      "https://images.unsplash.com/photo-1617858123189-b26eb62d8eb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwY2FyZSUyMHByb2R1Y3RzJTIwaXRlbXN8ZW58MXx8fHwxNzc1MDQwOTA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    icon: "👶",
    category: "baby",
  },
];

export function CategoriesSection() {
  const navigate = useNavigate();

  const handleCategoryClick = (categorySlug: string) => {
    navigate("/products", { state: { category: categorySlug } });
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find everything you need for your health and wellness journey
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border-2 border-cyan-200 hover:border-cyan-400 bg-gradient-to-br from-white to-cyan-50"
              onClick={() => handleCategoryClick(category.category)}
            >
              <CardContent className="p-0">
                <div className="relative h-36 overflow-hidden">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-36 object-cover group-hover:scale-110 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-teal-900/60 via-teal-800/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg group-hover:bg-cyan-500 group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl group-hover:scale-110 inline-block transition-transform duration-300">
                      {category.icon}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-white via-cyan-50/50 to-white">
                  <h3 className="text-xl mb-2 text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <span className="inline-block text-white bg-primary hover:bg-primary/90 group-hover:bg-cyan-600 px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md group-hover:shadow-lg">
                    Shop Now →
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
