import CategoryProductSection, { CategoryProductSectionProps } from "./category-product-section";

type DrinksProductsProps = Omit<CategoryProductSectionProps, "title">;

export default function DrinksProducts(props: DrinksProductsProps) {
  return <CategoryProductSection title="Drinks" {...props} />;
}
