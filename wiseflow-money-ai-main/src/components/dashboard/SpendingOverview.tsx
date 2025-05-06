
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

export function SpendingOverview() {
  const { getCategorySpending, getMonthlySpendingData } = useFinance();
  
  const categorySpending = getCategorySpending();
  const monthlySpending = getMonthlySpendingData();
  
  const COLORS = ['#0694a2', '#3f83f8', '#8b5cf6', '#ff5a1f', '#84cc16', '#06b6d4', '#f97316', '#14b8a6'];

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const capitalizeCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Monthly Spending</CardTitle>
          <CardDescription>Compare your expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySpending}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={formatCurrency} />
                <Bar dataKey="expense" fill="#0694a2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>See where your money goes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpending}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ category, percent }) => 
                    `${capitalizeCategory(category)} ${(percent * 100).toFixed(0)}%`
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
    </div>
  );
}
