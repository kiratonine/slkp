export class PremiumDataService {
  public getPremiumSolQuote() {
    return {
      success: true,
      data: {
        product: 'premium-sol-quote',
        quote: 'SOL payment accepted, premium data unlocked',
      },
    };
  }
}