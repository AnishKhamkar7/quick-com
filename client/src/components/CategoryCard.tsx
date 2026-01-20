import { Card, CardContent } from "./ui/card";

export const CategoryCard = ({ category, Icon, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition"
    >
      <CardContent className="h-36 flex flex-col items-center justify-center gap-4 p-4">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-7 w-7 text-foreground" />
        </div>

        <p className="text-sm font-medium text-center leading-tight">
          {category.name}
        </p>
      </CardContent>
    </Card>
  );
};
