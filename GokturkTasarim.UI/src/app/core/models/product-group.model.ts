export interface ProductDto {
  id: string;
  productCode: string;
  name: string;
  slug: string;
  category: string;
  externalCategoryId: string;
  basePrice: number;
  unit: string;
  stockQuantity: number;
  inStock: boolean;
  description: string;
  imageUrl?: string;
  externalProductUrl?: string;
}

export interface ProductGroupPreviewDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  displayOrder: number;
  totalProductsCount: number;
  previewProducts: ProductDto[];
}

export interface PagedProductsResultDto {
  items: ProductDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface ProductGroupDetailDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  displayOrder: number;
  products: PagedProductsResultDto;
}

export interface AdminProductGroupDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  productIds: string[];
  productCount: number;
}

export interface CreateProductGroupDto {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  productIds: string[];
}

export interface UpdateProductGroupDto extends CreateProductGroupDto {
  id: string;
}
