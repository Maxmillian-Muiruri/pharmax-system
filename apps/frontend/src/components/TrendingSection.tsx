import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface TrendingProduct {
  id: number;
  name: string;
  price: number;
  image: string;
}

const trendingProducts: TrendingProduct[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    price: 4.99,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Vitamin C 1000mg",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Omega-3 Fish Oil",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1556909114-1ba90dd7d1be?w=300&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Hand Sanitizer 500ml",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop",
  },
  {
    id: 5,
    name: "N95 Face Masks (10pk)",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=300&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Blood Pressure Monitor",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop",
  },
];

export function TrendingSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollerRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);

      scrollerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              Trending Now
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Hot Products This Week
            </h2>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {trendingProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-72 bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                  HOT
                </Badge>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
