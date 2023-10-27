import { customAlphabet } from "nanoid";

import { generateHash } from "./crypto";
import BrowserStorage from "./browserstorage";
export const WIDGET_FID_LOCAL_STORAGE_KEY = "razorpay_affordability_widget_fid";

const FINGERPRINT_SEED =
  "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * Linking Affordability widget to checkout
 *
 * We’ll be using the merchant's website’s localStorage to store data.
 * Use device fingerprinting(16 digit unique string generated using nanoid()) to identify the device and as such, the user.
 *
 * - create fingerprint from top level script and add as a property of tracking payload context along with widget_id
 * - pass same fingerprint to frame and detailedFrame via postMessage() and use the same fingerprint while tracking events.
 * - On checkout side, checkout will read fingerprint from localStorage through top level script (checkoutjs/open.js)
 * - set the fingerprint as a property of meta
 * - In checkoutFrame, read fingerprint via postMessage, and set fingerprint as meta property (using setMeta()).
 */

interface Fingerprint {
  id: string;
  version: string;
}

function setItemWithExpiry(key: string, value: Fingerprint, ttl: number) {
  const now = new Date();
  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    id: value.id,
    version: value.version,
    expiry: now.getTime() + ttl,
  };
  try {
    BrowserStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    return null;
  }
}

function getItemWithExpiry(key: string) {
  try {
    const itemStr = BrowserStorage.getItem(key);
    // if the item doesn't exist, return null
    if (!itemStr) {
      return null;
    }
    const item = JSON.parse(itemStr);
    // if the item is not an object or expity doesn't exists as a property of item, return null
    if (!item?.expiry) {
      return null;
    }

    const now = new Date();
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
      // If the item is expired, delete the item from storage
      // and return null
      BrowserStorage.removeItem(key);
      return null;
    }
    return item;
  } catch (e) {
    return null;
  }
}

const VERSION = "3"; // Increment this when making changes in fingerprint implementation.

/**
 *
 * Generates a fingerprint to identify the current device
 * If ip is passed an id generated using all device parameters will be used.
 * If ip is not passed a random id will be used.
 * @param ip
 * @returns
 */
async function generateFingerprint(ip?: string): Promise<Fingerprint> {
  let id: string;

  // If ip Address is provided the device is safari
  if (ip) {
    id = await generateDeviceId(ip);
  } else {
    const nanoid = customAlphabet(FINGERPRINT_SEED, 16);
    id = nanoid();
  }

  const fingerPrint = { id, version: VERSION };
  return fingerPrint;
}

async function getFingerprint(ip?: string) {
  let fingerPrint: Fingerprint | null = getItemWithExpiry(
    WIDGET_FID_LOCAL_STORAGE_KEY
  );
  const days = 30;
  const ttl = days * 24 * 60 * 60 * 1000; // Time to live 30 days
  if (!fingerPrint) {
    fingerPrint = await generateFingerprint(ip);
    setItemWithExpiry(WIDGET_FID_LOCAL_STORAGE_KEY, fingerPrint, ttl);
  }
  return fingerPrint;
}

export function getEncodedFingerprint(fingerPrint: string) {
  const encodedFingerprint = window.btoa(
    JSON.stringify({ id: fingerPrint, version: VERSION })
  );
  return encodedFingerprint;
}

/**
 * Return the unique fingerprint for the session
 * @param ip
 * @returns
 */
export async function getFingerprintId(ip?: string) {
  const fingerPrint = await getFingerprint(ip);
  return fingerPrint?.id;
}

export async function generateDeviceId(ipAddress: string) {
  const components = [
    // IP Address
    ipAddress,

    // User agent:
    navigator.userAgent,

    // Language:
    navigator.language,

    // TImezone Offset:
    new Date().getTimezoneOffset(),

    // Hardware Concurrency:
    navigator.hardwareConcurrency,

    // Color Depth:
    screen.colorDepth,

    // Device Memory:
    navigator.deviceMemory,

    // screen.width and screen.height can be exchanged due to device rotation
    screen.width + screen.height,

    screen.width * screen.height,

    window.devicePixelRatio,

    // If you're adding or removing any component,
    // make sure to increment DEVICE_ALGO_VERSION.
  ];

  const hash = await generateHash(components.join(), "SHA-256");
  return hash.substring(0, 16);
}
