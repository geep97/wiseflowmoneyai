import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Profile = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { balance, income, expenses, transactions, goals } = useFinance();
  
  if (!isAuthenticated) {
    return <Login />;
  }

  // Get user's name from profile or fallback to email
  const userName = user?.profile?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  // Calculate financial health score (simplified example)
  const calculateFinancialHealthScore = () => {
    // Factors considered:
    // 1. Saving rate (income - expenses) / income
    // 2. Number of goals set
    // 3. Regular transactions
    
    let score = 0;
    
    // Saving rate (up to 50 points)
    const savingRate = income > 0 ? (income - expenses) / income : 0;
    score += Math.min(savingRate * 100, 50);
    
    // Goals (up to 30 points)
    score += Math.min(goals.length * 10, 30);
    
    // Regular transactions (up to 20 points)
    score += Math.min(transactions.length * 2, 20);
    
    return Math.round(score);
  };

  const financialHealthScore = calculateFinancialHealthScore();
  
  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#0ea5e9'; // blue
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };
  
  // Prepare data for the pie chart
  const scoreData = [
    { name: 'Score', value: financialHealthScore },
    { name: 'Remaining', value: 100 - financialHealthScore },
  ];
  
  const COLORS = [getScoreColor(financialHealthScore), '#e5e7eb'];

  // Get a personalized message based on the score
  const getScoreMessage = (score: number) => {
    if (score >= 80) {
      return "Excellent financial health! You're saving well and have clear goals.";
    } else if (score >= 60) {
      return "Good financial habits. Consider setting more financial goals for the future.";
    } else if (score >= 40) {
      return "You're on the right track. Try to increase your savings rate and set more specific goals.";
    } else {
      return "There's room for improvement. Focus on reducing expenses and building an emergency fund.";
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View and manage your account information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user?.profile?.avatar_url || '/placeholder.svg'} alt={userName} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mb-1">{userName}</h2>
            <p className="text-muted-foreground mb-4">{user?.email}</p>
            <Button variant="outline" className="w-full mb-2">
              Edit Profile
            </Button>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={logout}
            >
              Log Out
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
            <CardDescription>An assessment of your overall financial wellbeing</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold"
                    fill={getScoreColor(financialHealthScore)}
                  >
                    {financialHealthScore}
                  </text>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {financialHealthScore >= 80 ? 'Excellent' :
                 financialHealthScore >= 60 ? 'Good' :
                 financialHealthScore >= 40 ? 'Fair' : 'Needs Attention'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {getScoreMessage(financialHealthScore)}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Saving Rate:</span>
                  <span className="font-medium">
                    {income > 0 
                      ? `${(((income - expenses) / income) * 100).toFixed(1)}%` 
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Financial Goals:</span>
                  <span className="font-medium">{goals.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transactions Tracked:</span>
                  <span className="font-medium">{transactions.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Overview of your current finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Total Income</div>
                  <div className="text-xl font-bold text-green-700">${income.toFixed(2)}</div>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600 mb-1">Total Expenses</div>
                  <div className="text-xl font-bold text-red-700">${expenses.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Active Goals</div>
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold">{goals.length}</div>
                  <Button variant="outline" size="sm" className="h-8">
                    Manage Goals
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 hover:bg-muted rounded-lg transition-colors">
              <div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive alerts and insights</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-4 hover:bg-muted rounded-lg transition-colors">
              <div>
                <h3 className="font-medium">Data Privacy</h3>
                <p className="text-sm text-muted-foreground">Manage your data</p>
              </div>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-4 hover:bg-muted rounded-lg transition-colors">
              <div>
                <h3 className="font-medium">Connect Accounts</h3>
                <p className="text-sm text-muted-foreground">Link financial accounts</p>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-4 hover:bg-muted rounded-lg transition-colors">
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download your financial data</p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Profile;
