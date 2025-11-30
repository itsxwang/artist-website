// handleCart.ts

type cartItem = { _id: string; quantity: number };

import { fetchArt } from "./handleArtworks";

export const getCartFromStorage = (): cartItem[] => {
  const cartJson = localStorage.getItem("cartItem");
  return cartJson ? JSON.parse(cartJson) : [];
};

export function addToCart(
  _id: string,
  quantityToAdd: number,
  updateUI?: () => void | undefined
) {
  const cart = getCartFromStorage();
  const cartItem = cart.find((item) => item._id === _id);

  let updatedCart;
  if (cartItem) {
    updatedCart = cart.map((item) =>
      item._id === _id
        ? { ...item, quantity: item.quantity + quantityToAdd }
        : item
    );
  } else {
    updatedCart = [...cart, { _id, quantity: quantityToAdd }];
  }
  localStorage.setItem("cartItem", JSON.stringify(updatedCart));
  if (updateUI) updateUI();
}

export async function addToCartFromOtherPage(
  _id: string,
  quantityToAdd: number
) {
  const artwork = await fetchArt(_id);
  if (!artwork) {
    return;
  }
  const localStorageArtwork = getCartFromStorage().find(
    (item) => item._id === _id
  );

  if (localStorageArtwork?.quantity == artwork.stock_quantity) {
    return;
  }

  if (
    localStorageArtwork &&
    localStorageArtwork.quantity + quantityToAdd > artwork.stock_quantity
  ) {
    quantityToAdd = artwork.stock_quantity - localStorageArtwork.quantity;
  } else if (quantityToAdd > artwork.stock_quantity) {
    quantityToAdd = artwork.stock_quantity;
  }

  addToCart(_id, quantityToAdd);
}

export function removeFromCart(
  _id: string,
  quantityToRemove: number,
  updateUI: () => void
) {
  // This function logic was correct and remains the same

  const cart = getCartFromStorage();
  const cartItem = cart.find((item) => item._id === _id);
  if (!cartItem) return;

  const isFullRemoval = quantityToRemove >= cartItem.quantity;

  let updatedCart;
  if (isFullRemoval) {
    updatedCart = cart.filter((item) => item._id !== _id);
  } else {
    updatedCart = cart.map((item) =>
      item._id === _id
        ? { ...item, quantity: item.quantity - quantityToRemove }
        : item
    );
  }
  localStorage.setItem("cartItem", JSON.stringify(updatedCart));
  updateUI();
}
