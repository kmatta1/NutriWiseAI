
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
    return total + price * item.quantity;
  }, 0);
  
  const affiliateTag = "nutriwiseai-20";

  // Construct the "Add to Cart" URL for Amazon
  const amazonCartUrl = new URL("https://www.amazon.com/gp/aws/cart/add.html");
  amazonCartUrl.searchParams.set("AssociateTag", affiliateTag);
  
  state.items.forEach((item, index) => {
    const itemNumber = index + 1;
    // The AI is prompted to generate a fake but valid-looking ASIN.
    // In a real application, you would map products to real ASINs.
    amazonCartUrl.searchParams.set(`ASIN.${itemNumber}`, item.asin || ''); 
    amazonCartUrl.searchParams.set(`Quantity.${itemNumber}`, item.quantity.toString());
  });


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
                 <Button asChild className="w-full">
                    <a href={amazonCartUrl.toString()} target="_blank" rel="noopener noreferrer">
                        Checkout on Amazon
                    </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
