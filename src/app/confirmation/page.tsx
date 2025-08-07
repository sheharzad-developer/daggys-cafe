import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ConfirmationPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-primary/20 text-primary rounded-full p-4 w-fit">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <CardTitle className="font-headline text-3xl mt-6">Order Confirmed!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for your purchase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your healthy and delicious meals are being prepared and will be on their way to you shortly. You'll receive an email confirmation with your order details.
          </p>
          <Button asChild size="lg" className="font-bold mt-4">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
