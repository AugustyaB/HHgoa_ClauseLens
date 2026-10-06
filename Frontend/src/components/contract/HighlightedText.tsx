import React, { useMemo, useEffect, useRef } from 'react';
import { Clause } from '../../types';

interface HighlightedTextProps {
  contractText: string;
  clauses: Clause[];
  activeClauseId: string | null;
  onClauseClick: (clauseId: string) => void;
}

interface TextSegment {
  key: string;
  text: string;
  isHighlight: boolean;
  clause?: Clause;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  contractText,
  clauses,
  activeClauseId,
  onClauseClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate non-overlapping text segments for highlight rendering
  const segments = useMemo<TextSegment[]>(() => {
    if (!contractText) return [];

    // Dynamically verify and resolve clause offsets against original contractText
    const textLen = contractText.length;
    const resolvedClauses: Clause[] = [];

    clauses.forEach((c) => {
      let start = c.start_offset;
      let end = c.end_offset;

      // Verify if current offsets match clause.text character-for-character
      const sliceMatches =
        start >= 0 &&
        end > start &&
        end <= textLen &&
        contractText.slice(start, end) === c.text;

      if (!sliceMatches && c.text) {
        // Find exact substring in contractText
        const exactPos = contractText.indexOf(c.text);
        if (exactPos !== -1) {
          start = exactPos;
          end = exactPos + c.text.length;
        } else {
          // Fallback: trimmed text search
          const trimmed = c.text.trim();
          const trimmedPos = contractText.indexOf(trimmed);
          if (trimmedPos !== -1) {
            start = trimmedPos;
            end = trimmedPos + trimmed.length;
          }
        }
      }

      if (start >= 0 && end > start && start < textLen && end <= textLen) {
        resolvedClauses.push({
          ...c,
          start_offset: start,
          end_offset: end,
        });
      }
    });

    // If no clauses have valid offsets, render complete text as single plain segment
    if (resolvedClauses.length === 0) {
      return [
        {
          key: 'plain-all',
          text: contractText,
          isHighlight: false,
        },
      ];
    }

    // Sort valid clauses by start offset and filter out overlaps
    resolvedClauses.sort((a, b) => a.start_offset - b.start_offset);
    const sorted: Clause[] = [];
    let lastEnd = 0;
    for (const c of resolvedClauses) {
      if (c.start_offset >= lastEnd) {
        sorted.push(c);
        lastEnd = c.end_offset;
      }
    }

    const resultSegments: TextSegment[] = [];
    let currentIndex = 0;

    sorted.forEach((clause, index) => {
      // Add plain text before this clause highlight
      if (clause.start_offset > currentIndex) {
        resultSegments.push({
          key: `plain-${currentIndex}-${clause.start_offset}`,
          text: contractText.slice(currentIndex, clause.start_offset),
          isHighlight: false,
        });
      }

      // Add highlighted clause segment
      resultSegments.push({
        key: `highlight-${clause.id}-${index}`,
        text: contractText.slice(clause.start_offset, clause.end_offset),
        isHighlight: true,
        clause,
      });

      currentIndex = clause.end_offset;
    });

    // Add remaining trailing plain text
    if (currentIndex < textLen) {
      resultSegments.push({
        key: `plain-${currentIndex}-${textLen}`,
        text: contractText.slice(currentIndex),
        isHighlight: false,
      });
    }

    return resultSegments;
  }, [contractText, clauses]);

  // Smooth scroll active clause highlight into view when activeClauseId changes
  useEffect(() => {
    if (!activeClauseId || !containerRef.current) return;

    const element = containerRef.current.querySelector(
      `[data-clause-id="${activeClauseId}"]`
    );

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [activeClauseId]);

  if (!contractText) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic py-12">
        No contract text loaded. Paste a contract in Editor mode or select a sample contract.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto pr-2 font-serif text-sm leading-relaxed text-slate-200 whitespace-pre-wrap select-text"
    >
      {segments.map((seg) => {
        if (!seg.isHighlight || !seg.clause) {
          return <span key={seg.key}>{seg.text}</span>;
        }

        const clause = seg.clause;
        const isActive = activeClauseId === clause.id;
        const riskClass =
          clause.type === 'danger'
            ? 'highlight-danger'
            : clause.type === 'warning'
            ? 'highlight-warning'
            : 'highlight-safe';

        return (
          <mark
            key={seg.key}
            id={`text-clause-${clause.id}`}
            data-clause-id={clause.id}
            onClick={() => onClauseClick(clause.id)}
            title={`${clause.title} (${clause.category}) — Click to view in dashboard`}
            className={`highlight-mark ${riskClass} ${isActive ? 'active' : ''}`}
          >
            {seg.text}
          </mark>
        );
      })}
    </div>
  );
};
