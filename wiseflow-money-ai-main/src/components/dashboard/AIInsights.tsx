
import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

export function AIInsights() {
  const { insights, markInsightAsRead } = useFinance();
  const [showRead, setShowRead] = useState(false);
  
  const filteredInsights = showRead 
    ? insights 
    : insights.filter(insight => !insight.read);

  const handleMarkAsRead = (id: string) => {
    markInsightAsRead(id);
  };

  const getInsightIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      tip: <span className="text-xl">💡</span>,
      warning: <span className="text-xl">⚠️</span>,
      achievement: <span className="text-xl">🏆</span>,
    };
    return icons[type] || <span className="text-xl">ℹ️</span>;
  };

  const getInsightColor = (type: string) => {
    const colors: Record<string, string> = {
      tip: 'bg-teal-50 border-teal-200',
      warning: 'bg-amber-50 border-amber-200',
      achievement: 'bg-purple-50 border-purple-200',
    };
    return colors[type] || 'bg-blue-50 border-blue-200';
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Personalized financial advice for you</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowRead(!showRead)}
          >
            {showRead ? 'Hide Read' : 'Show All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredInsights.length > 0 ? (
            filteredInsights.map((insight) => (
              <div 
                key={insight.id} 
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)} ${
                  insight.read ? 'opacity-60' : 'opacity-100'
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <Badge 
                        variant="outline" 
                        className={`${
                          insight.type === 'tip' ? 'text-teal-700 border-teal-300' : 
                          insight.type === 'warning' ? 'text-amber-700 border-amber-300' : 
                          'text-purple-700 border-purple-300'
                        }`}
                      >
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(insight.date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{insight.message}</p>
                    {!insight.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs" 
                        onClick={() => handleMarkAsRead(insight.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No insights available right now.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
