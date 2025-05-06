
import { useFinance } from '@/context/FinanceContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export function RecentTransactions() {
  const { getRecentTransactions } = useFinance();
  const recentTransactions = getRecentTransactions(5);

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

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex flex-col">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getCategoryColor(transaction.category)}>
                      {transaction.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No transactions yet. Add your first transaction!
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/transactions">View All Transactions</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
