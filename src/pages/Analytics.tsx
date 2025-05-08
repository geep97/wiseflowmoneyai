
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TransactionCategory } from '@/types/finance';

const Analytics = () => {
  const { isAuthenticated } = useAuth();
  const { 
    transactions, 
    getCategorySpending, 
    getMonthlySpendingData 
  } = useFinance();

  if (!isAuthenticated) {
    return <Login />;
  }

  const monthlySpending = getMonthlySpendingData();
  const categorySpending = getCategorySpending();

  // Colors for charts
  const COLORS = [
    '#0694a2', '#3f83f8', '#8b5cf6', '#ff5a1f', 
    '#84cc16', '#06b6d4', '#f97316', '#14b8a6',
    '#ec4899', '#8b5cf6', '#34d399', '#fbbf24'
  ];

  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Calculate yearly averages by category
  const yearlyAverages = categorySpending.map(item => ({
    category: item.category,
    amount: (item.amount / 12).toFixed(2)
  }));

  // Prepare data for income vs expense trend
  const prepareIncomeExpenseData = () => {
    const monthlySummary: Record<string, { month: string, income: number, expense: number }> = {};
    
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Initialize with zero values for the last 6 months
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(currentDate.getMonth() - i);
      const monthKey = monthNames[month.getMonth()];
      monthlySummary[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    
    // Fill in with actual data
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = monthNames[date.getMonth()];
      
      // Only process the last 6 months
      if (monthlySummary[monthKey]) {
        if (transaction.type === 'income') {
          monthlySummary[monthKey].income += transaction.amount;
        } else {
          monthlySummary[monthKey].expense += transaction.amount;
        }
      }
    });
    
    return Object.values(monthlySummary);
  };

  const incomeExpenseData = prepareIncomeExpenseData();

  // Function to capitalize first letter of a string
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Visualize your financial data and trends.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Distribution</CardTitle>
              <CardDescription>See how your spending patterns change over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySpending}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={formatCurrency} />
                    <Legend />
                    <Bar dataKey="expense" name="Monthly Expenses" fill="#0694a2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense by Category</CardTitle>
                <CardDescription>Your spending breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpending}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ category, percent }) => 
                          `${capitalizeFirstLetter(category as string)} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={formatCurrency} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Balance between earnings and spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={incomeExpenseData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={formatCurrency} />
                      <Tooltip formatter={formatCurrency} />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#10b981" />
                      <Bar dataKey="expense" name="Expenses" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Detailed view of your spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Total Spent</th>
                      <th className="px-6 py-3">% of Expenses</th>
                      <th className="px-6 py-3">Monthly Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySpending.map((item, index) => {
                      const totalExpenses = categorySpending.reduce((sum, cat) => sum + cat.amount, 0);
                      const percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
                      
                      return (
                        <tr key={index} className="bg-white border-b hover:bg-muted/30">
                          <td className="px-6 py-4 font-medium">
                            {capitalizeFirstLetter(item.category)}
                          </td>
                          <td className="px-6 py-4">${item.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">{percentage.toFixed(1)}%</td>
                          <td className="px-6 py-4">${(item.amount / 12).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Visual representation of your spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpending}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                      >
                        {categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={formatCurrency} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Comparison</CardTitle>
                <CardDescription>See how different categories compare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categorySpending}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={formatCurrency} />
                      <YAxis 
                        dataKey="category" 
                        type="category" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={capitalizeFirstLetter}
                      />
                      <Tooltip formatter={formatCurrency} />
                      <Bar 
                        dataKey="amount" 
                        fill="#0694a2"
                        name="Spend Amount"
                      >
                        {categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses Trend</CardTitle>
              <CardDescription>See how your finances have evolved over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={incomeExpenseData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={formatCurrency} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      name="Income" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      name="Expenses" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Saving Potential</CardTitle>
              <CardDescription>Analyze your saving opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Based on your spending patterns, here are some insights that could help you save money:
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {categorySpending.length > 0 ? (
                    categorySpending
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 4)
                      .map((category, index) => (
                        <Card key={index} className="border-l-4" style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-1">
                              {capitalizeFirstLetter(category.category)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              This is one of your highest spending categories at ${category.amount.toFixed(2)}.
                            </p>
                            <p className="text-sm">
                              {category.category === 'food' 
                                ? 'Consider meal prepping to reduce restaurant expenses.' 
                                : category.category === 'housing'
                                ? 'Look into refinancing options or roommate opportunities.'
                                : category.category === 'entertainment'
                                ? 'Check for subscription overlaps or services you rarely use.'
                                : category.category === 'shopping'
                                ? 'Try implementing a 24-hour waiting period before non-essential purchases.'
                                : 'Review if there are more cost-effective alternatives available.'}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                  ) : (
                    <div className="col-span-2 text-center py-10 text-muted-foreground">
                      Add more transactions to see personalized saving recommendations.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
};

export default Analytics;
