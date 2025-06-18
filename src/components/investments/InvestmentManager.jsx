
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentBrasiliaDateISO } from '@/lib/dateUtils';

const InvestmentManager = () => {
  const { toast } = useToast();

  const createInvestmentTransaction = (type, data) => {
    const investmentTransactions = JSON.parse(localStorage.getItem('investmentTransactions') || '[]');
    const newTransaction = {
      id: `inv_${type}_${Date.now().toString()}`,
      date: getCurrentBrasiliaDateISO(),
      transactionType: type,
      ...data
    };
    
    investmentTransactions.push(newTransaction);
    localStorage.setItem('investmentTransactions', JSON.stringify(investmentTransactions));
    window.dispatchEvent(new Event('storage'));
    
    return newTransaction;
  };

  const updateBrokerageBalance = (newBalance) => {
    localStorage.setItem('brokerageBalance', JSON.stringify(newBalance));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('brokerageBalanceUpdate', { detail: newBalance }));
  };

  const getBrokerageBalance = () => {
    return JSON.parse(localStorage.getItem('brokerageBalance') || '0');
  };

  const calculateInvestmentReturn = (totalValue, totalDividends, totalInvested) => {
    return (totalValue + totalDividends) - totalInvested;
  };

  const saveInvestment = (formData, editingInvestment, brokerageBalance) => {
    const quantity = parseFloat(formData.quantity) || 0;
    const averagePrice = parseFloat(formData.averagePrice) || 0;
    const currentPrice = parseFloat(formData.currentPrice) || averagePrice;
    const dividendsPerShare = parseFloat(formData.dividends) || 0;
    
    const purchaseCost = quantity * averagePrice;

    if (!editingInvestment && purchaseCost > brokerageBalance) {
        toast({ title: "Saldo Insuficiente", description: "Saldo na corretora insuficiente para esta compra.", variant: "destructive" });
        return false;
    }

    const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
    let investmentName = formData.name || "Ativo Sem Nome";
    let investmentIdForTransaction = editingInvestment?.id;

    if (editingInvestment) {
      const updatedInvestments = allInvestments.map(inv => {
        if (inv.id === editingInvestment.id) {
          const originalTotalInvested = inv.totalInvested;
          const newTotalInvested = quantity * averagePrice;
          const costDifference = newTotalInvested - originalTotalInvested;

          if (costDifference > 0 && costDifference > brokerageBalance) {
            toast({ title: "Saldo Insuficiente", description: "Saldo na corretora insuficiente para cobrir o aumento do custo.", variant: "destructive" });
            return inv; 
          }
          if (costDifference > 0) {
            updateBrokerageBalance(brokerageBalance - costDifference);
          } else if (costDifference < 0) {
            updateBrokerageBalance(brokerageBalance + Math.abs(costDifference));
          }
          
          const totalValue = quantity * currentPrice;
          const totalDividendsReceived = (inv.dividends || 0) + (dividendsPerShare * quantity);
          const totalReturn = calculateInvestmentReturn(totalValue, totalDividendsReceived, newTotalInvested);

          return {
            ...inv,
            name: investmentName,
            type: formData.type || inv.type,
            quantity: quantity,
            averagePrice: averagePrice,
            currentPrice: currentPrice,
            totalInvested: newTotalInvested,
            totalValue: totalValue,
            dividends: totalDividendsReceived,
            return: totalReturn
          };
        }
        return inv;
      });
      localStorage.setItem('investments', JSON.stringify(updatedInvestments));
     
    } else {
      const existingInvestmentIndex = allInvestments.findIndex(inv => 
        inv.name.toLowerCase() === investmentName.toLowerCase() && inv.type === formData.type
      );

      if (existingInvestmentIndex !== -1) {
        const existing = allInvestments[existingInvestmentIndex];
        investmentIdForTransaction = existing.id;
        const newQuantity = existing.quantity + quantity;
        const newTotalInvested = (existing.totalInvested || 0) + purchaseCost;
        const newAveragePrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0;
        const newTotalValue = newQuantity * currentPrice;
        const totalDividendsReceived = (existing.dividends || 0) + (dividendsPerShare * quantity);
        const totalReturn = calculateInvestmentReturn(newTotalValue, totalDividendsReceived, newTotalInvested);
        
        allInvestments[existingInvestmentIndex] = {
          ...existing,
          quantity: newQuantity,
          averagePrice: newAveragePrice,
          currentPrice: currentPrice,
          totalValue: newTotalValue,
          totalInvested: newTotalInvested,
          dividends: totalDividendsReceived,
          return: totalReturn
        };
        localStorage.setItem('investments', JSON.stringify(allInvestments));
        updateBrokerageBalance(brokerageBalance - purchaseCost);

        createInvestmentTransaction('purchase', {
          description: `Compra de ${quantity} ${investmentName}`,
          amount: purchaseCost,
          investmentId: investmentIdForTransaction,
          investmentName: investmentName,
          quantity: quantity,
          price: averagePrice
        });

      } else {
        const newInvestmentId = Date.now().toString();
        investmentIdForTransaction = newInvestmentId;
        const totalInvested = purchaseCost;
        const totalValue = quantity * currentPrice;
        const totalDividendsReceived = dividendsPerShare * quantity;
        const totalReturn = calculateInvestmentReturn(totalValue, totalDividendsReceived, totalInvested);
        
        const newInvestment = {
          id: newInvestmentId,
          name: investmentName,
          type: formData.type,
          quantity: quantity,
          averagePrice: averagePrice,
          currentPrice: currentPrice,
          totalValue: totalValue,
          totalInvested: totalInvested,
          dividends: totalDividendsReceived, 
          return: totalReturn
        };
        const updatedInvestments = [...allInvestments, newInvestment];
        localStorage.setItem('investments', JSON.stringify(updatedInvestments));
        updateBrokerageBalance(brokerageBalance - purchaseCost);

        createInvestmentTransaction('purchase', {
          description: `Compra de ${quantity} ${investmentName}`,
          amount: purchaseCost,
          investmentId: newInvestmentId,
          investmentName: investmentName,
          quantity: quantity,
          price: averagePrice
        });
      }
    }

    window.dispatchEvent(new Event('storage'));
    return true;
  };

  const addDividend = (investmentId, amountPerShare) => {
    const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
    const targetInvestment = allInvestments.find(inv => inv.id === investmentId);

    if (!targetInvestment) {
      toast({ title: "Erro", description: "Ativo não encontrado.", variant: "destructive" });
      return false;
    }
    
    const totalDividendAmount = amountPerShare * targetInvestment.quantity;
    const currentBalance = getBrokerageBalance();

    const updatedInvestments = allInvestments.map(inv => {
      if (inv.id === investmentId) {
        const newDividends = (inv.dividends || 0) + totalDividendAmount;
        const totalReturn = calculateInvestmentReturn(inv.totalValue, newDividends, inv.totalInvested);
        return {
          ...inv,
          dividends: newDividends,
          return: totalReturn,
        };
      }
      return inv;
    });
    localStorage.setItem('investments', JSON.stringify(updatedInvestments));
    updateBrokerageBalance(currentBalance + totalDividendAmount);

    createInvestmentTransaction('dividend', {
      description: `Dividendos de ${targetInvestment.name}`,
      amount: totalDividendAmount,
      investmentId: investmentId,
      investmentName: targetInvestment.name,
      dividendPerShare: amountPerShare,
      quantity: targetInvestment.quantity
    });

    window.dispatchEvent(new Event('storage'));
    return true;
  };

  const sellInvestment = (investmentId, quantityToSell, salePrice) => {
    const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
    const investmentIndex = allInvestments.findIndex(inv => inv.id === investmentId);
    
    if (investmentIndex === -1) {
      toast({ title: "Erro", description: "Investimento não encontrado.", variant: "destructive" });
      return false;
    }

    const investment = allInvestments[investmentIndex];
    
    if (quantityToSell > investment.quantity) {
      toast({ title: "Erro", description: "Quantidade de venda maior que a possuída.", variant: "destructive" });
      return false;
    }

    const saleValue = quantityToSell * salePrice;
    const currentBalance = getBrokerageBalance();
    
    const sellRatio = quantityToSell / investment.quantity;
    const investedToReduce = investment.totalInvested * sellRatio;
    const dividendsToReduce = investment.dividends * sellRatio;

    if (quantityToSell === investment.quantity) {
      allInvestments.splice(investmentIndex, 1);
    } else {
      const newQuantity = investment.quantity - quantityToSell;
      const newTotalInvested = investment.totalInvested - investedToReduce;
      const newDividends = investment.dividends - dividendsToReduce;
      const newTotalValue = newQuantity * investment.currentPrice;
      const totalReturn = calculateInvestmentReturn(newTotalValue, newDividends, newTotalInvested);
      
      allInvestments[investmentIndex] = {
        ...investment,
        quantity: newQuantity,
        totalInvested: newTotalInvested,
        dividends: newDividends,
        totalValue: newTotalValue,
        return: totalReturn
      };
    }

    localStorage.setItem('investments', JSON.stringify(allInvestments));
    updateBrokerageBalance(currentBalance + saleValue);

    createInvestmentTransaction('sale', {
      description: `Venda de ${quantityToSell} ${investment.name}`,
      amount: saleValue,
      investmentId: investmentId,
      investmentName: investment.name,
      quantity: quantityToSell,
      price: salePrice
    });

    toast({ 
      title: "Venda Realizada!", 
      description: `${quantityToSell} unidades de ${investment.name} vendidas por ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleValue)}.` 
    });

    window.dispatchEvent(new Event('storage'));
    return true;
  };

  const deleteInvestmentTransaction = (transactionId, source) => {
    if (source === 'general') {
      let allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const transactionToDelete = allTransactions.find(t => t.id === transactionId);

      if (!transactionToDelete) {
          toast({ title: "Erro", description: "Transação não encontrada.", variant: "destructive"});
          return;
      }
      
      allTransactions = allTransactions.filter(t => t.id !== transactionId);
      localStorage.setItem('transactions', JSON.stringify(allTransactions));

      let currentBrokerageBalance = getBrokerageBalance();

      if (transactionToDelete.category === 'transferencia_corretora' && transactionToDelete.source?.type === 'brokerage_deposit') {
          currentBrokerageBalance -= transactionToDelete.amount;
      } else if (transactionToDelete.category === 'resgate_corretora' && transactionToDelete.source?.type === 'brokerage_withdraw') {
          currentBrokerageBalance += transactionToDelete.amount;
      }
      
      updateBrokerageBalance(currentBrokerageBalance);

    } else {
      let investmentTransactions = JSON.parse(localStorage.getItem('investmentTransactions') || '[]');
      const transactionToDelete = investmentTransactions.find(t => t.id === transactionId);

      if (!transactionToDelete) {
          toast({ title: "Erro", description: "Transação não encontrada.", variant: "destructive"});
          return;
      }

      investmentTransactions = investmentTransactions.filter(t => t.id !== transactionId);
      localStorage.setItem('investmentTransactions', JSON.stringify(investmentTransactions));

      let currentBrokerageBalance = getBrokerageBalance();
      let currentInvestments = JSON.parse(localStorage.getItem('investments') || '[]');

      if (transactionToDelete.transactionType === 'purchase') {
        const investmentIndex = currentInvestments.findIndex(inv => inv.id === transactionToDelete.investmentId);
        if (investmentIndex !== -1) {
          currentBrokerageBalance += transactionToDelete.amount;
          
          const investment = currentInvestments[investmentIndex];
          const newQuantity = investment.quantity - transactionToDelete.quantity;
          const newTotalInvested = investment.totalInvested - transactionToDelete.amount;

          if (newQuantity <= 0) {
            currentInvestments.splice(investmentIndex, 1);
          } else {
            const newAveragePrice = newTotalInvested / newQuantity;
            const newTotalValue = newQuantity * investment.currentPrice;
            const totalReturn = calculateInvestmentReturn(newTotalValue, investment.dividends, newTotalInvested);
            currentInvestments[investmentIndex] = {
              ...investment,
              quantity: newQuantity,
              averagePrice: newAveragePrice,
              totalInvested: newTotalInvested,
              totalValue: newTotalValue,
              return: totalReturn
            };
          }
        }
      } else if (transactionToDelete.transactionType === 'dividend') {
        const investmentIndex = currentInvestments.findIndex(inv => inv.id === transactionToDelete.investmentId);
        if (investmentIndex !== -1) {
          currentBrokerageBalance -= transactionToDelete.amount;
          const investment = currentInvestments[investmentIndex];
          const newDividends = investment.dividends - transactionToDelete.amount;
          const totalReturn = calculateInvestmentReturn(investment.totalValue, newDividends, investment.totalInvested);
          currentInvestments[investmentIndex] = {
            ...investment,
            dividends: newDividends,
            return: totalReturn
          };
        }
      } else if (transactionToDelete.transactionType === 'sale') {
        currentBrokerageBalance -= transactionToDelete.amount;
        const existingInvestmentIndex = currentInvestments.findIndex(inv => inv.id === transactionToDelete.investmentId);
        
        if (existingInvestmentIndex !== -1) {
          const investment = currentInvestments[existingInvestmentIndex];
          const newQuantity = investment.quantity + transactionToDelete.quantity;
          const addedInvestment = transactionToDelete.quantity * transactionToDelete.price;
          const newTotalInvested = investment.totalInvested + addedInvestment;
          const newAveragePrice = newTotalInvested / newQuantity;
          const newTotalValue = newQuantity * investment.currentPrice;
          const totalReturn = calculateInvestmentReturn(newTotalValue, investment.dividends, newTotalInvested);
          
          currentInvestments[existingInvestmentIndex] = {
            ...investment,
            quantity: newQuantity,
            averagePrice: newAveragePrice,
            totalInvested: newTotalInvested,
            totalValue: newTotalValue,
            return: totalReturn
          };
        } else {
          toast({ 
            title: "Aviso", 
            description: "Não é possível reverter venda total. O investimento foi completamente vendido.", 
            variant: "destructive" 
          });
        }
      }
      
      localStorage.setItem('investments', JSON.stringify(currentInvestments));
      updateBrokerageBalance(currentBrokerageBalance);
    }

    toast({ title: "Transação Excluída!", description: "A transação foi removida e os saldos ajustados."});
    window.dispatchEvent(new Event('storage'));
  };

  return {
    saveInvestment,
    addDividend,
    sellInvestment,
    deleteInvestmentTransaction,
    createInvestmentTransaction,
    updateBrokerageBalance,
    getBrokerageBalance
  };
};

export default InvestmentManager;
