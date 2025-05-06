
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function FinancialGoals() {
  const { goals } = useFinance();
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Financial Goals</CardTitle>
            <CardDescription>Track your progress towards financial targets</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link to="/goals">Manage Goals</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length > 0 ? (
          <div className="space-y-6">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Target: ${goal.targetAmount.toFixed(2)} by {format(new Date(goal.deadline), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${goal.currentAmount.toFixed(2)} <span className="text-muted-foreground font-normal">/ ${goal.targetAmount.toFixed(2)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {progress.toFixed(0)}% Complete
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={progress > 100 ? 100 : progress} 
                    className="h-2" 
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No goals set yet. Create your first financial goal!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
