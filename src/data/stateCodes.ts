/**
 * Two-letter state / UT codes that appear in positions 7-8 of a CIN.
 *
 * basis:
 *  - 'evidenced' : the code was seen inside a real CIN on a public filing or registry page, or in an MCA
 *                  notice (see docs/research.md, section 3).
 *  - 'reference' : standard two-letter code (ISO 3166-2:IN / vehicle-style) that the ROC convention follows,
 *                  but not individually sampled from a real CIN during this assignment.
 *
 * Codes NOT included on purpose (could not be verified): LA (Ladakh), DH, OD, UK, TS.
 * A code that is missing here produces a "review" result, never a silent pass.
 */
export type StateBasis = 'evidenced' | 'reference';
export interface StateEntry {
  name: string;
  basis: StateBasis;
  note?: string;
}

export const STATE_CODES: Record<string, StateEntry> = {
  AN: { name: 'Andaman and Nicobar Islands', basis: 'reference' },
  AP: { name: 'Andhra Pradesh', basis: 'reference', note: 'MCA changed the CIN state code of Telangana companies from AP to TG.' },
  AR: { name: 'Arunachal Pradesh', basis: 'reference' },
  AS: { name: 'Assam', basis: 'reference' },
  BR: { name: 'Bihar', basis: 'reference' },
  CH: { name: 'Chandigarh', basis: 'reference' },
  CT: { name: 'Chhattisgarh', basis: 'evidenced' },
  DD: { name: 'Daman and Diu', basis: 'reference', note: 'Historical: Daman and Diu merged with Dadra and Nagar Haveli in 2020.' },
  DL: { name: 'Delhi', basis: 'evidenced' },
  DN: { name: 'Dadra and Nagar Haveli', basis: 'reference', note: 'Historical: merged with Daman and Diu in 2020.' },
  GA: { name: 'Goa', basis: 'reference' },
  GJ: { name: 'Gujarat', basis: 'reference' },
  HP: { name: 'Himachal Pradesh', basis: 'reference' },
  HR: { name: 'Haryana', basis: 'reference' },
  JH: { name: 'Jharkhand', basis: 'reference' },
  JK: { name: 'Jammu and Kashmir', basis: 'reference' },
  KA: { name: 'Karnataka', basis: 'evidenced' },
  KL: { name: 'Kerala', basis: 'reference' },
  LD: { name: 'Lakshadweep', basis: 'reference' },
  MH: { name: 'Maharashtra', basis: 'evidenced' },
  ML: { name: 'Meghalaya', basis: 'reference' },
  MN: { name: 'Manipur', basis: 'reference' },
  MP: { name: 'Madhya Pradesh', basis: 'reference' },
  MZ: { name: 'Mizoram', basis: 'reference' },
  NL: { name: 'Nagaland', basis: 'reference' },
  OR: { name: 'Odisha', basis: 'reference' },
  PB: { name: 'Punjab', basis: 'reference' },
  PY: { name: 'Puducherry', basis: 'reference' },
  RJ: { name: 'Rajasthan', basis: 'reference' },
  SK: { name: 'Sikkim', basis: 'reference' },
  TG: { name: 'Telangana', basis: 'evidenced', note: 'Replaced AP for Telangana companies (MCA notice). Older Telangana companies may still show AP.' },
  TN: { name: 'Tamil Nadu', basis: 'reference' },
  TR: { name: 'Tripura', basis: 'reference' },
  UP: { name: 'Uttar Pradesh', basis: 'reference' },
  UR: { name: 'Uttarakhand', basis: 'evidenced', note: 'Older Uttarakhand CINs use UR; newer ones use UT.' },
  UT: { name: 'Uttarakhand', basis: 'evidenced', note: 'Newer Uttarakhand CINs use UT; older ones use UR.' },
  WB: { name: 'West Bengal', basis: 'reference' },
};
