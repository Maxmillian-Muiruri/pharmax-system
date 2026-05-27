import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { useFadeInOnScroll } from "../hooks/useFadeInOnScroll";

interface BlogArticle {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  readingTime: number;
  image: string;
}

const articles: BlogArticle[] = [
  {
    id: 1,
    title: "5 Vitamins You Should Take Every Day",
    excerpt:
      "Discover the essential vitamins that support immunity, energy levels and overall wellbeing...",
    category: "Nutrition",
    categoryColor: "bg-green-100 text-green-700",
    readingTime: 5,
    image: "https://placehold.co/400x200/e8f5f7/1a7a8c?text=Health+Nutrition",
  },
  {
    id: 2,
    title: "How to Read a Prescription Label Correctly",
    excerpt:
      "Understanding your medication instructions is critical for safe and effective treatment...",
    category: "Medicine",
    categoryColor: "bg-[#e0f2f1] text-[#1a7a8c]",
    readingTime: 3,
    image: "https://placehold.co/400x200/e8f5f7/1a7a8c?text=Prescription",
  },
  {
    id: 3,
    title: "Managing Chronic Conditions with Smart Medication",
    excerpt:
      "Learn how digital pharmacy tools can help you stay consistent with long-term treatment plans...",
    category: "Wellness",
    categoryColor: "bg-blue-100 text-blue-700",
    readingTime: 7,
    image: "https://placehold.co/400x200/e8f5f7/1a7a8c?text=Wellness",
  },
];

export function BlogSection() {
  const [ref, isVisible] = useFadeInOnScroll();

  return (
    <section className="py-24 bg-white">
      <div ref={ref} className={`fade-in-up ${isVisible ? "visible" : ""}`}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#1a7a8c]/10 text-[#1a7a8c] hover:bg-[#1a7a8c]/20">
              From our blog
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              Health Tips & Insights
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert advice to help you live healthier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div
                key={article.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  <Badge
                    className={`absolute top-4 left-4 ${article.categoryColor}`}
                  >
                    {article.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-[#1a7a8c] transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {article.excerpt}
                  </p>

                  {/* Reading Time and Link */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{article.readingTime} min read</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-[#1a7a8c] hover:text-[#155d6e] p-0 h-auto font-semibold flex items-center gap-1"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
