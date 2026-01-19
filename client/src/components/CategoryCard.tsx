import { Card, CardContent } from "./ui/card";

export const CategoryCard = ({ category, onClick }) => {
  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="aspect-square mb-2">
          <img
            src={category.image || "/api/placeholder/100/100"}
            alt={category.name}
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-sm text-center font-medium">{category.name}</p>
      </CardContent>
    </Card>
  );
};
