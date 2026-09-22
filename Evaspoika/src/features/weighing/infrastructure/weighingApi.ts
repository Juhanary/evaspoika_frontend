import { apiRequest } from '@/src/infrastructure/api/client';
import { endpoints } from '@/src/infrastructure/api/endpoints';

export type WeighingResult = {
  action: 'created' | 'updated';
  batchId: number;
  // Laatikon EAN-13. Backend rakentaa sen tuotekoodista ja painosta kun tarrassa
  // ei ollut koodia, jotta manuaalilaatikko on skannattavissa kuten vaa'an tuottama.
  ean?: string | null;
  production_date: string;
  current_weight: number;
  delta?: number;
  initial_weight?: number;
  productCreated?: boolean;
  warning?: string;
};

export type WeighingInput = {
  ean?: string;
  /**
   * Tuotteen tunniste. Vaaka tunnistaa tuotteen nimestä, mutta listasta valittu
   * tuote lähetetään id:llä — nimihaku kaatuisi jos tuote on nimetty Netvisorissa
   * uudelleen sen jälkeen kun tuotelista haettiin tabletille.
   */
  productId?: number;
  /**
   * Laatikolle ei tulosteta tarraa lainkaan, joten backend ei myöskään keksi sille
   * EAN-koodia. Vaikuttaa vain kun `ean` on tyhjä. Tällainen laatikko ei ole
   * skannattavissa: se lisätään tilaukselle käsin varastosta valitsemalla.
   */
  noEan?: boolean;
  name?: string;
  pricePerKg?: number;
  weightKg: number;
  userId?: number;
  productionDate?: string;
  bestBefore?: string;
};

export function submitWeighing(input: WeighingInput) {
  return apiRequest<WeighingResult>(endpoints.weighing, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
