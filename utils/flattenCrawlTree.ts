import type { CrawlTreeNode } from "@/types/crawl";
import type { TestResultRow } from "@/components/sites/result";

export function flattenCrawlTree(
  node: CrawlTreeNode,
  rows: TestResultRow[] = []
): TestResultRow[] {
  rows.push({
    id: `CRAWL-${node.url}`,
    url: node.url,
    testType: "CRAWL",
    hasIssue: !!node.error || (node.status !== null && node.status >= 400),
    issueSummary: node.error
      ? node.error
      : node.status
      ? `HTTP ${node.status}`
      : "No response",
    depth: node.depth,
  });

  for (const child of node.children) {
    flattenCrawlTree(child, rows);
  }

  return rows;
}
