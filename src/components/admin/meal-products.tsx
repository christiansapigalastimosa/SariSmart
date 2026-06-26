import CategoryProductSection, { CategoryProductSectionProps } from "./category-product-section";

type MealProductsProps = Omit<CategoryProductSectionProps, "title">;

export default function MealProducts(props: MealProductsProps) {
  return <CategoryProductSection title="Meal" {...props} />;
}
