import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ProductDetailClient from "@/components/catalog/ProductDetailClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

  if (!product) return { title: 'Product Not Found' };

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${product.name} | ZiCash GH Limited`,
    description: product.specs.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.specs.slice(0, 160),
      images: [product.image_url, ...previousImages],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image_url, ...(product.image_urls || [])],
    "description": product.specs,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "offers": {
      "@type": "Offer",
      "url": `https://zicashgh.com/product/${product.id}`,
      "priceCurrency": "GHS",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <ProductDetailClient initialProduct={product} />
      </main>
      <Footer />
    </div>
  );
}