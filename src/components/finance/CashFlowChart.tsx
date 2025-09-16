"use client";

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, isSameDay, isPast, isToday, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '@/components/finance/TransactionFormModal';

interface CashFlowChartProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
  startDate: Date; // Nova prop
  endDate: Date;   // Nova prop
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const CashFlowChart = ({ transactions, onTransactionClick, startDate, endDate }: CashFlowChartProps) => {

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      // Se não houver transações, ainda queremos mostrar o período selecionado com saldo zero
      const daysInInterval = eachDayOfInterval({ start: startDate, end: endDate });
      return daysInInterval.map(day => ({
        date: format(day, 'yyyy-MM-dd'), // Formato ISO para consistência interna
        balance: 0,
        transactions: [],
      }));
    }

    const sortedTransactions = [...transactions].sort((a, b) =>
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );

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
        date: format(day, 'yyyy-MM-dd'), // Formato ISO para consistência interna
        balance: runningBalance,
        transactions: dailyTransactions,
      });
    });

    return data;
  }, [transactions, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentData = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-md shadow-lg text-sm">
          <p className="font-bold mb-1">{format(parseISO(label), 'PPP', { locale: ptBR })}</p>
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
    const dotDate = parseISO(payload.date);

    let fillColor = '#2563EB'; // Default blue
    if (payload.transactions.length > 0) {
      const hasIncome = payload.transactions.some((t: Transaction) => t.type === 'income');
      const hasExpense = payload.transactions.some((t: Transaction) => t.type === 'expense');
      if (hasIncome && !hasExpense) fillColor = '#10B981'; // Green for income
      if (hasExpense && !hasIncome) fillColor = '#EF4444'; // Red for expense
      if (hasIncome && hasExpense) fillColor = '#F59E0B'; // Orange for mixed
    }

    if (isSameDay(dotDate, today)) {
      fillColor = '#60A5FA'; // Lighter blue for today's dot
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
            onTransactionClick(payload.transactions[0]);
          }
        }}
        style={{ cursor: payload.transactions.length > 0 ? 'pointer' : 'default' }}
      />
    );
  };

  const xAxisTickFormatter = (tick: string) => {
    const diffDays = differenceInDays(endDate, startDate);
    if (diffDays <= 7) { // Semana ou menos
      return format(parseISO(tick), 'dd/MM', { locale: ptBR });
    } else if (diffDays <= 31) { // Mês
      return format(parseISO(tick), 'dd', { locale: ptBR });
    } else if (diffDays <= 365) { // Ano
      return format(parseISO(tick), 'MMM', { locale: ptBR });
    }
    return format(parseISO(tick), 'MMM/yy', { locale: ptBR });
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
        <XAxis
          dataKey="date"
          tickFormatter={xAxisTickFormatter}
          minTickGap={20} // Ajuda a evitar sobreposição de rótulos
        />
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