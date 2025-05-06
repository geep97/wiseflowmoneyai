
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingOverview } from '@/components/dashboard/SpendingOverview';
import { FinancialGoals } from '@/components/dashboard/FinancialGoals';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your financial overview.</p>
        </div>
        <AddTransactionDialog>
          <Button className="gap-2">
            <Coins size={16} />
            Add Transaction
          </Button>
        </AddTransactionDialog>
      </div>

      <div className="space-y-8">
        <DashboardCards />
        
        <div className="grid gap-6 md:grid-cols-2">
          <RecentTransactions />
          <AIInsights />
        </div>
        
        <SpendingOverview />
        
        <div className="grid gap-6 md:grid-cols-2">
          <FinancialGoals />
          <AIAssistant />
        </div>
      </div>
    </AppShell>
  );
};

export default Index;
