import { MarketAnalytics, LocationInfo } from './types';

interface AIContext {
  product: string;
  location: LocationInfo;
  analytics: MarketAnalytics;
  mode: 'free' | 'pro';
}

export function generateAIResponse(userMessage: string, context: AIContext): string {
  const { product, location, analytics, mode } = context;
  const msg = userMessage.toLowerCase();

  const isPro = mode === 'pro';

  if (isPro) {
    return generateProResponse(msg, userMessage, product, location, analytics);
  }
  return generateFreeResponse(msg, userMessage, product, location, analytics);
}

function generateFreeResponse(msg: string, original: string, product: string, location: LocationInfo, a: MarketAnalytics): string {
  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    return `Based on standard market analysis for ${product} in ${location.city}, ${location.country}:\n\n• Average market price: $${a.averagePrice}\n• Demand level: ${a.demandScore}\n• Recommended approach: Price competitively within 10-15% of the average market price.\n\nNote: For exact local pricing strategies and competitor price benchmarks, consider upgrading to the PRO AI Assistant.`;
  }

  if (msg.includes('demand') || msg.includes('sell') || msg.includes('market')) {
    return `Market overview for ${product} in ${location.country}:\n\n• Market demand: ${a.demandScore} (${a.demandPercent}%)\n• Viability score: ${a.viabilityPercent}%\n• Estimated market size: ${a.marketSize}\n• Import need: ${a.importNeed}\n\nThe demand is ${a.demandScore.toLowerCase()}, suggesting ${a.demandScore === 'High' ? 'strong potential' : a.demandScore === 'Medium' ? 'moderate opportunity' : 'a challenging market'} for this product.\n\nFor deep competitive analysis and optimization strategies, the PRO AI Assistant provides advanced insights.`;
  }

  if (msg.includes('supplier') || msg.includes('source') || msg.includes('buy') || msg.includes('where')) {
    return `For sourcing ${product} in ${location.city}, ${location.country}:\n\n• Check the "Sellers & Production" tab for local stores and wholesale markets\n• Look for verified suppliers with good ratings\n• Consider both local production centers and wholesale distributors\n\nThe Free tier shows basic store names and locations. PRO access unlocks verified supplier contacts, popularity ratings, and bulk discount pricing.`;
  }

  if (msg.includes('strategy') || msg.includes('plan') || msg.includes('how') || msg.includes('what should')) {
    return `General trade strategy for ${product} in ${location.country}:\n\n1. Assess demand: Current demand is ${a.demandScore} with ${a.viabilityPercent}% viability\n2. Price positioning: Target around $${a.averagePrice} average market price\n3. Quantity planning: Market needs ~${a.requiredQuantity.toLocaleString()} units\n4. Entry approach: ${a.importNeed === 'High' ? 'Strong import opportunity — local supply is insufficient' : a.importNeed === 'Medium' ? 'Balanced approach — compete on quality or price' : 'Market is well-supplied locally — differentiate your offering'}\n\nFor optimized trade strategies with exact local pricing and competitive edge analysis, upgrade to PRO AI.`;
  }

  return `I can help with trade insights for ${product} in ${location.city}, ${location.country}.\n\nCurrent market snapshot:\n• Demand: ${a.demandScore} (${a.demandPercent}%)\n• Avg price: $${a.averagePrice}\n• Viability: ${a.viabilityPercent}%\n• Market size: ${a.marketSize}\n\nAsk me about pricing, demand, sourcing, or strategy. For advanced deep-trade optimization and maximum-accuracy insights, consider the PRO AI Assistant.`;
}

function generateProResponse(msg: string, original: string, product: string, location: LocationInfo, a: MarketAnalytics): string {
  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    const lowPrice = (a.averagePrice * 0.85).toFixed(2);
    const highPrice = (a.averagePrice * 1.15).toFixed(2);
    return `[PRO ANALYSIS] Advanced pricing strategy for ${product} in ${location.city}, ${location.country}:\n\n• Optimal price band: $${lowPrice} – $${highPrice}\n• Market average: $${a.averagePrice}\n• Recommended entry price: $${(a.averagePrice * 0.92).toFixed(2)} (penetration strategy)\n• Premium ceiling: $${(a.averagePrice * 1.18).toFixed(2)} (differentiated positioning)\n• Price elasticity: ${a.demandScore === 'High' ? 'Inelastic — market absorbs 12-15% premium for quality' : a.demandScore === 'Medium' ? 'Moderate elasticity — 5-8% premium sustainable' : 'Elastic — compete on price, keep margins thin'}\n• Competitor undercut threshold: ${(a.averagePrice * 0.78).toFixed(2)} — below this signals low quality\n\nLocal pricing insight: In ${location.country}, buyers respond to tiered pricing. Offer 3 price points (budget/standard/premium) to capture the full demand spectrum. Factor in ${a.importNeed === 'High' ? 'import duties of ~12-18%' : a.importNeed === 'Medium' ? 'modest import costs of ~5-8%' : 'minimal import barriers'} when calculating landed cost.`;
  }

  if (msg.includes('demand') || msg.includes('sell') || msg.includes('market')) {
    return `[PRO ANALYSIS] Deep market intelligence for ${product} in ${location.country}:\n\n• Demand index: ${a.demandPercent}/100 (${a.demandScore})\n• Viability probability: ${a.viabilityPercent}% — ${a.viabilityPercent > 80 ? 'highly probable success' : a.viabilityPercent > 65 ? 'strong likelihood with execution focus' : 'moderate — requires differentiation'}\n• Market size: ${a.marketSize}\n• Active competitors: ~${a.competitorCount}\n• Supply deficit: ${a.deficit.toLocaleString()} units (${((a.deficit / a.requiredQuantity) * 100).toFixed(1)}% of demand)\n• Trend trajectory: ${a.trend} — ${a.trend === 'rising' ? 'enter now to ride the wave' : a.trend === 'stable' ? 'steady demand, focus on market share' : 'declining — consider pivoting or short-cycle inventory'}\n• Import necessity: ${a.importNeed}\n\nCompetitive edge: With ${a.competitorCount} competitors and a ${a.deficit.toLocaleString()}-unit deficit, the market has room for ${a.deficit > 10000 ? '2-3 new entrants' : '1-2 focused players'}. Position on ${a.popularity > 60 ? 'brand quality and service' : 'price advantage and speed'} for maximum penetration.`;
  }

  if (msg.includes('supplier') || msg.includes('source') || msg.includes('buy') || msg.includes('where')) {
    return `[PRO ANALYSIS] Verified sourcing strategy for ${product} in ${location.city}, ${location.country}:\n\n• Top sourcing channels: Production centers (lowest cost), Wholesale markets (bulk pricing), Verified stores (reliability)\n• Recommended supplier criteria:\n  - Verification status: MUST be verified\n  - Minimum rating: 4.0+ stars\n  - Bulk discount threshold: 30%+ off original price\n  - Minimum order quantity: Negotiable for first-time buyers\n• Supplier negotiation leverage: With ${a.competitorCount} competitors, suppliers are open to volume discounts. Target 35-40% below retail for orders above 5,000 units.\n• Quality assurance: Request samples before bulk orders. Look for ISO certification in production centers.\n\nCheck the Sellers & Production tab for unlocked verified supplier contacts, wholesale pricing, and popularity ratings.`;
  }

  if (msg.includes('strategy') || msg.includes('plan') || msg.includes('how') || msg.includes('what should')) {
    return `[PRO ANALYSIS] Optimized trade strategy for ${product} in ${location.country}:\n\nPHASE 1 — Market Entry:\n• Start with a pilot batch of ${(a.requiredQuantity * 0.05).toFixed(0)} units to test demand\n• Price at $${(a.averagePrice * 0.92).toFixed(2)} for rapid penetration\n• Target the ${a.deficit.toLocaleString()}-unit supply gap\n\nPHASE 2 — Scale:\n• Increase to ${(a.requiredQuantity * 0.15).toFixed(0)} units if pilot sells within 30 days\n• Negotiate bulk pricing with verified suppliers (target 35%+ discount)\n• Expand to 2-3 distribution hubs in ${location.country}\n\nPHASE 3 — Optimize:\n• Adjust pricing based on competitor response\n• Build exclusive supplier relationships for cost advantage\n• Leverage ${a.trend === 'rising' ? 'the rising trend' : 'stable demand'} for long-term contracts\n\nRisk factors: ${a.importNeed === 'High' ? 'High import dependency — monitor trade policy changes' : 'Local competition is active — differentiate aggressively'}\nExpected ROI: ${a.viabilityPercent > 75 ? '22-35% within 6 months' : a.viabilityPercent > 60 ? '15-25% within 6 months' : '8-15% — manage costs carefully'}`;
  }

  return `[PRO ANALYSIS] Trade intelligence briefing for ${product} in ${location.city}, ${location.country}:\n\n• Demand: ${a.demandScore} (${a.demandPercent}%) | Trend: ${a.trend}\n• Price: $${a.averagePrice} avg | Viability: ${a.viabilityPercent}%\n• Market gap: ${a.deficit.toLocaleString()} units | Competitors: ~${a.competitorCount}\n• Import need: ${a.importNeed} | Popularity: ${a.popularity}%\n\nI can provide deep analysis on pricing, sourcing, market entry, or competitive strategy. What specific optimization are you looking for?`;
}
