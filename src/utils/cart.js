export const getCartItems = () => {
  if (typeof window === 'undefined') return [];

  const items = localStorage.getItem('glowe_cart');
  return items ? JSON.parse(items) : [];
};

export const setCartItems = (items) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem('glowe_cart', JSON.stringify(items));
};

export const addToCart = (product, quantity = 1) => {
  const items = getCartItems();

  const existingItem = items.find(
    (item) => item.product.id === product.id
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    items.push({ product, quantity });
  }

  setCartItems(items);
  return items;
};

export const updateCartQuantity = (productId, quantity) => {
  const items = getCartItems();

  const item = items.find(
    (item) => item.product.id === productId
  );

  if (item) {
    item.quantity = quantity;

    if (quantity <= 0) {
      return removeFromCart(productId);
    }
  }

  setCartItems(items);
  return items;
};

export const removeFromCart = (productId) => {
  const items = getCartItems().filter(
    (item) => item.product.id !== productId
  );

  setCartItems(items);
  return items;
};

export const clearCart = () => {
  setCartItems([]);
  return [];
};

export const getCartTotal = () => {
  const items = getCartItems();

  return items.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );
};

export const getCartCount = () => {
  const items = getCartItems();

  return items.reduce(
    (count, item) => count + item.quantity,
    0
  );
};

// Wishlist Functions

export const getWishlistItems = () => {
  if (typeof window === 'undefined') return [];

  const items = localStorage.getItem('glowe_wishlist');

  return items ? JSON.parse(items) : [];
};

export const setWishlistItems = (items) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    'glowe_wishlist',
    JSON.stringify(items)
  );
};

export const addToWishlist = (product) => {
  const items = getWishlistItems();

  if (!items.find((item) => item.id === product.id)) {
    items.push(product);
    setWishlistItems(items);
  }

  return items;
};

export const removeFromWishlist = (productId) => {
  const items = getWishlistItems().filter(
    (item) => item.id !== productId
  );

  setWishlistItems(items);
  return items;
};

export const isInWishlist = (productId) => {
  return getWishlistItems().some(
    (item) => item.id === productId
  );
};