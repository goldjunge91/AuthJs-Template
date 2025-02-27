import { describe, it, expect } from 'vitest';
import { formatAmountForStripe } from '@/utils/stripe/stripe-helpers';

describe('Stripe Hilfsfunktionen', () => {
  describe('formatAmountForStripe', () => {
    it('sollte den Betrag korrekt für EUR formatieren', () => {
      expect(formatAmountForStripe(10.99, 'eur')).toBe(1099);
      expect(formatAmountForStripe(0, 'eur')).toBe(0);
      expect(formatAmountForStripe(100, 'eur')).toBe(10000);
    });

    it('sollte den Betrag korrekt für USD formatieren', () => {
      expect(formatAmountForStripe(10.99, 'usd')).toBe(1099);
      expect(formatAmountForStripe(0, 'usd')).toBe(0);
      expect(formatAmountForStripe(100, 'usd')).toBe(10000);
    });

    it('sollte mit Rundungsfehlern umgehen können', () => {
      expect(formatAmountForStripe(10.999, 'eur')).toBe(1100);
      expect(formatAmountForStripe(10.991, 'eur')).toBe(1099);
    });
  });
});
