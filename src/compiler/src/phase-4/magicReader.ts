import * as fs from "fs";

export interface MagicData {
  magic: number | null;
  shift: number | null;
  add: number | null;
}

export function getMagicAndShift(divisor: number): MagicData {
  // Load the JSON file once per run
  let magicTable: Record<
    string,
    { magic: number; shift: number; add: number }
  > = {};

  try {
    const data = fs.readFileSync("src/phase-4/magic_signed.json", "utf8");
    magicTable = JSON.parse(data);
  } catch (e) {
    console.error("Failed to load magic.json:", e);
    return { magic: null, shift: null, add: null };
  }

  const entry = magicTable[divisor.toString()];
  if (entry) {
    return { magic: entry.magic, shift: entry.shift, add: entry.add };
  } else {
    return { magic: null, shift: null, add: null };
  }
}

export function computeSignedMagic(d: number): MagicData {
  if (d === 0 || d === -1 || d === 1) {
    return { magic: null, shift: null, add: null };
  }
  const bits = 32;
  const two31 = 1n << 31n;

  const ad = BigInt(Math.abs(d));
  const dSign = d >> 31; // -1 if d < 0, 0 if d >= 0
  const t = two31 + BigInt(dSign);
  const anc = t - 1n - (t % ad);
  let q1 = two31 / anc;
  let r1 = two31 - q1 * anc;
  let q2 = two31 / ad;
  let r2 = two31 - q2 * ad;

  let p = 31;
  let delta: bigint;

  do {
    p++;
    q1 <<= 1n;
    r1 <<= 1n;
    if (r1 >= anc) {
      q1 += 1n;
      r1 -= anc;
    }

    q2 <<= 1n;
    r2 <<= 1n;
    if (r2 >= ad) {
      q2 += 1n;
      r2 -= ad;
    }

    delta = ad - r2;
  } while (q1 < delta || (q1 === delta && r1 === 0n));

  let magic = q2 + 1n;
  // if (d < 0) magic = -magic;

  // Convert BigInt to signed 32-bit number
  const final_magic = toSigned32(Number(magic));
  const shift = p - bits;
  const add = d > 0 && final_magic < 0 ? 1 : 0;

  return {
    magic: final_magic,
    shift,
    add,
  };
}

function toSigned32(n: number): number {
  return n << 0; // forces 32-bit signed interpretation
}
