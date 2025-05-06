
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { TransactionCategory } from '@/types/finance';
import { Coins, Search, Trash2 } from 'lucide-react';

const Transactions = () => {
  const { isAuthenticated } = useAuth();
  const { transactions, removeTransaction } = useFinance();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: new Date().toISOString().split('T')[0],
  });

  if (!isAuthenticated) {
    return <Login />;
  }

  const categories: TransactionCategory[] = [
    'food', 'housing', 'transportation', 'utilities', 
    'entertainment', 'healthcare', 'shopping', 'personal',
    'education', 'travel', 'income', 'savings', 'investments', 'other'
  ];

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      food: 'bg-orange-100 text-orange-800',
      housing: 'bg-blue-100 text-blue-800',
      transportation: 'bg-indigo-100 text-indigo-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      entertainment: 'bg-purple-100 text-purple-800',
      healthcare: 'bg-green-100 text-green-800',
      shopping: 'bg-pink-100 text-pink-800',
      personal: 'bg-teal-100 text-teal-800',
      education: 'bg-emerald-100 text-emerald-800',
      travel: 'bg-cyan-100 text-cyan-800',
      income: 'bg-green-100 text-green-800',
      savings: 'bg-blue-100 text-blue-800',
      investments: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };

    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Apply search term filter
    const matchesSearch = 
      searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = 
      categoryFilter === 'all' || 
      transaction.category === categoryFilter;
    
    // Apply type filter
    const matchesType = 
      typeFilter === 'all' || 
      transaction.type === typeFilter;
    
    // Apply date range filter
    let matchesDateRange = true;
    if (dateRange.from) {
      const transactionDate = parseISO(transaction.date);
      const fromDate = parseISO(dateRange.from);
      matchesDateRange = 
        isAfter(transactionDate, fromDate) || 
        isEqual(transactionDate, fromDate);
    }
    if (dateRange.to) {
      const transactionDate = parseISO(transaction.date);
      const toDate = parseISO(dateRange.to);
      matchesDateRange = 
        matchesDateRange && 
        (isBefore(transactionDate, toDate) || 
        isEqual(transactionDate, toDate));
    }
    
    return matchesSearch && matchesCategory && matchesType && matchesDateRange;
  });

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalIncome = sortedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = sortedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your financial activity.</p>
        </div>
        <AddTransactionDialog>
          <Button className="gap-2">
            <Coins size={16} />
            Add Transaction
          </Button>
        </AddTransactionDialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
          <CardDescription>Narrow down your transaction list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search description..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as TransactionCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | 'income' | 'expense')}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-1/2"
                />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-1/2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {sortedTransactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="bg-white border-b hover:bg-muted/30">
                      <td className="px-6 py-4">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getCategoryColor(transaction.category)}>
                          {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No transactions found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
};

export default Transactions;
