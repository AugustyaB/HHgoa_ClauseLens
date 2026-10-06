import { AnalysisResult } from '../types';

export function generateMarkdownReport(
  analysis: AnalysisResult,
  contractText: string
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Fair & Protective (Low Risk)';
    if (score >= 50) return 'Moderate Risk (Review Advised)';
    if (score >= 25) return 'High Risk (Negotiation Strongly Recommended)';
    return 'Predatory Terms (Severe Risk Exposure)';
  };

  let md = `# ClauseLens — Legal Contract Audit Report\n\n`;
  md += `**Audit Date**: ${dateStr}\n`;
  md += `**Overall Fairness Score**: **${analysis.overall_score}/100** — *${getScoreLabel(analysis.overall_score)}*\n`;
  md += `**Analysis Engine**: ${analysis.analysis_engine.toUpperCase()}\n`;
  if (analysis.analysis_duration_ms) {
    md += `**Execution Time**: ${analysis.analysis_duration_ms} ms\n`;
  }
  md += `\n---\n\n`;

  md += `## 1. Executive Risk Summary\n\n`;
  md += `${analysis.summary}\n\n`;

  md += `### Risk Level Breakdown\n`;
  md += `- **Danger (Predatory)**: ${analysis.risk_counts.danger || 0}\n`;
  md += `- **Warning (Ambiguous)**: ${analysis.risk_counts.warning || 0}\n`;
  md += `- **Safe (Standard)**: ${analysis.risk_counts.safe || 0}\n\n`;

  if (analysis.key_takeaways && analysis.key_takeaways.length > 0) {
    md += `### Key Audit Takeaways\n`;
    analysis.key_takeaways.forEach((takeaway) => {
      md += `- ${takeaway}\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## 2. Category Fairness Scores\n\n`;
  md += `| Category | Score / 100 |\n`;
  md += `|:---|:---|\n`;
  Object.entries(analysis.category_scores).forEach(([cat, score]) => {
    md += `| **${cat}** | ${score}/100 |\n`;
  });
  md += `\n---\n\n`;

  md += `## 3. Detailed Flagged Clauses & Counterclauses\n\n`;

  analysis.clauses.forEach((clause, index) => {
    const riskBadge =
      clause.type === 'danger'
        ? '🔴 DANGER'
        : clause.type === 'warning'
        ? '🟡 WARNING'
        : '🟢 SAFE';

    md += `### ${index + 1}. ${clause.title} [${riskBadge}]\n`;
    md += `**Category**: ${clause.category}\n\n`;

    md += `#### Original Contract Text\n`;
    md += `> "${clause.text}"\n\n`;

    md += `#### Risk Assessment & Explanation\n`;
    md += `${clause.explanation}\n\n`;

    if (
      clause.counterclause &&
      clause.counterclause !== 'Standard clause; no change necessary.'
    ) {
      md += `#### Suggested Fair Counterclause\n`;
      md += `\`\`\`text\n${clause.counterclause}\n\`\`\`\n\n`;
    }

    md += `---\n\n`;
  });

  md += `## 4. Original Full Contract Text\n\n`;
  md += `\`\`\`text\n${contractText}\n\`\`\`\n\n`;

  md += `---\n*Report generated automatically by ClauseLens AI Legal Analysis System.*`;

  return md;
}

export function downloadMarkdownReport(
  analysis: AnalysisResult,
  contractText: string
): void {
  const markdownContent = generateMarkdownReport(analysis, contractText);
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `ClauseLens_Audit_Report_${timestamp}.md`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
