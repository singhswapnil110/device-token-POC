/**
 * Utility function to convert array buffer to hexadecimal string
 * @param buffer The arraybuffer that needs to be converted
 * @returns Hexadecimal string
 */
export function bufferToHexadecimalString(buffer: ArrayBuffer) {
  const hexCodes = [];
  const view = new DataView(buffer);

  for (let i = 0; i < view.byteLength; i += 4) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    const value = view.getUint32(i);
    // toString(16) will give the hex representation of the number without padding
    const stringValue = value.toString(16);
    // We use concatenation and slice for padding
    const padding = "00000000";
    const paddedValue = (padding + stringValue).slice(-padding.length);
    hexCodes.push(paddedValue);
  }

  // Join all the hex strings into one
  return hexCodes.join("");
}

/**
 *
 * Generates an alpha-numeric hash from passed string
 * @param str The string to be hashed
 * @param algorithm The algorithm to be used for hashing
 * @returns Alpha-Numeric hash of length 16
 */
export const generateHash = async (
  str: string,
  algorithm: AlgorithmIdentifier
) => {
  // We transform the string into an arraybuffer.
  const buffer = new TextEncoder().encode(str);

  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  return bufferToHexadecimalString(hashBuffer);
};
