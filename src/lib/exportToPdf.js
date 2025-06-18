import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPdf = (reportData, reportTitle, formatCurrency) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(reportTitle, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);

  let yPos = 35;

  const addSectionTitle = (title) => {
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(title, 14, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setTextColor(100);
  };

  const addKeyValue = (key, value) => {
    doc.text(`${key}:`, 14, yPos);
    doc.text(value, 70, yPos);
    yPos += 7;
  };

  addSectionTitle('Resumo do Período');
  addKeyValue('Total de Receitas', formatCurrency(reportData.summary.revenue));
  addKeyValue('Total de Despesas', formatCurrency(reportData.summary.expenses));
  addKeyValue('Saldo', formatCurrency(reportData.summary.balance));
  addKeyValue('Taxa de Poupança', `${reportData.summary.savingRate.toFixed(2)}%`);
  yPos += 5;

  if (reportData.categoriesSpending && Object.keys(reportData.categoriesSpending).length > 0) {
    addSectionTitle('Gastos por Categoria');
    const categoryData = Object.entries(reportData.categoriesSpending).map(([category, amount]) => [
      category,
      formatCurrency(amount),
      `${reportData.summary.expenses > 0 ? ((amount / reportData.summary.expenses) * 100).toFixed(1) : 0}%`
    ]);
    doc.autoTable({
      startY: yPos,
      head: [['Categoria', 'Valor Gasto', '% do Total de Despesas']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  if (reportData.monthlyTrend && reportData.monthlyTrend.length > 0) {
    addSectionTitle('Tendência Mensal (Últimos Meses)');
    const trendData = reportData.monthlyTrend.map(month => [
      month.month,
      formatCurrency(month.receitas),
      formatCurrency(month.despesas),
      formatCurrency(month.saldo)
    ]);
    doc.autoTable({
      startY: yPos,
      head: [['Mês', 'Receitas', 'Despesas', 'Saldo']],
      body: trendData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }
  
  if (reportData.investments && reportData.investments.length > 0) {
    addSectionTitle('Resumo de Investimentos');
    const totalInvestmentsValue = reportData.investments.reduce((sum, inv) => sum + inv.totalValue, 0);
    const totalDividends = reportData.investments.reduce((sum, inv) => sum + inv.dividends, 0);
    const totalInvestmentReturn = reportData.investments.reduce((sum, inv) => sum + inv.return, 0);
    addKeyValue('Valor Total Aplicado', formatCurrency(reportData.investments.reduce((sum, inv) => sum + inv.totalInvested, 0)));
    addKeyValue('Valor Atual da Carteira', formatCurrency(totalInvestmentsValue));
    addKeyValue('Dividendos Recebidos', formatCurrency(totalDividends));
    addKeyValue('Retorno Líquido Total', formatCurrency(totalInvestmentReturn));
    yPos += 5;

    const investmentDetails = reportData.investments.map(inv => [
        inv.name,
        inv.quantity,
        formatCurrency(inv.averagePrice),
        formatCurrency(inv.currentPrice),
        formatCurrency(inv.totalValue),
        formatCurrency(inv.dividends),
        formatCurrency(inv.return)
    ]);
    doc.autoTable({
        startY: yPos,
        head: [['Ativo', 'Qtd.', 'Preço Médio', 'Preço Atual', 'Valor Total', 'Dividendos', 'Retorno']],
        body: investmentDetails,
        theme: 'striped',
        headStyles: { fillColor: [142, 68, 173] },
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  if (reportData.goals && reportData.goals.length > 0) {
    addSectionTitle('Resumo de Metas');
    const totalGoalsValue = reportData.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalTargetValue = reportData.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    addKeyValue('Total Acumulado em Metas', formatCurrency(totalGoalsValue));
    addKeyValue('Valor Alvo Total das Metas', formatCurrency(totalTargetValue));
    addKeyValue('Número de Metas Ativas', reportData.goals.length.toString());
    yPos += 5;

    const goalDetails = reportData.goals.map(goal => [
        goal.name,
        formatCurrency(goal.currentAmount),
        formatCurrency(goal.targetAmount),
        `${goal.targetAmount > 0 ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1) : 0}%`,
        goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'N/A'
    ]);
     doc.autoTable({
        startY: yPos,
        head: [['Meta', 'Valor Atual', 'Valor Alvo', 'Progresso', 'Prazo']],
        body: goalDetails,
        theme: 'grid',
        headStyles: { fillColor: [243, 156, 18] },
    });
    yPos = doc.lastAutoTable.finalY + 10;
  }

  doc.save(`Relatorio_Financeiro_${reportTitle.replace(/\s+/g, '_').replace(/\//g, '-')}.pdf`);
};