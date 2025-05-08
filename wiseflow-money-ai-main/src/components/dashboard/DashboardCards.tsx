
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, ArrowDown, ArrowUp, PieChart } from "lucide-react";

export function DashboardCards() {
  const { balance, income, expenses } = useFinance();
  
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-md">
        <CardHeader className="pb-2 flex flex-row justify-between items-center space-y-0">
          <CardTitle className="text-lg font-semibold">Current Balance</CardTitle>
          <div className="p-2 bg-primary bg-opacity-10 rounded-full">
            <Coins className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Available funds
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2 flex flex-row justify-between items-center space-y-0">
          <CardTitle className="text-lg font-semibold">Income</CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <ArrowUp className="w-5 h-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">${income.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Total earnings
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2 flex flex-row justify-between items-center space-y-0">
          <CardTitle className="text-lg font-semibold">Expenses</CardTitle>
          <div className="p-2 bg-red-100 rounded-full">
            <ArrowDown className="w-5 h-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">${expenses.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Total spending
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2 flex flex-row justify-between items-center space-y-0">
          <CardTitle className="text-lg font-semibold">Savings Rate</CardTitle>
          <div className="p-2 bg-teal-100 rounded-full">
            <PieChart className="w-5 h-5 text-teal-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-teal-600">{savingsRate.toFixed(1)}%</div>
          <Progress 
            className="h-2 mt-2" 
            value={savingsRate > 100 ? 100 : savingsRate} 
          />
          <p className="text-sm text-muted-foreground mt-2">
            {savingsRate >= 20 
              ? "Great savings rate!" 
              : savingsRate > 0 
                ? "Could improve savings" 
                : "Spending exceeds income"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
