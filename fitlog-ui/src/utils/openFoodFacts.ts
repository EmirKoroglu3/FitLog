/** A packaged product looked up by barcode, with values per 100 g (or 100 ml). */
export interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  per100: { calories: number; protein: number; carbohydrates: number; fat: number };
  unit: 'g' | 'ml';
}

const round1 = (n: unknown) => Math.round((Number(n) || 0) * 10) / 10;

/**
 * Looks a barcode up in Open Food Facts (free, open database with many Turkish products).
 * Only the barcode number is sent. Returns null when the product or its nutrition is unknown.
 */
export async function lookupBarcode(barcode: string): Promise<ScannedProduct | null> {
  const code = barcode.replace(/\D/g, '');
  if (code.length < 8 || code.length > 14) return null;

  const fields = 'product_name,product_name_tr,brands,nutriments,quantity';
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`);
  if (!res.ok) return null;
  const data = await res.json();
  const p = data?.product;
  if (data?.status !== 1 || !p) return null;

  const n = p.nutriments ?? {};
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] != null ? Number(n['energy_100g']) / 4.184 : undefined);
  if (kcal == null) return null;

  const name = String(p.product_name_tr || p.product_name || '').trim();
  const brand = String(p.brands || '').split(',')[0].trim() || undefined;
  const isLiquid = /\b\d+(?:[.,]\d+)?\s?(ml|cl|l)\b/i.test(String(p.quantity || ''));

  return {
    barcode: code,
    name: name || `Ürün ${code}`,
    brand,
    unit: isLiquid ? 'ml' : 'g',
    per100: {
      calories: Math.round(Number(kcal)),
      protein: round1(n['proteins_100g']),
      carbohydrates: round1(n['carbohydrates_100g']),
      fat: round1(n['fat_100g']),
    },
  };
}
