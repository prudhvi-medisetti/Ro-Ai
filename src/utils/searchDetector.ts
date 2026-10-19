/**
 * Intelligently detects whether a user prompt requires real-time information,
 * live news, current stock/crypto prices, sports scores, weather, or web search.
 */
export function detectSearchIntent(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const q = text.trim().toLowerCase();

  // 1. Explicit search commands or instructions
  if (
    /^(search|google|look up|find out|browse)\b/i.test(q) ||
    /\b(search the web|search online|search for|google for|look up online|find on the web|find online)\b/i.test(q)
  ) {
    return true;
  }

  // 2. Fact checking, rumor verification, "is it true..."
  if (
    /\b(is this news true|is this true|did this really happen|is it true that|fact check|verify this|did anyone report|is it confirmed that)\b/i.test(q)
  ) {
    return true;
  }

  // 3. Time-sensitive recency markers combined with informational subjects
  const hasRecency =
    /\b(latest|recent|recently|breaking|current|currently|today|tonight|yesterday|this week|this month|this year|right now|newest|upcoming|live)\b/i.test(q);

  const hasInfoSubject =
    /\b(news|updates|update|headline|headlines|developments|report|announcement|release|version|launch|event|drama|controversy|situation|status|results|pricing|specs|review)\b/i.test(q);

  if (hasRecency && hasInfoSubject) {
    return true;
  }

  // 4. Financial markets, stock prices, crypto, sports, weather
  if (
    /\b(stock price|market today|stock market|share price|crypto price|price of|bitcoin price|btc price|crypto market|nasdaq|dow jones|s&p 500|trading at)\b/i.test(q) ||
    /\b(cricket score|cricket results|football score|match today|game score|who won the match|world cup|ipl|premier league|nba)\b/i.test(q) ||
    /\b(weather in|weather today|temperature in|forecast for|is it raining in)\b/i.test(q)
  ) {
    return true;
  }

  // 5. Questions specifically asking "what happened..." or "what's the latest..."
  if (
    /^(what happened|what is happening|what's happening|what's the latest|what is the latest|who won|who is currently|who is the current)\b/i.test(q)
  ) {
    // Avoid purely code questions like "what happened in this function"
    if (!/(in this code|in my code|in this function|in line|in loop)/i.test(q)) {
      return true;
    }
  }

  // 6. Companies / entities frequently asked about recent updates (Tesla, Gemini, OpenAI, Apple, etc.)
  if (
    /\b(tesla|gemini|openai|chatgpt|anthropic|claude|google|apple|microsoft|nvidia|deepseek|spacex|meta|amazon)\b/i.test(q) &&
    /\b(news|update|updates|announcement|launch|stock|today|yesterday|latest|current|earnings|quarter)\b/i.test(q)
  ) {
    return true;
  }

  return false;
}
