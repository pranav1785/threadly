"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, PLATFORM_COLORS } from "@/lib/utils";
import { Heart, Star, ExternalLink, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  className?: string;
}

export default function ProductCard({ product, onWishlist, isWishlisted, className }: ProductCardProps) {
  const router = useRouter();

  return (
    <article
      className={cn("bg-white rounded-[2rem] border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group", className)}
      onClick={() => router.push(`/product/${product.id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/product/${product.id}`)}
      aria-label={`${product.name} - ${formatPrice(product.price)}`}
    >
      {/* Image */}
      <div className="relative h-60 bg-gray-50 overflow-hidden m-2 rounded-[1.5rem]">
        <Image
          src={product.imageURL}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          loading="lazy"
        />
        {/* Discount badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-lg" aria-label={`${product.discount}% off`}>
            -{product.discount}%
          </div>
        )}
        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-full">Out of Stock</span>
          </div>
        )}
        {/* Wishlist button */}
        <button
          className={cn("absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200 cursor-pointer",
            isWishlisted ? "bg-accent text-white" : "bg-white/90 text-gray-500 hover:text-accent hover:bg-white"
          )}
          onClick={(e) => { e.stopPropagation(); onWishlist?.(product); }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Platform */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${PLATFORM_COLORS[product.platform]}15`, color: PLATFORM_COLORS[product.platform] }}>
            {product.platform}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1 text-xs text-amber-600" aria-label={`Rating: ${product.rating} out of 5`}>
              <Star className="w-3 h-3 fill-current" aria-hidden="true" />
              <span>{product.rating}</span>
              {product.reviews && <span className="text-muted">({(product.reviews / 1000).toFixed(1)}k)</span>}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-heading font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/product/${product.id}`}
            className="flex-1 btn-primary text-xs py-2 px-3"
            onClick={(e) => e.stopPropagation()}
            aria-label={`View details for ${product.name}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
            View Details
          </Link>
          {product.platformUrl && (
            <a
              href={product.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-border hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Buy on ${product.platform}`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
