import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<"personal" | "glory-grace" | undefined>();
  const { data: products, isLoading } = trpc.products.list.useQuery({
    limit: 20,
    offset: 0,
    category: selectedCategory,
  });

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({
      productId,
      quantity: 1,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-glow">Shop</h1>

        {/* Category Filter */}
        <div className="flex gap-4 mb-12">
          <Button
            onClick={() => setSelectedCategory(undefined)}
            variant={selectedCategory === undefined ? "default" : "outline"}
            className={selectedCategory === undefined ? "bg-[#00F7FF] text-black" : "border-[#00F7FF] text-[#00F7FF]"}
          >
            All Products
          </Button>
          <Button
            onClick={() => setSelectedCategory("personal")}
            variant={selectedCategory === "personal" ? "default" : "outline"}
            className={selectedCategory === "personal" ? "bg-[#00F7FF] text-black" : "border-[#00F7FF] text-[#00F7FF]"}
          >
            Prophet Dian's Products
          </Button>
          <Button
            onClick={() => setSelectedCategory("glory-grace")}
            variant={selectedCategory === "glory-grace" ? "default" : "outline"}
            className={selectedCategory === "glory-grace" ? "bg-[#FA00FF] text-black" : "border-[#FA00FF] text-[#FA00FF]"}
          >
            Glory & Grace
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[#00F7FF]" />
            </div>
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <Card key={product.id} className="prophet-card flex flex-col">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-[#00F7FF]">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-[#FA00FF]/20 text-[#FA00FF]">
                    {product.category === "personal" ? "Prophet Dian" : "Glory & Grace"}
                  </span>
                </div>
                <Button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={addToCartMutation.isPending || product.stock === 0}
                  className="w-full mt-4 bg-[#00F7FF] text-black hover:shadow-lg hover:shadow-[#00F7FF]/50"
                >
                  <ShoppingCart size={16} className="mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No products available in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
