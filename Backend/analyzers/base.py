from abc import ABC, abstractmethod
from typing import Optional
from models.clause import AnalysisResult

class BaseAnalyzer(ABC):
    """Abstract Base Class for ClauseLens contract analysis engines."""

    @abstractmethod
    async def analyze(
        self,
        contract_text: str,
        contract_type: Optional[str] = None
    ) -> AnalysisResult:
        """
        Analyze contract text and return a structured AnalysisResult.
        
        Args:
            contract_text: The full text of the contract to analyze.
            contract_type: Optional contract classification hint.
            
        Returns:
            Structured AnalysisResult containing score, summary, and flagged clauses.
        """
        pass
