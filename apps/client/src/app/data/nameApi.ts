export interface NameData {
  year: number;
  count: number;
  percentage: number;
}

export interface HomeDataResponse {
  names: string[];
  trends: Record<string, NameData[]>;
}

export interface NamePageResponse {
  name: string;
  data: NameData[];
  previousName: string | null;
  nextName: string | null;
}

export interface NamesResponse {
  names: string[];
}

export async function fetchHomeData(): Promise<HomeDataResponse> {
  const response = await fetch("/api/home");
  if (!response.ok) {
    throw new Error("Failed to fetch home data");
  }

  return response.json();
}

export async function fetchNamePageData(name: string): Promise<NamePageResponse> {
  const response = await fetch(`/api/name/${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch name data");
  }

  return response.json();
}

export async function fetchNames(): Promise<string[]> {
  const response = await fetch("/api/names");
  if (!response.ok) {
    throw new Error("Failed to fetch names");
  }

  const payload = (await response.json()) as NamesResponse;
  return payload.names;
}
