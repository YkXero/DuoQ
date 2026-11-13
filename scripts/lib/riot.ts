// Minimal Riot API client with rate limiting and retries.
// Dev/personal keys: 20 req/s and 100 req/2 min, so we space calls 1.25 s apart.
const MIN_GAP_MS = 1250;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class RiotClient {
  private last = 0;
  constructor(private key: string, private regionHost: string, private platformHost: string) {}

  private async get<T>(url: string, attempt = 0): Promise<T | null> {
    const wait = this.last + MIN_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    this.last = Date.now();
    const res = await fetch(url, { headers: { "X-Riot-Token": this.key } });
    if (res.status === 429 || res.status >= 500) {
      if (attempt >= 5) throw new Error(`${res.status} after retries: ${url}`);
      const retry = Number(res.headers.get("retry-after")) || 2 ** attempt * 2;
      console.warn(`  ${res.status}, retrying in ${retry}s`);
      await sleep(retry * 1000);
      return this.get<T>(url, attempt + 1);
    }
    if (res.status === 404) return null;
    if (!res.ok) {
      const hint = res.status === 401 || res.status === 403 ? "\n(API key invalid or expired? Development keys last 24h.)" : "";
      throw new Error(`${res.status} ${url}\n${await res.text()}${hint}`);
    }
    return (await res.json()) as T;
  }

  account(gameName: string, tagLine: string) {
    return this.get<{ puuid: string; gameName: string; tagLine: string }>(
      `${this.regionHost}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    );
  }
  summoner(puuid: string) {
    return this.get<{ profileIconId: number; summonerLevel: number }>(`${this.platformHost}/lol/summoner/v4/summoners/by-puuid/${puuid}`);
  }
  leagues(puuid: string) {
    return this.get<{ queueType: string; tier: string; rank: string; leaguePoints: number; wins: number; losses: number }[]>(
      `${this.platformHost}/lol/league/v4/entries/by-puuid/${puuid}`,
    );
  }
  matchIds(puuid: string, opts: { startTime: number; queue: number; start: number; count: number }) {
    const q = new URLSearchParams(Object.entries(opts).map(([k, v]) => [k, String(v)]));
    return this.get<string[]>(`${this.regionHost}/lol/match/v5/matches/by-puuid/${puuid}/ids?${q}`);
  }
  // Riot's DTOs are large; we only read a subset, typed loosely in transform.ts.
  match(id: string) {
    return this.get<any>(`${this.regionHost}/lol/match/v5/matches/${id}`);
  }
  timeline(id: string) {
    return this.get<any>(`${this.regionHost}/lol/match/v5/matches/${id}/timeline`);
  }
}
