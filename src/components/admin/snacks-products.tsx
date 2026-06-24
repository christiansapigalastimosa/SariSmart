import CategoryProductSection, { CategoryProductSectionProps } from "./category-product-section";

type SnacksProductsProps = Omit<CategoryProductSectionProps, "title">;

export default function SnacksProducts(props: SnacksProductsProps) {
  return <CategoryProductSection title="Snacks" {...props} />;
}
