"use client";

import { useState } from "react";
import type { CrawlTreeNode } from "@/types/crawl";

type Props = {
  nodes: CrawlTreeNode[];
};

export default function CrawlTree({ nodes }: Props) {
  return (
    <div className="text-sm">
      {nodes.map((n) => (
        <TreeNode key={n.url} node={n} />
      ))}
    </div>
  );
}

function TreeNode({ node }: { node: CrawlTreeNode }) {
  const [open, setOpen] = useState(true);

  const hasChildren = node.children.length > 0;

  return (
    <div className="ml-4">
      <div className="flex items-center gap-2">
        {hasChildren && (
          <button onClick={() => setOpen(!open)} className="text-xs w-4">
            {open ? "▾" : "▸"}
          </button>
        )}

        <span>{node.status ?? "?"}</span>

        <a
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {node.url}
        </a>

        <span className="text-xs text-slate-500">depth {node.depth}</span>
      </div>

      {open &&
        node.children.map((child) => (
          <TreeNode key={child.url} node={child} />
        ))}
    </div>
  );
}
