import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { meals } from '@/lib/data';
import type { Meal } from '@/lib/data';
import { Flame, Beef, Wheat, Droplets, PlusCircle } from 'lucide-react';
import { AddToCartButton } from '@/components/add-to-cart-button';

const MealCard = ({ meal }: { meal: Meal }) => (
  <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="p-0">
      <div className="relative aspect-[4/3] w-full">
        <Image src={meal.image} alt={meal.name} fill className="object-cover" data-ai-hint={meal.dataAiHint} />
      </div>
      <div className="p-6 pb-2">
        <CardTitle className="font-headline text-2xl">{meal.name}</CardTitle>
        <CardDescription className="text-primary font-bold text-lg">${meal.price.toFixed(2)}</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-grow p-6 pt-0">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span>{meal.macros.calories} kcal</span>
        </div>
        <div className="flex items-center gap-2">
          <Beef className="w-5 h-5 text-primary" />
          <span>{meal.macros.protein}g Protein</span>
        </div>
        <div className="flex items-center gap-2">
          <Wheat className="w-5 h-5 text-primary" />
          <span>{meal.macros.carbs}g Carbs</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-primary" />
          <span>{meal.macros.fats}g Fats</span>
        </div>
      </div>
    </CardContent>
    <CardFooter className="p-6 pt-0">
      <AddToCartButton meal={meal} />
    </CardFooter>
  </Card>
);

export default function HomePage() {
  const categories = ['Burgers', 'Healthy Bowls', 'Desserts', 'Sides'];
  const categorizedMeals = categories.map(category => ({
    category,
    items: meals.filter(meal => meal.category === category),
  }));

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Discover Your Next Healthy Meal</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Delicious, macro-counted meals delivered right to your doorstep. Fuel your body the right way.</p>
      </div>

      {categorizedMeals.map(({ category, items }) => (
        <section key={category}>
          <h2 className="font-headline text-3xl font-bold mb-6 border-b-2 border-primary pb-2">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map(meal => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
