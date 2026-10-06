import re
import logging
from typing import List, Tuple
from models.clause import Clause

logger = logging.getLogger("clauselens.offset_service")

class OffsetService:
    """
    Sub-string tracing engine mapping clause verbatim text to character ranges.
    
    Uses a 4-tier matching strategy:
    1. Exact Substring Match: `contract_text.find(snippet)`
    2. Normalized Whitespace Match: Collapses newlines/extra spaces & quotes
    3. Fuzzy Head Match: Matches first 35 chars of snippet
    4. Failure Safe-State: Sets offsets to (-1, -1)
    
    Includes overlap resolution to prevent broken nested `<mark>` tags in UI.
    """

    @classmethod
    def enrich_offsets(cls, contract_text: str, clauses: List[Clause]) -> List[Clause]:
        """Map start and end offsets for all clauses and resolve range overlaps."""
        if not contract_text or not clauses:
            return clauses

        enriched_clauses: List[Clause] = []
        for clause in clauses:
            start, end = cls._find_offsets(contract_text, clause.text)
            clause.start_offset = start
            clause.end_offset = end
            enriched_clauses.append(clause)

        return cls._resolve_overlaps(enriched_clauses)

    @classmethod
    def _find_offsets(cls, text: str, snippet: str) -> Tuple[int, int]:
        """Execute 4-tier matching strategy to map snippet position in text."""
        if not snippet or not text:
            return -1, -1

        # Level 1: Exact Substring Match
        pos = text.find(snippet)
        if pos != -1:
            return pos, pos + len(snippet)

        # Level 2: Normalized Whitespace & Smart Quotes Match
        norm_text, text_map = cls._normalize_with_map(text)
        norm_snippet, _ = cls._normalize_with_map(snippet)
        
        pos_norm = norm_text.find(norm_snippet)
        if pos_norm != -1 and text_map:
            start_orig = text_map.get(pos_norm, -1)
            end_norm = pos_norm + len(norm_snippet) - 1
            end_orig = text_map.get(end_norm, -1) + 1 if end_norm in text_map else -1
            if start_orig != -1 and end_orig != -1:
                return start_orig, end_orig

        # Level 3: Fuzzy Head Match (First 35 chars)
        head_snippet = snippet[:35].strip()
        if len(head_snippet) >= 15:
            pos_head = text.find(head_snippet)
            if pos_head != -1:
                return pos_head, min(pos_head + len(snippet), len(text))

        # Level 4: Failure Fallback (-1, -1)
        logger.warning(f"Could not calculate offset for clause snippet: '{snippet[:40]}...'")
        return -1, -1

    @staticmethod
    def _normalize_with_map(s: str) -> Tuple[str, dict]:
        """
        Normalize text (lowercase, single spaces, standard quotes)
        while maintaining an index mapping map[normalized_idx] = original_idx.
        """
        normalized_chars = []
        index_map = {}
        in_whitespace = False

        for orig_idx, char in enumerate(s):
            # Standardize smart quotes
            if char in ("“", "”"):
                char = '"'
            elif char in ("‘", "’"):
                char = "'"

            if char.isspace():
                if not in_whitespace:
                    normalized_chars.append(" ")
                    index_map[len(normalized_chars) - 1] = orig_idx
                    in_whitespace = True
            else:
                in_whitespace = False
                normalized_chars.append(char)
                index_map[len(normalized_chars) - 1] = orig_idx

        return "".join(normalized_chars), index_map

    @staticmethod
    def _resolve_overlaps(clauses: List[Clause]) -> List[Clause]:
        """
        Sort clauses by start_offset and reset offsets of overlapping clauses to (-1, -1).
        This guarantees non-overlapping regions for clean HTML highlight rendering.
        """
        valid_clauses = [c for c in clauses if c.start_offset >= 0 and c.end_offset > c.start_offset]
        invalid_clauses = [c for c in clauses if c.start_offset < 0 or c.end_offset <= c.start_offset]

        if not valid_clauses:
            return clauses

        # Sort valid clauses by start offset
        valid_clauses.sort(key=lambda c: c.start_offset)
        
        resolved: List[Clause] = []
        last_end = -1

        for clause in valid_clauses:
            if clause.start_offset < last_end:
                # Overlap detected! Keep clause in dashboard list but clear offsets
                logger.info(
                    f"Clause '{clause.id}' range [{clause.start_offset}:{clause.end_offset}] "
                    f"overlaps with previous [{last_end}]. Resetting offsets to (-1, -1)."
                )
                clause.start_offset = -1
                clause.end_offset = -1
                invalid_clauses.append(clause)
            else:
                resolved.append(clause)
                last_end = clause.end_offset

        return resolved + invalid_clauses
