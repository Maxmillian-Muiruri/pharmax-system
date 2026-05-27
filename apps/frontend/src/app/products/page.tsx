import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectItem } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Filter, Search, Grid3x3, List, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Separator } from '../../components/ui/separator';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { productApi } from '../../services/api';

interface Product {
  id: string | number;
  name: string;
  image: string;
  category: string;
  use?: string;
  description?: string;
  rating: number;
  price: number;
  discount?: number;
  originalPrice?: number;
  stock?: boolean;
  inStock?: boolean;
  reviewCount?: number;
}

export const ProductList = () => {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState('all');
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  useEffect(() => {
    productApi.getAll()
      .then(res => {
        const fetchProducts = res.data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          image: p.image || '',
          category: p.category || 'General',
          description: p.description,
          rating: p.rating || 0,
          price: Number(p.price),
          originalPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          inStock: p.stock > 0,
          stock: p.stock > 0
        }));
        setAllProducts(fetchProducts);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const categories = Array.from(new Set(allProducts.map(p => p.category))).sort();

  let filteredProducts = allProducts.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.use?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }

    if (priceRange === 'under-500' && product.price >= 500) return false;
    if (priceRange === '500-1500' && (product.price < 500 || product.price > 1500)) return false;
    if (priceRange === '1500-3000' && (product.price < 1500 || product.price > 3000)) return false;
    if (priceRange === 'over-3000' && product.price <= 3000) return false;

    if (showInStockOnly && !product.inStock) return false;

    return true;
  });

  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange('all');
    setShowInStockOnly(false);
    setSearchQuery('');
  };

  const activeFiltersCount =
    selectedCategories.length +
    (priceRange !== 'all' ? 1 : 0) +
    (showInStockOnly ? 1 : 0);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: String(product.id),
      name: product.name,
      category: product.category,
      brand: 'PharmX',
      packSize: '1 pack',
      unitPrice: product.price,
      quantity: 1,
      requiresPrescription: false,
      stockStatus: product.inStock === false ? 'out_of_stock' : 'in_stock',
      stockCount: product.inStock === false ? 0 : undefined,
      imageType: 'tablet',
      image: product.image,
    });

    addToast({
      type: 'success',
      message: `${product.name} added to cart!`,
      duration: 3000
    });
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="mb-4">
            {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Separator />

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <Label
                htmlFor={category}
                className="text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-prices"
              checked={priceRange === 'all'}
              onCheckedChange={() => setPriceRange('all')}
            />
            <Label htmlFor="all-prices" className="text-sm cursor-pointer">
              All Prices
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="under-500"
              checked={priceRange === 'under-500'}
              onCheckedChange={() => setPriceRange('under-500')}
            />
            <Label htmlFor="under-500" className="text-sm cursor-pointer">
              Under KES 500
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="500-1500"
              checked={priceRange === '500-1500'}
              onCheckedChange={() => setPriceRange('500-1500')}
            />
            <Label htmlFor="500-1500" className="text-sm cursor-pointer">
              KES 500 - 1500
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="1500-3000"
              checked={priceRange === '1500-3000'}
              onCheckedChange={() => setPriceRange('1500-3000')}
            />
            <Label htmlFor="1500-3000" className="text-sm cursor-pointer">
              KES 1500 - 3000
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="over-3000"
              checked={priceRange === 'over-3000'}
              onCheckedChange={() => setPriceRange('over-3000')}
            />
            <Label htmlFor="over-3000" className="text-sm cursor-pointer">
              Over KES 3000
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={showInStockOnly}
              onCheckedChange={(checked) => setShowInStockOnly(checked === true)}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer">
              In Stock Only
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl mb-2">All Products</h1>
          <p className="text-lg text-white/90">
            Browse our complete range of medicines and health products
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="p-6 sticky top-4">
              <FilterSidebar />
            </Card>
          </aside>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-100"
                  />
                </div>

                <div className="w-full md:w-48">
                  <Select value={sortBy} onValueChange={setSortBy} className="bg-gray-100">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {allProducts.length} products
              </p>

              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(category => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {isLoading ? (
              <Card className="p-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-teal-600 animate-spin mb-4" />
                <h3 className="text-xl font-medium mb-2">Loading products...</h3>
              </Card>
            ) : filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map(product => (
                  viewMode === 'grid' ? (
                    <ProductCard
                      key={product.id}
                      product={product as any}
                      onAddToCart={handleAddToCart as any}
                    />
                  ) : (
                    <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant="secondary" className="text-xs mb-2">
                                {product.category}
                              </Badge>
                              <h3 className="text-lg font-medium">{product.name}</h3>
                            </div>
                            <div className="text-right">
                              <div className="text-xl text-teal-600 font-medium">
                                KES{product.price.toFixed(2)}
                              </div>
                              {product.originalPrice && (
                                <div className="text-sm text-gray-500 line-through">
                                  KES{product.originalPrice.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className={`text-xs px-2 py-1 rounded ${product.inStock
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.inStock}
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={clearFilters} className="bg-teal-600 hover:bg-teal-700">
                  Clear All Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};