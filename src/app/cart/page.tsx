
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import WorkingAmazonCart from "@/lib/working-amazon-cart";

export default function CartPage() {
  const { state, dispatch } = useCart();

  const handleQuantityChange = (supplementName: string, quantity: number) => {
    if (quantity >= 0) {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { supplementName, quantity },
      });
    }
  };

  const handleRemoveItem = (supplementName: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { supplementName } });
  };

  const subtotal = state.items.reduce((total, item) => {
    // Handle both string and number price formats
    let price = 0;
    if (typeof item.price === 'string') {
      price = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
    } else if (typeof item.price === 'number') {
      price = item.price;
    }
    return total + price * item.quantity;
  }, 0);

  const handleAmazonCheckout = async () => {
    // Convert cart items to the format expected by WorkingAmazonCart
    const cartItems = state.items.map(item => ({
      name: item.supplementName, // Use supplement name instead of ASIN
      quantity: item.quantity
    }));

    if (cartItems.length === 0) {
      alert('No items in cart');
      return;
    }

    try {
      console.log('🛒 Processing Amazon checkout with items:', cartItems);
      const cartUrl = await WorkingAmazonCart.addToCart(cartItems);
      
      // Redirect to Amazon cart
      window.open(cartUrl, '_blank');
    } catch (error) {
      console.error('❌ Error processing Amazon checkout:', error);
      alert('Error processing checkout. Please try again or use individual product links.');
    }
  };


  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold font-headline mb-8">Your Cart</h1>
      {state.items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link href="/advisor">Find Supplements</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          <div className="flex flex-col gap-4">
            {state.items.map((item) => (
              <Card key={item.supplementName} className="flex items-center p-4">
                <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={item.imageUrl || "https://placehold.co/100x100.png"}
                    alt={item.supplementName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4 flex-grow">
                  <h2 className="font-semibold">{item.supplementName}</h2>
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                  <p className="font-bold">{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.supplementName, parseInt(e.target.value, 10))}
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const productUrl = WorkingAmazonCart.getProductCartUrl(item.supplementName, 1);
                      if (productUrl) {
                        window.open(productUrl, '_blank');
                      }
                    }}
                  >
                    View on Amazon
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.supplementName)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAmazonCheckout} className="w-full">
                  Checkout on Amazon
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
