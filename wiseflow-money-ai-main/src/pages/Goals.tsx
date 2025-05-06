
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { Login } from '@/pages/Login';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, differenceInDays } from 'date-fns';
import { Calendar } from 'lucide-react';

const Goals = () => {
  const { isAuthenticated } = useAuth();
  const { goals, addGoal, updateGoal, removeGoal } = useFinance();
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');
  
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleAddGoal = () => {
    if (!name || !targetAmount || !deadline || !category) return;
    
    addGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      deadline,
      category,
    });
    
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setCategory('');
  };

  const handleContribution = () => {
    if (!selectedGoalId || !contributionAmount) return;
    
    updateGoal(selectedGoalId, parseFloat(contributionAmount));
    
    setContributionDialogOpen(false);
    setSelectedGoalId('');
    setContributionAmount('');
  };

  const openContributionDialog = (goalId: string) => {
    setSelectedGoalId(goalId);
    setContributionDialogOpen(true);
  };

  const calculateDaysRemaining = (deadlineStr: string) => {
    const today = new Date();
    const deadline = new Date(deadlineStr);
    return differenceInDays(deadline, today);
  };

  const getStatusColor = (progress: number, daysRemaining: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (daysRemaining < 0) return 'bg-red-500';
    if (daysRemaining < 30 && progress < 50) return 'bg-orange-500';
    return 'bg-primary';
  };

  const categories = [
    'savings', 'emergency', 'retirement', 'vacation', 
    'education', 'home', 'car', 'debt', 'technology', 'other'
  ];

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground">Track your progress towards your financial targets.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Calendar size={16} />
              Create New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Financial Goal</DialogTitle>
              <DialogDescription>
                Set a new financial goal to work towards.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Goal Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Emergency Fund"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target" className="text-right">
                  Target Amount
                </Label>
                <Input
                  id="target"
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current" className="text-right">
                  Current Amount
                </Label>
                <Input
                  id="current"
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0.00"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">
                  Target Date
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysRemaining = calculateDaysRemaining(goal.deadline);
            const statusColor = getStatusColor(progress, daysRemaining);
            
            return (
              <Card key={goal.id} className="shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{goal.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeGoal(goal.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <span className="capitalize">{goal.category}</span>
                    <span className="text-xs mx-1">•</span>
                    <span>
                      Due {format(new Date(goal.deadline), 'MMM d, yyyy')}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress > 100 ? 100 : progress} className={`h-2 ${statusColor}`} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Current</span>
                      <p className="text-xl font-semibold">${goal.currentAmount.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-xs text-muted-foreground">Target</span>
                      <p className="text-xl font-semibold">${goal.targetAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-muted-foreground block">Time Remaining</span>
                        <span className={`font-medium ${daysRemaining < 0 ? 'text-red-500' : ''}`}>
                          {daysRemaining < 0 
                            ? `${Math.abs(daysRemaining)} days overdue` 
                            : `${daysRemaining} days left`}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Still Need</span>
                        <span className="font-medium">
                          ${(goal.targetAmount - goal.currentAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={progress >= 100 ? "outline" : "default"}
                    onClick={() => openContributionDialog(goal.id)}
                    disabled={progress >= 100}
                  >
                    {progress >= 100 ? "Goal Completed!" : "Add Contribution"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No Financial Goals Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first financial goal to start tracking your progress.
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Create Your First Goal</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <Dialog open={contributionDialogOpen} onOpenChange={setContributionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add money towards your financial goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contribution" className="text-right">
                Amount
              </Label>
              <Input
                id="contribution"
                type="number"
                step="0.01"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="0.00"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setContributionDialogOpen(false);
              setContributionAmount('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleContribution}>Add Contribution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Goals;
