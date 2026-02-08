import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function SellGiftCardPage() {
  const { id } = useParams({ from: '/gift-cards/$id/sell' });
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/gift-cards' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gift Cards
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Sell Gift Card</CardTitle>
          <CardDescription>Convert your gift card to cash</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gift card selling is not yet implemented. This feature will be available soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
