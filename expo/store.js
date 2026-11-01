// The one in-app purchase: a non-consumable that unlocks the extra animals.
// Create a Non-Consumable product with this exact ID in App Store Connect.
import Constants, { ExecutionEnvironment } from 'expo-constants';

export const FRIENDS_SKU = 'com.unyo.babybubbles.friends';

// Expo Go has no store module, so purchases only work in a real build.
export const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let iap = null;
if (!inExpoGo) {
  try {
    iap = require('expo-iap');
  } catch {
    iap = null;
  }
}

export const storeAvailable = () => !!iap;

const owns = purchases => (purchases || []).some(p => p.productId === FRIENDS_SKU);

// Connects to the store and reports changes through the callbacks.
// Returns a cleanup function.
export function connectStore({ onUnlocked, onPrice, onError }) {
  if (!iap) return () => {};
  let alive = true;
  const subs = [
    iap.purchaseUpdatedListener(async purchase => {
      if (purchase.productId !== FRIENDS_SKU) return;
      try {
        await iap.finishTransaction({ purchase, isConsumable: false });
      } catch {}
      if (alive) onUnlocked(true);
    }),
    iap.purchaseErrorListener(error => {
      if (alive && !iap.isUserCancelledError(error)) onError(error?.message || 'Purchase failed.');
    }),
  ];
  (async () => {
    try {
      await iap.initConnection();
      const products = await iap.fetchProducts({ skus: [FRIENDS_SKU], type: 'in-app' });
      const product = (products || []).find(p => p.id === FRIENDS_SKU);
      if (alive && product) onPrice(product.displayPrice);
      if (alive && owns(await iap.getAvailablePurchases())) onUnlocked(true);
    } catch {}
  })();
  return () => {
    alive = false;
    subs.forEach(s => s.remove());
    iap.endConnection().catch(() => {});
  };
}

export async function buyFriends() {
  await iap.requestPurchase({
    request: { apple: { sku: FRIENDS_SKU }, google: { skus: [FRIENDS_SKU] } },
    type: 'in-app',
  });
}

// Returns true if the unlock was found.
export async function restoreFriends() {
  try {
    await iap.restorePurchases();
  } catch {}
  return owns(await iap.getAvailablePurchases());
}
