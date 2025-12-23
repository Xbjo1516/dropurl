export interface CrawlResultItem {
  url: string;
  status: number | null;
  depth: number;
  from: string | null;
  error: string | null;
}

export interface CrawlTreeNode {
  url: string;
  status: number | null;
  depth: number;
  error: string | null;
  children: CrawlTreeNode[];
}
