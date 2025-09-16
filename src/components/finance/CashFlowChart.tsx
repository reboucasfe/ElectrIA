"use client";

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, isSameDay, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '@/components/finance/TransactionFormModal';

interface CashFlowChartProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const CashFlowChart = ({ transactions, onTransactionClick }: CashFlowChartProps) => {

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Ordenar transações por data
    const sortedTransactions = [...transactions].sort((a, b) =>
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );

    // Determinar o intervalo de datas para o gráfico (últimos 3 meses + próximos 3 meses)
    const today = new Date();
    const startDate = startOfMonth(addMonths(today, -3));
    const endDate = endOfMonth(addMonths(today, 3));

    const daysInInterval = eachDayOfInterval({ start: startDate, end: endDate });

    let runningBalance = 0;
    // Calcular o saldo inicial antes do período do gráfico
    sortedTransactions.filter(t => parseISO(t.date) < startDate).forEach(t => {
      runningBalance += (t.type === 'income' ? t.amount : -t.amount);
    });

    const data: { date: string; balance: number; transactions: Transaction[] }[] = [];
    let transactionIndex = 0;

    daysInInterval.forEach(day => {
      let dailyBalanceChange = 0;
      const dailyTransactions: Transaction[] = [];

      // Adicionar transações do dia
      while (transactionIndex < sortedTransactions.length && isSameDay(parseISO(sortedTransactions[transactionIndex].date), day)) {
        const t = sortedTransactions[transactionIndex];
        dailyBalanceChange += (t.type === 'income' ? t.amount : -t.amount);
        dailyTransactions.push(t);
        transactionIndex++;
      }

      runningBalance += dailyBalanceChange;
      data.push({
        date: format(day, 'dd/MM', { locale: ptBR }),
        balance: runningBalance,
        transactions: dailyTransactions,
      });
    });

    return data;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentData = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-md shadow-lg text-sm">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-gray-700">Saldo: <span className="font-semibold">{formatCurrency(currentData.balance)}</span></p>
          {currentData.transactions.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <p className="font-semibold mb-1">Transações do dia:</p>
              {currentData.transactions.map((t: Transaction) => (
                <p key={t.id} className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                  {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)} ({t.description || t.category})
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const today = new Date();
    const dotDate = parseISO(payload.date.split('/').reverse().join('-') + `-${today.getFullYear()}`); // Reconstruct date for comparison

    let fillColor = '#8884d8'; // Default blue
    if (payload.transactions.length > 0) {
      const hasIncome = payload.transactions.some((t: Transaction) => t.type === 'income');
      const hasExpense = payload.transactions.some((t: Transaction) => t.type === 'expense');
      if (hasIncome && !hasExpense) fillColor = '#10B981'; // Green for income
      if (hasExpense && !hasIncome) fillColor = '#EF4444'; // Red for expense
      if (hasIncome && hasExpense) fillColor = '#F59E0B'; // Orange for mixed
    }

    if (isSameDay(dotDate, today)) {
      fillColor = '#2563EB'; // Darker blue for today
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fillColor}
        stroke="#fff"
        strokeWidth={1}
        onClick={() => {
          if (payload.transactions.length > 0) {
            // Se houver múltiplas transações no dia, podemos abrir a primeira para edição
            // Ou, idealmente, um modal que liste todas as transações do dia
            onTransactionClick(payload.transactions[0]);
          }
        }}
        style={{ cursor: payload.transactions.length > 0 ? 'pointer' : 'default' }}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#2563EB"
          activeDot={{ r: 8 }}
          dot={<CustomDot />}
        />
        {/* Linha de referência para o saldo zero */}
        <ReferenceDot y={0} fill="transparent" stroke="#ccc" strokeDasharray="3 3" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;