import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, FinancialGoal, AIInsight, TransactionCategory } from '@/types/finance';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";

interface FinanceContextType {
  transactions: Transaction[];
  goals: FinancialGoal[];
  insights: AIInsight[];
  balance: number;
  income: number;
  expenses: number;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, amount: number) => void;
  removeGoal: (id: string) => void;
  getCategorySpending: () => { category: TransactionCategory; amount: number }[];
  getRecentTransactions: (limit?: number) => Transaction[];
  markInsightAsRead: (id: string) => void;
  categorizeTransaction: (description: string, amount: number) => TransactionCategory;
  getMonthlySpendingData: () => { name: string; expense: number }[];
}

const FinanceContext = createContext<FinanceContextType>({
  transactions: [],
  goals: [],
  insights: [],
  balance: 0,
  income: 0,
  expenses: 0,
  addTransaction: () => {},
  removeTransaction: () => {},
  addGoal: () => {},
  updateGoal: () => {},
  removeGoal: () => {},
  getCategorySpending: () => [],
  getRecentTransactions: () => [],
  markInsightAsRead: () => {},
  categorizeTransaction: () => 'other',
  getMonthlySpendingData: () => [],
});

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  // Load user data from localStorage
  useEffect(() => {
    if (user) {
      const storedTransactions = localStorage.getItem(`wiseflow-transactions-${user.id}`);
      const storedGoals = localStorage.getItem(`wiseflow-goals-${user.id}`);
      const storedInsights = localStorage.getItem(`wiseflow-insights-${user.id}`);

      setTransactions(storedTransactions ? JSON.parse(storedTransactions) : []);
      setGoals(storedGoals ? JSON.parse(storedGoals) : []);
      setInsights(storedInsights ? JSON.parse(storedInsights) : []);
    } else {
      setTransactions([]);
      setGoals([]);
      setInsights([]);
    }
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`wiseflow-transactions-${user.id}`, JSON.stringify(transactions));
      localStorage.setItem(`wiseflow-goals-${user.id}`, JSON.stringify(goals));
      localStorage.setItem(`wiseflow-insights-${user.id}`, JSON.stringify(insights));
    }
  }, [transactions, goals, insights, user]);

  const balance = transactions.reduce((total, transaction) => {
    return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
  }, 0);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);
    toast({
      title: "Transaction added",
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${transaction.amount} was recorded.`,
    });

    if (transaction.type === 'expense' && transaction.amount > 100) {
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'tip',
        message: `You spent $${transaction.amount} on ${transaction.category}. Want tips to save on this category?`,
        date: new Date().toISOString().split('T')[0],
        read: false,
      };
      setInsights(prev => [newInsight, ...prev]);
    }
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({ title: "Transaction removed", description: "The transaction has been deleted." });
  };

  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal = { ...goal, id: Date.now().toString() };
    setGoals(prev => [...prev, newGoal]);
    toast({ title: "Goal created", description: `Your goal "${goal.name}" has been created.` });
  };

  const updateGoal = (id: string, amount: number) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === id ? { ...goal, currentAmount: goal.currentAmount + amount } : goal
      )
    );
    toast({ title: "Goal updated", description: `You've added $${amount} to your goal.` });

    const goal = goals.find(g => g.id === id);
    if (goal && goal.currentAmount + amount >= goal.targetAmount) {
      const insight: AIInsight = {
        id: Date.now().toString(),
        type: 'achievement',
        message: `Congrats! You reached your goal: "${goal.name}"!`,
        date: new Date().toISOString().split('T')[0],
        read: false,
      };
      setInsights(prev => [insight, ...prev]);
    }
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    toast({ title: "Goal removed", description: "The financial goal has been deleted." });
  };

  const getCategorySpending = () => {
    const spending: Record<TransactionCategory, number> = {} as any;
    transactions
      .filter(t => t.type === 'expense')
      .forEach(({ category, amount }) => {
        spending[category] = (spending[category] || 0) + amount;
      });

    return Object.entries(spending).map(([category, amount]) => ({
      category: category as TransactionCategory,
      amount,
    }));
  };

  const getRecentTransactions = (limit = 5) =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);

  const markInsightAsRead = (id: string) => {
    setInsights(prev => prev.map(i => (i.id === id ? { ...i, read: true } : i)));
  };

  const categorizeTransaction = (description: string, amount: number): TransactionCategory => {
    const desc = description.toLowerCase();
    if (desc.includes('salary') || amount > 1000) return 'income';
    if (desc.includes('grocery') || desc.includes('food')) return 'food';
    if (desc.includes('rent')) return 'housing';
    if (desc.includes('gas') || desc.includes('transport')) return 'transportation';
    if (desc.includes('internet') || desc.includes('water')) return 'utilities';
    if (desc.includes('movie') || desc.includes('netflix')) return 'entertainment';
    if (desc.includes('hospital') || desc.includes('medicine')) return 'healthcare';
    return 'other';
  };

  const getMonthlySpendingData = () => {
    const current = new Date();
    const start = new Date();
    start.setMonth(current.getMonth() - 5);

    const months: Record<string, number> = {};
    for (let i = 0; i < 6; i++) {
      const m = new Date(start);
      m.setMonth(start.getMonth() + i);
      months[m.toLocaleString('default', { month: 'short' })] = 0;
    }

    transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= start)
      .forEach(t => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short' });
        months[month] = (months[month] || 0) + t.amount;
      });

    return Object.entries(months).map(([name, expense]) => ({ name, expense }));
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        goals,
        insights,
        balance,
        income,
        expenses,
        addTransaction,
        removeTransaction,
        addGoal,
        updateGoal,
        removeGoal,
        getCategorySpending,
        getRecentTransactions,
        markInsightAsRead,
        categorizeTransaction,
        getMonthlySpendingData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
