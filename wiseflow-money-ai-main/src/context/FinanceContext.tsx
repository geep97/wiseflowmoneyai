
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, FinancialGoal, AIInsight, TransactionCategory } from '@/types/finance';
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    description: 'Monthly Salary',
    category: 'income',
    date: '2025-05-01',
    type: 'income',
  },
  {
    id: '2',
    amount: 120,
    description: 'Grocery Shopping',
    category: 'food',
    date: '2025-05-02',
    type: 'expense',
  },
  {
    id: '3',
    amount: 45,
    description: 'Gas Station',
    category: 'transportation',
    date: '2025-05-03',
    type: 'expense',
  },
  {
    id: '4',
    amount: 800,
    description: 'Rent Payment',
    category: 'housing',
    date: '2025-05-05',
    type: 'expense',
  },
  {
    id: '5',
    amount: 60,
    description: 'Internet Bill',
    category: 'utilities',
    date: '2025-05-04',
    type: 'expense',
  },
  {
    id: '6',
    amount: 200,
    description: 'Freelance Work',
    category: 'income',
    date: '2025-05-06',
    type: 'income',
  },
  {
    id: '7',
    amount: 35,
    description: 'Movie Tickets',
    category: 'entertainment',
    date: '2025-05-06',
    type: 'expense',
  },
];

const mockGoals: FinancialGoal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 5000,
    currentAmount: 2000,
    deadline: '2025-12-31',
    category: 'savings',
  },
  {
    id: '2',
    name: 'New Laptop',
    targetAmount: 1500,
    currentAmount: 500,
    deadline: '2025-08-30',
    category: 'shopping',
  },
];

const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'tip',
    message: 'You spent 30% more on food this week compared to your monthly average. Consider meal prepping to save money.',
    date: '2025-05-05',
    read: false,
  },
  {
    id: '2',
    type: 'achievement',
    message: 'Great job! You stayed under budget for entertainment this month.',
    date: '2025-05-04',
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    message: 'Your utility bills have increased by 15% over the past three months. Check for any unusual usage.',
    date: '2025-05-03',
    read: false,
  },
];

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

  // Load data from localStorage when user changes
  useEffect(() => {
    if (user) {
      const storedTransactions = localStorage.getItem(`wiseflow-transactions-${user.id}`);
      const storedGoals = localStorage.getItem(`wiseflow-goals-${user.id}`);
      const storedInsights = localStorage.getItem(`wiseflow-insights-${user.id}`);
      
      setTransactions(storedTransactions ? JSON.parse(storedTransactions) : mockTransactions);
      setGoals(storedGoals ? JSON.parse(storedGoals) : mockGoals);
      setInsights(storedInsights ? JSON.parse(storedInsights) : mockInsights);
    } else {
      setTransactions([]);
      setGoals([]);
      setInsights([]);
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`wiseflow-transactions-${user.id}`, JSON.stringify(transactions));
      localStorage.setItem(`wiseflow-goals-${user.id}`, JSON.stringify(goals));
      localStorage.setItem(`wiseflow-insights-${user.id}`, JSON.stringify(insights));
    }
  }, [transactions, goals, insights, user]);

  // Calculate balance, income, and expenses
  const balance = transactions.reduce((total, transaction) => {
    return transaction.type === 'income' 
      ? total + transaction.amount 
      : total - transaction.amount;
  }, 0);

  const income = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    toast({
      title: "Transaction added",
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of $${transaction.amount} was recorded.`,
    });
    
    // Generate a new insight based on the transaction pattern (simulating AI)
    if (transaction.type === 'expense' && transaction.amount > 100) {
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'tip',
        message: `Your recent ${transaction.category} expense of $${transaction.amount} is higher than your usual spending in this category. Would you like tips to save on ${transaction.category}?`,
        date: new Date().toISOString().split('T')[0],
        read: false,
      };
      
      setInsights(prev => [newInsight, ...prev]);
    }
  };

  // Remove a transaction
  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    toast({
      title: "Transaction removed",
      description: "The transaction has been deleted.",
    });
  };

  // Add a new financial goal
  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    
    setGoals(prev => [...prev, newGoal]);
    
    toast({
      title: "Goal created",
      description: `Your goal "${goal.name}" has been created.`,
    });
  };

  // Update a goal's current amount
  const updateGoal = (id: string, amount: number) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id 
          ? { ...goal, currentAmount: goal.currentAmount + amount } 
          : goal
      )
    );
    
    toast({
      title: "Goal updated",
      description: `You've added $${amount} to your goal.`,
    });
    
    // Check if goal is reached and create an insight
    const updatedGoal = goals.find(goal => goal.id === id);
    if (updatedGoal && updatedGoal.currentAmount + amount >= updatedGoal.targetAmount) {
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'achievement',
        message: `Congratulations! You've reached your goal: "${updatedGoal.name}"!`,
        date: new Date().toISOString().split('T')[0],
        read: false,
      };
      
      setInsights(prev => [newInsight, ...prev]);
    }
  };

  // Remove a goal
  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    toast({
      title: "Goal removed",
      description: "The financial goal has been deleted.",
    });
  };

  // Get spending by category
  const getCategorySpending = () => {
    const categorySpending: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;
    
    transactions
      .filter(transaction => transaction.type === 'expense')
      .forEach(transaction => {
        const { category, amount } = transaction;
        categorySpending[category] = (categorySpending[category] || 0) + amount;
      });
    
    return Object.entries(categorySpending).map(([category, amount]) => ({
      category: category as TransactionCategory,
      amount,
    }));
  };

  // Get recent transactions with an optional limit
  const getRecentTransactions = (limit = 5): Transaction[] => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  // Mark an insight as read
  const markInsightAsRead = (id: string) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === id 
          ? { ...insight, read: true } 
          : insight
      )
    );
  };

  // Simulated AI categorization of transactions
  const categorizeTransaction = (description: string, amount: number): TransactionCategory => {
    const desc = description.toLowerCase();
    
    if (desc.includes('salary') || desc.includes('paycheck') || desc.includes('income') || amount > 1000) {
      return 'income';
    }
    if (desc.includes('grocery') || desc.includes('food') || desc.includes('restaurant')) {
      return 'food';
    }
    if (desc.includes('rent') || desc.includes('mortgage')) {
      return 'housing';
    }
    if (desc.includes('gas') || desc.includes('uber') || desc.includes('transport')) {
      return 'transportation';
    }
    if (desc.includes('internet') || desc.includes('water') || desc.includes('utility')) {
      return 'utilities';
    }
    if (desc.includes('movie') || desc.includes('netflix') || desc.includes('game')) {
      return 'entertainment';
    }
    if (desc.includes('doctor') || desc.includes('medicine') || desc.includes('hospital')) {
      return 'healthcare';
    }
    
    // Default to other
    return 'other';
  };

  // Get monthly spending data for charts
  const getMonthlySpendingData = () => {
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5);
    
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthlySpendings: Record<string, number> = {};
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      const monthKey = monthNames[month.getMonth()];
      monthlySpendings[monthKey] = 0;
    }
    
    // Fill in actual spending
    transactions
      .filter(transaction => 
        transaction.type === 'expense' && 
        new Date(transaction.date) >= sixMonthsAgo)
      .forEach(transaction => {
        const month = monthNames[new Date(transaction.date).getMonth()];
        monthlySpendings[month] = (monthlySpendings[month] || 0) + transaction.amount;
      });
    
    return Object.entries(monthlySpendings).map(([name, expense]) => ({
      name,
      expense,
    }));
  };

  return (
    <FinanceContext.Provider value={{
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
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
