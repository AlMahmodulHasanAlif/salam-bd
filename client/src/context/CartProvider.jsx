import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../api/cartApi";
import { AuthContext } from "./AuthContext";
import { getGuestId } from "./AuthProvider";
import toast from "react-hot-toast";

export const CartContext = createContext(null);

const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const userEmail = user?.email || getGuestId();

  // FETCH CART
  const fetchCart = useCallback(async () => {
    try {
      const res = await getCart(userEmail);
      setItems(res.data || []);
    } catch (e) {
      console.error("Cart fetch failed:", e);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ADD ITEM
  const addItem = async (product, quantity = 1) => {
    setCartLoading(true);
    try {
      await addToCart({
        userEmail,
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        variantLabel: product.variantLabel || null,
        selectedVariant: product.selectedVariant || null,
        freeDelivery: product.freeDelivery || false,
      });

      await fetchCart();
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  // UPDATE QTY ✅ FIXED
  const updateQty = async (cartItemId, quantity) => {
    if (quantity < 1) return;

    try {
      await updateCartItem(cartItemId?.toString(), quantity);
      await fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  // REMOVE ITEM ✅ FIXED
  const removeItem = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId?.toString());
      await fetchCart();
      toast.success("Removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  // CLEAR CART
  const emptyCart = async () => {
    try {
      await clearCart(userEmail);
      setItems([]);
    } catch (e) {
      console.error("Clear cart failed:", e);
    }
  };

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartLoading,
        cartCount,
        cartTotal,
        addItem,
        updateQty,
        removeItem,
        emptyCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;