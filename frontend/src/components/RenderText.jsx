import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

/* ------------------------------------------------------------------
Main RenderText Component
------------------------------------------------------------------- */
const RenderText = ({ text }) => {
  if (!text) return null;

  // Clean up HTML break tags and replace with newlines
  const sanitized = text.replace(/<br\s*[\/]?>/gi, "\n");

  // Split text into chunks: code blocks vs regular text blocks
  const parts = sanitized.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        // Render Fenced Code Blocks (```language ... ```)
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let language = lines[0].trim();
          let codeContent = lines.slice(1).join("\n");

          if (!language || language.includes(" ")) {
            codeContent = lines.join("\n");
            language = "code";
          }

          return (
            <CodeBlock key={index} language={language} code={codeContent} />
          );
        }

        // Render Regular Markdown Blocks
        return renderTextBlock(part, index);
      })}
    </div>
  );
};

/* ------------------------------------------------------------------
Helper: render a single text block (anything not in fenced code)
------------------------------------------------------------------- */
const renderTextBlock = (block, key) => {
  const lines = block.split("\n");
  const elements = [];
  let listOpen = false;
  let listType = null;
  let listItems = [];

  const flushList = () => {
    if (listOpen && listItems.length) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      const listClass =
        listType === "ol" ? "ml-4 list-decimal" : "ml-4 list-disc";
      elements.push(
        <ListTag key={`list-${key}-${elements.length}`} className={listClass}>
          {listItems}
        </ListTag>,
      );
    }
    listOpen = false;
    listType = null;
    listItems = [];
  };

  let idx = 0;
  while (idx < lines.length) {
    const raw = lines[idx];
    const line = raw.trim();

    /* 1️⃣ Blockquote */
    if (line.startsWith(">")) {
      flushList();
      elements.push(
        <blockquote
          key={`bq-${key}-${idx}`}
          className="border-l-4 border-[var(--border-light,#ccc)]/20 pl-3 italic text-[var(--text-muted,#666)] my-1"
        >
          {renderInlineMarkdown(line.slice(1).trim())}
        </blockquote>,
      );
      idx++;
      continue;
    }

    /* 2️⃣ Heading */
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const Tag = `h${level}`;
      const sizeClass =
        level === 1
          ? "text-2xl font-bold my-2"
          : level === 2
            ? "text-xl font-semibold my-2"
            : "text-lg font-medium my-1";
      elements.push(
        <Tag key={`h${level}-${key}-${idx}`} className={sizeClass}>
          {renderInlineMarkdown(headingMatch[2].trim())}
        </Tag>,
      );
      idx++;
      continue;
    }

    /* 3️⃣ Table (Group consecutive table lines together) */
    if (line.startsWith("|") && line.endsWith("|")) {
      flushList();
      const tableLines = [];
      while (
        idx < lines.length &&
        lines[idx].trim().startsWith("|") &&
        lines[idx].trim().endsWith("|")
      ) {
        tableLines.push(lines[idx].trim());
        idx++;
      }

      const tableRows = [];
      let isHeaderGroup = true;

      tableLines.forEach((tableLine, tIdx) => {
        const cells = tableLine
          .split("|")
          .filter((c) => c.trim() !== "")
          .map((c) => c.trim());

        // Skip separator row (e.g. |---|---|)
        if (cells.every((c) => /^[-:]+$/.test(c))) {
          isHeaderGroup = false;
          return;
        }

        const isHeader = isHeaderGroup && tIdx === 0;
        const CellTag = isHeader ? "th" : "td";

        tableRows.push(
          <tr
            key={`row-${key}-${tIdx}`}
            className="border-b border-[var(--border-light,#e5e7eb)]/20"
          >
            {cells.map((cell, cIdx) => (
              <CellTag
                key={`cell-${key}-${tIdx}-${cIdx}`}
                className={`px-4 py-2.5 text-left ${
                  isHeader
                    ? "font-semibold bg-[var(--bg-secondary,#f3f4f6)]/30 text-[var(--text-main,#111)]"
                    : "text-[var(--text-main,#111)]"
                }`}
              >
                {renderInlineMarkdown(cell)}
              </CellTag>
            ))}
          </tr>,
        );
      });

      if (tableRows.length > 0) {
        elements.push(
          <table
            key={`table-${key}-${idx}`}
            className="w-full border-collapse border border-[var(--border-light,#e5e7eb)]/20 rounded-sm overflow-hidden my-3 text-xs"
          >
            <tbody>{tableRows}</tbody>
          </table>,
        );
      }
      continue;
    }

    /* 4️⃣ List items */
    const unorderedMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (unorderedMatch || orderedMatch) {
      const content = unorderedMatch ? unorderedMatch[3] : orderedMatch[3];
      const type = unorderedMatch ? "ul" : "ol";

      if (!listOpen || listType !== type) {
        flushList();
        listOpen = true;
        listType = type;
      }

      listItems.push(
        <li key={`li-${key}-${idx}`} className="list-item mb-1 leading-relaxed">
          {renderInlineMarkdown(content.trim())}
        </li>,
      );
      idx++;
      continue;
    }

    /* 5️⃣ Plain paragraph */
    if (line !== "") {
      flushList();
      elements.push(
        <p
          key={`p-${key}-${idx}`}
          className="my-1 leading-relaxed text-[var(--text-main,#111)]"
        >
          {renderInlineMarkdown(line)}
        </p>,
      );
    }
    idx++;
  }

  flushList();
  return (
    <div key={key} className="space-y-1">
      {elements}
    </div>
  );
};

/* ------------------------------------------------------------------
Helper: render inline Markdown (**bold**, *italic*, `code`)
------------------------------------------------------------------- */
const renderInlineMarkdown = (text) => {
  const parts = [];
  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  tokens.forEach((token, idx) => {
    if (!token) return;

    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`bold-${idx}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={`italic-${idx}`} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`code-${idx}`}
          className="px-1 py-0.5 rounded bg-[var(--bg-secondary,#f3f4f6)] text-xs font-mono text-[var(--text-main,#111)]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(token);
    }
  });

  return parts;
};

/* ------------------------------------------------------------------
Code Block Sub-component (with copy-to-clipboard)
------------------------------------------------------------------- */
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-[var(--border-light,#e5e7eb)]/20 bg-[var(--bg-main,#fff)] text-xs font-mono">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-secondary,#f3f4f6)]/30 border-b border-[var(--border-light,#e5e7eb)]/20 text-[var(--text-muted,#666)]">
        <span className="uppercase text-[10px] tracking-wider font-semibold">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[var(--bg-card,#e5e7eb)]/50 transition-colors text-[var(--text-main,#111)]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-green-500" />
              <span className="text-[10px] text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-3 overflow-x-auto text-[var(--text-main,#111)] leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default RenderText;
