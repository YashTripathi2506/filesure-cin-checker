/**
 * Three-letter ownership / company-type codes (positions 13-15 of a CIN).
 *
 * basis:
 *  - 'evidenced' : code seen in a real CIN on a public filing or registry page.
 *  - 'reference' : listed consistently by several published CIN guides (Razorpay, Cashfree, Tata Capital,
 *                  ClearTax) but not sampled from a real CIN here, and no MCA page listing them was reachable.
 *
 * Codes whose wording differs between guides are described conservatively.
 * Unknown codes produce a "review" result, not a silent pass.
 */
export type TypeBasis = 'evidenced' | 'reference';
export interface CompanyTypeEntry {
  name: string;
  description: string;
  basis: TypeBasis;
}

export const COMPANY_TYPES: Record<string, CompanyTypeEntry> = {
  PLC: { name: 'Public limited company', description: 'A company that is not a private company.', basis: 'evidenced' },
  PTC: { name: 'Private limited company', description: 'Private company with restricted share transfer.', basis: 'evidenced' },
  OPC: { name: 'One person company', description: 'Company with a single member.', basis: 'reference' },
  GOI: { name: 'Government of India company', description: 'Company owned by the Central Government.', basis: 'reference' },
  SGC: { name: 'State government company', description: 'Company owned by a State Government.', basis: 'evidenced' },
  NPL: { name: 'Not-for-profit company', description: 'Company licensed to operate not-for-profit (Section 8).', basis: 'evidenced' },
  FTC: { name: 'Subsidiary of a foreign company', description: 'Company that is a subsidiary of a foreign company.', basis: 'reference' },
  GAP: { name: 'General association (public)', description: 'Public company formed as a general association.', basis: 'reference' },
  GAT: { name: 'General association (private)', description: 'Private company formed as a general association.', basis: 'reference' },
  ULL: { name: 'Unlimited liability company (public)', description: 'Public company with unlimited liability. Guides word this code slightly differently.', basis: 'reference' },
  ULT: { name: 'Unlimited liability company (private)', description: 'Private company with unlimited liability. Guides word this code slightly differently.', basis: 'reference' },
};
