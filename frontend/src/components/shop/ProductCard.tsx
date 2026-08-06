import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product.id);

  const primaryImage = product.images?.find(i => i.is_primary) ?? product.images?.[0];
  const secondaryImage = product.images?.find(i => !i.is_primary);

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    await addToCart(product, null, 1);
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    await toggle(product);
  }

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-[#2e1547] aspect-[3/4]">
        {/* Images */}
        {primaryImage && (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt_text ?? product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${secondaryImage ? 'group-hover:opacity-0' : ''}`}
          />
        )}
        {secondaryImage && (
          <img
            src={secondaryImage.url}
            alt={secondaryImage.alt_text ?? product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new_arrival && (
            <span className="badge bg-primary-600 text-white">New</span>
          )}
          {product.is_best_seller && (
            <span className="badge bg-neutral-900 text-white">Best Seller</span>
          )}
          {discount && discount > 0 && (
            <span className="badge bg-success-500 text-white">-{discount}%</span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full shadow flex items-center justify-center transition-all duration-200 ${
              wishlisted ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            <Heart size={16} className={wishlisted ? 'fill-white' : ''} />
          </button>
        </div>

        {/* Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full bg-neutral-900 dark:bg-[#3a1d5c] hover:bg-primary-700 dark:hover:bg-primary-600 text-white py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <ShoppingBag size={16} /> Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-3 px-1">
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">{product.category?.name}</p>
        <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-sm leading-tight truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <Star size={12} className="text-warning-500 fill-warning-500" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {Number.isFinite(product.rating) ? product.rating.toFixed(1) : '0.0'} ({product.review_count ?? 0})
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-semibold text-neutral-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
          {product.compare_price && (
            <span className="text-sm text-neutral-400 dark:text-neutral-500 line-through">₹{product.compare_price.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
