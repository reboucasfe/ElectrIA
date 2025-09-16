"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, DollarSign, ArrowUpCircle, ArrowDownCircle, Settings2, CalendarDays } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import TransactionFormModal, { Transaction } from '@/components/finance/TransactionFormModal';
import CategoryFormModal, { TransactionCategory } from '@/components/finance/CategoryFormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays, subDays, isWithinInterval, parseISO, isPast, isToday } from 'date-fns';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CashFlowChart from '@/components/finance/CashFlowChart'; // Importar o novo componente de gráfico

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const Finance = () => {
  const { user } = useAuth();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]); // Todas as transações
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(null);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  const [isCategoryAlertOpen, setIsCategoryAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<TransactionCategory | null>(null);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
      setAllTransactions([]);
    } else {
      setAllTransactions(data as Transaction[]);
    }
    setLoading(false);
  }, [user]);

  const fetchCategories = useCallback(async () => {
    if (!user?.id) {
      setCategories([]);
      return;
    }
    const { data, error } = await supabase
      .from('transaction_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
      setCategories([]);
    } else {
      setCategories(data as TransactionCategory[]);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  const filteredTransactions = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return allTransactions;
    }
    return allTransactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      // Inclui o dia 'to' completo
      return isWithinInterval(transactionDate, { start: dateRange.from!, end: addDays(dateRange.to!, 1) });
    });
  }, [allTransactions, dateRange]);

  const { pastTransactions, futureIncomes, futureExpenses } = useMemo(() => {
    const today = new Date();
    const past: Transaction[] = [];
    const futureInc: Transaction[] = [];
    const futureExp: Transaction[] = [];

    allTransactions.forEach(t => {
      const transactionDate = parseISO(t.date);
      if (isPast(transactionDate) || isToday(transactionDate)) {
        past.push(t);
      } else {
        if (t.type === 'income') {
          futureInc.push(t);
        } else {
          futureExp.push(t);
        }
      }
    });

    // Ordenar futuras por data crescente
    futureInc.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    futureExp.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    return { pastTransactions: past, futureIncomes: futureInc, futureExpenses: futureExp };
  }, [allTransactions]);

  const kpiData = useMemo(() => {
    const totalIncome = pastTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = pastTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return [
      {
        title: "Saldo Atual",
        value: formatCurrency(balance),
        icon: DollarSign,
        description: "Total de receitas - Total de despesas (passadas)",
        color: balance >= 0 ? 'text-green-600' : 'text-red-600',
      },
      {
        title: "Total de Receitas",
        value: formatCurrency(totalIncome),
        icon: ArrowUpCircle,
        description: "Entradas no período (passadas)",
        color: 'text-green-600',
      },
      {
        title: "Total de Despesas",
        value: formatCurrency(totalExpenses),
        icon: ArrowDownCircle,
        description: "Saídas no período (passadas)",
        color: 'text-red-600',
      },
    ];
  }, [pastTransactions]);

  const handleAddNewTransaction = () => {
    setSelectedTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransactionClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsAlertOpen(true);
  };

  const handleDeleteTransactionConfirm = async () => {
    if (!transactionToDelete) return;

    const { error } = await supabase.from('transactions').delete().eq('id', transactionToDelete.id);

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
    } else {
      showSuccess('Transação excluída com sucesso!');
      fetchTransactions();
    }
    setIsAlertOpen(false);
    setTransactionToDelete(null);
  };

  const handleOpenManageCategoriesModal = () => {
    setIsManageCategoriesModalOpen(true);
  };

  const handleOpenCategoryFormModal = (category?: TransactionCategory) => {
    setSelectedCategory(category || null);
    setIsCategoryFormModalOpen(true);
  };

  const handleCloseCategoryFormModal = () => {
    setIsCategoryFormModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCategorySaved = () => {
    fetchCategories();
    handleCloseCategoryFormModal();
  };

  const handleDeleteCategoryClick = (category: TransactionCategory) => {
    setCategoryToDelete(category);
    setIsCategoryAlertOpen(true);
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!categoryToDelete) return;

    const { count, error: countError } = await supabase
      .from('transactions')
      .select('id', { count: 'exact' })
      .eq('category', categoryToDelete.name)
      .eq('user_id', user?.id);

    if (countError) {
      showError(getTranslatedErrorMessage(countError.message));
      setIsCategoryAlertOpen(false);
      setCategoryToDelete(null);
      return;
    }

    if (count && count > 0) {
      showError(`Não é possível excluir a categoria "${categoryToDelete.name}" porque existem ${count} transações associadas a ela. Por favor, edite ou exclua as transações primeiro.`);
      setIsCategoryAlertOpen(false);
      setCategoryToDelete(null);
      return;
    }

    const { error } = await supabase.from('transaction_categories').delete().eq('id', categoryToDelete.id);

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
    } else {
      showSuccess('Categoria excluída com sucesso!');
      fetchCategories();
    }
    setIsCategoryAlertOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finanças</h1>
          <p className="text-gray-500">Controle suas entradas e saídas.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleOpenManageCategoriesModal} variant="outline">
            <Settings2 className="mr-2 h-4 w-4" /> Gerenciar Categorias
          </Button>
          <Button onClick={handleAddNewTransaction} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Transação
          </Button>
        </div>
      </div>

      {/* Filtro de Período para KPIs e Histórico */}
      <div className="flex justify-end">
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <div className={`text-2xl font-bold ${kpi.color || ''}`}>{kpi.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Fluxo de Caixa */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa Projetado</CardTitle>
          <CardDescription>Visualize o saldo da sua conta ao longo do tempo, incluindo transações futuras.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <CashFlowChart
              transactions={allTransactions} // Passa todas as transações para o gráfico
              onTransactionClick={handleEditTransaction}
            />
          )}
        </CardContent>
      </Card>

      {/* Seção de Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Receber</CardTitle>
          <CardDescription>Receitas futuras agendadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : futureIncomes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {futureIncomes.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell>{transaction.category || '-'}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTransactionClick(transaction)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarDays className="mx-auto h-12 w-12 mb-3 text-gray-400" />
              <p>Nenhuma conta a receber agendada.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Contas a Pagar */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Pagar</CardTitle>
          <CardDescription>Despesas futuras agendadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : futureExpenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {futureExpenses.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell>{transaction.category || '-'}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTransactionClick(transaction)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarDays className="mx-auto h-12 w-12 mb-3 text-gray-400" />
              <p>Nenhuma conta a pagar agendada.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Histórico de Transações (Passadas) */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Todas as suas entradas e saídas registradas no período selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell>{transaction.category || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTransactionClick(transaction)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">Nenhuma transação registrada</h3>
              <p className="text-sm text-gray-500 mt-1">Comece adicionando sua primeira entrada ou despesa.</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleAddNewTransaction}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Transação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <TransactionFormModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={fetchTransactions}
        transaction={selectedTransaction}
        availableCategories={categories}
        onOpenCategoryModal={handleOpenCategoryFormModal}
      />

      <CategoryFormModal
        isOpen={isCategoryFormModalOpen}
        onClose={handleCloseCategoryFormModal}
        onSave={handleCategorySaved}
        category={selectedCategory}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a transação de "{transactionToDelete?.description || transactionToDelete?.category}" no valor de {formatCurrency(transactionToDelete?.amount || 0)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransactionConfirm} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isCategoryAlertOpen} onOpenChange={setIsCategoryAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza que deseja excluir esta categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria "{categoryToDelete?.name}" será excluída.
              Se houver transações associadas a esta categoria, a exclusão não será permitida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategoryConfirm} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Gerenciamento de Categorias (para listar e editar) */}
      <Dialog open={isManageCategoriesModalOpen} onOpenChange={setIsManageCategoriesModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
            <DialogDescription>
              Adicione, edite ou exclua suas categorias de transações.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Button onClick={() => handleOpenCategoryFormModal()} className="w-full bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Categoria
            </Button>
            {categories.length === 0 ? (
              <p className="text-center text-gray-500">Nenhuma categoria cadastrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{cat.type === 'income' ? 'Receita' : 'Despesa'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenCategoryFormModal(cat)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteCategoryClick(cat)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsManageCategoriesModalOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finance;