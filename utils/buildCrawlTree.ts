import type { CrawlResultItem, CrawlTreeNode } from "@/types/crawl";

export function buildCrawlTree(
  results: CrawlResultItem[]
): CrawlTreeNode | null {
  const map = new Map<string, CrawlTreeNode>();
  let root: CrawlTreeNode | null = null;

  for (const r of results) {
    map.set(r.url, {
      url: r.url,
      status: r.status,
      depth: r.depth,
      error: r.error,
      children: [],
    });
  }

  for (const r of results) {
    const node = map.get(r.url)!;

    if (!r.from) {
      root = node;
    } else {
      const parent = map.get(r.from);
      if (parent) parent.children.push(node);
    }
  }

  return root;
}
