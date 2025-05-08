import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFinance } from '@/context/FinanceContext';
import { Send } from 'lucide-react';

export function AIAssistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    {
      role: 'assistant',
      content:
        'Hi! I\'m your financial assistant 💰 Ask me anything like "How much did I spend on food this month?" or "Can I afford a $200 purchase?"',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const { transactions, balance, income, expenses } = useFinance();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);

    setTimeout(() => {
      const response = generateResponse(query);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
      setQuery('');
    }, 1000);
  };

  const suggestFollowUps = () => {
    const suggestions = [
      "Want to know how much you spent this month?",
      "Need help planning a purchase?",
      "Curious about your savings rate?",
      "Thinking of making a big purchase?",
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const generateResponse = (userQuery: string): string => {
    const lowerQuery = userQuery.toLowerCase();

    // Casual responses
    if (['ok', 'thanks', 'thank you', 'cool', 'got it', 'great','fine','alright'].some(p => lowerQuery.includes(p))) {
      return `Glad I could help! 😊 Let me know if you have more questions about your money.`;
    }

    if (['bye', 'goodbye', 'see you', 'talk later'].some(p => lowerQuery.includes(p))) {
      return `Alright, take care! I'm always here if you need help with your finances. 👋`;
    }

    // Financial queries
    if (lowerQuery.includes('balance') || lowerQuery.includes('money') || lowerQuery.includes('have')) {
      return `Your current balance is $${balance.toFixed(2)}.\n\n${suggestFollowUps()}`;
    }

    if (lowerQuery.includes('spend') && lowerQuery.includes('food')) {
      const foodSpending = transactions
        .filter(t => t.category === 'food' && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return `You've spent $${foodSpending.toFixed(2)} on food so far.\n\nWant to see spending in other categories too?`;
    }

    if (lowerQuery.includes('income') || lowerQuery.includes('earn')) {
      return `Your total income is $${income.toFixed(2)}.\n\n${suggestFollowUps()}`;
    }

    if (lowerQuery.includes('expenses') || lowerQuery.includes('spent')) {
      return `Your total expenses are $${expenses.toFixed(2)}.\n\nNeed tips to reduce spending?`;
    }

    if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
      return `You're currently saving ${savingsRate.toFixed(1)}% of your income. ${
        savingsRate >= 20
          ? "Nice job! You’re basically a budgeting ninja 🥷💰."
          : "Let’s try to bump that up — even 5% more can make a difference 📈."
      }`;
    }

    if (lowerQuery.includes('afford') && lowerQuery.match(/\$\d+/)) {
      const amountMatch = lowerQuery.match(/\$(\d+)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1]);
        if (balance >= amount * 2) {
          return `Yes, you can comfortably afford a $${amount} purchase, as it's less than half of your current balance of $${balance.toFixed(2)}.`;
        } else if (balance >= amount) {
          return `You have enough for a $${amount} purchase, but it would use a significant portion of your balance. Think it through 🧠.`;
        } else {
          return `A $${amount} purchase exceeds your current balance of $${balance.toFixed(2)}. I’d recommend holding off for now.`;
        }
      }
    }

    // Fallback response
    return `Hmm, I’m not sure how to answer that yet 🤔. Try asking about your balance, income, expenses, savings, or if you can afford something.`;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Financial Assistant</CardTitle>
        <CardDescription>Ask me anything about your finances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-[300px] overflow-y-auto p-1">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-muted flex items-center space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your finances..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !query.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
