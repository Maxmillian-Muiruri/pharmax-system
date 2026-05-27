import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useFadeInOnScroll } from "../hooks/useFadeInOnScroll";
import type { Product } from "../types";

interface ProductsSectionProps {
  onAddToCart?: (product: Product) => void;
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Paracetamol 500mg Tablets",
    description: "Effective pain relief and fever reducer. Pack of 20 tablets.",
    price: 8.99,
    originalPrice: 12.99,
    rating: 4.5,
    reviewCount: 324,
    image:
      "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    category: "Pain Relief",
    inStock: true,
    stockStatus: "in-stock",
  },
  {
    id: 2,
    name: "Vitamin D3 2000 IU Capsules",
    description: "Support bone health and immune system. 60 capsules.",
    price: 24.99,
    rating: 4.8,
    reviewCount: 512,
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    category: "Vitamins",
    inStock: true,
    stockStatus: "low-stock",
  },
  {
    id: 3,
    name: "Blood Pressure Monitor",
    description: "Digital automatic blood pressure monitor with large display.",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.6,
    reviewCount: 203,
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    category: "Health Devices",
    inStock: true,
    stockStatus: "in-stock",
  },
  {
    id: 4,
    name: "Antiseptic Hand Sanitizer",
    description: "70% alcohol-based hand sanitizer. 500ml bottle.",
    price: 12.99,
    rating: 4.3,
    reviewCount: 156,
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    category: "Personal Care",
    inStock: true,
    stockStatus: "in-stock",
  },
  {
    id: 5,
    name: "Prescription Glasses Cleaner",
    description: "Professional lens cleaning solution. 100ml spray bottle.",
    price: 15.99,
    rating: 4.7,
    reviewCount: 89,
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    category: "Eye Care",
    inStock: false,
    stockStatus: "out-of-stock",
  },
  {
    id: 6,
    name: "Baby Formula Powder",
    description: "Nutritionally complete infant formula. 900g container.",
    price: 34.99,
    rating: 4.9,
    reviewCount: 445,
    image:
      "https://images.unsplash.com/photo-1544027993-37dbf4c8da96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    category: "Baby Care",
    inStock: true,
    stockStatus: "in-stock",
  },
  {
    id: 7,
    name: "Omega-3 Fish Oil Capsules",
    description: "High-quality fish oil supplement. 120 softgels.",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.4,
    reviewCount: 278,
    image:
      "https://images.unsplash.com/photo-1556909114-1ba90dd7d1be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    category: "Supplements",
    inStock: true,
    stockStatus: "low-stock",
  },
  {
    id: 8,
    name: "Digital Thermometer",
    description: "Fast and accurate digital thermometer. Oral/underarm use.",
    price: 19.99,
    rating: 4.2,
    reviewCount: 167,
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    category: "Health Devices",
    inStock: true,
    stockStatus: "in-stock",
  },
];

export function ProductsSection({ onAddToCart }: ProductsSectionProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();
  const [ref, isVisible] = useFadeInOnScroll();

  const categories = [
    "All",
    "Pain Relief",
    "Vitamins",
    "Health Devices",
    "Personal Care",
    "Baby Care",
    "Supplements",
  ];

  const filteredProducts =
    activeFilter === "All"
      ? sampleProducts
      : sampleProducts.filter((product) => product.category === activeFilter);

  return (
    <section className="py-24 bg-white">
      <div ref={ref} className={`fade-in-up ${isVisible ? "visible" : ""}`}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular health and wellness products
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={activeFilter === category ? "default" : "secondary"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/products")}
            >
              View All Products
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
