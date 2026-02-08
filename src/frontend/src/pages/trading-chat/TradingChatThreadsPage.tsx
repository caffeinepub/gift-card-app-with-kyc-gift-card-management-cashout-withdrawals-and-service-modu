import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetChatThreads, useCreateChatThread } from '../../hooks/useTradingChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { MessageSquare, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { extractBackendErrorMessage } from '../../utils/backendErrorMessage';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import VerifiedTraderBadge from '../../components/trading-chat/VerifiedTraderBadge';

export default function TradingChatThreadsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [partnerPrincipal, setPartnerPrincipal] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: threads = [], isLoading } = useGetChatThreads();
  const createThreadMutation = useCreateChatThread();

  const handleCreateThread = async () => {
    if (!partnerPrincipal.trim()) {
      toast.error('Please enter a valid Principal ID');
      return;
    }

    try {
      const chatId = await createThreadMutation.mutateAsync(partnerPrincipal.trim());
      toast.success('Chat thread created successfully');
      setPartnerPrincipal('');
      setShowCreateForm(false);
      navigate({ to: `/trading-chat/${chatId}` });
    } catch (error) {
      const message = extractBackendErrorMessage(error, 'Failed to create chat thread');
      toast.error(message);
    }
  };

  const currentUserPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/' })}
            className="lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Trading Chat</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Secure conversations with verified traders
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-chat-accent hover:bg-chat-accent-hover"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* KYC Warning */}
      <Alert className="border-chat-accent/20 bg-chat-accent/5">
        <AlertCircle className="h-4 w-4 text-chat-accent" />
        <AlertDescription className="text-sm">
          Trading Chat requires KYC verification. Both you and your chat partner must be verified to start a conversation.
        </AlertDescription>
      </Alert>

      {/* Create Thread Form */}
      {showCreateForm && (
        <Card className="border-chat-accent/20">
          <CardHeader>
            <CardTitle>Start New Chat</CardTitle>
            <CardDescription>
              Enter the Principal ID of the trader you want to chat with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partner-principal">Partner Principal ID</Label>
              <Input
                id="partner-principal"
                placeholder="e.g., 2vxsx-fae..."
                value={partnerPrincipal}
                onChange={(e) => setPartnerPrincipal(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateThread}
                disabled={createThreadMutation.isPending || !partnerPrincipal.trim()}
                className="bg-chat-accent hover:bg-chat-accent-hover"
              >
                {createThreadMutation.isPending ? 'Creating...' : 'Create Chat'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setPartnerPrincipal('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Threads List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Chats</CardTitle>
          <CardDescription>
            Active trading conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No chat threads yet</p>
              <p className="text-sm text-muted-foreground">
                Start a new chat to begin trading securely
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => {
                const partnerPrincipalStr = thread.partner.toString();
                const isCurrentUser = partnerPrincipalStr === currentUserPrincipal;
                
                return (
                  <button
                    key={thread.chatId.toString()}
                    onClick={() => navigate({ to: `/trading-chat/${thread.chatId}` })}
                    className="w-full p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">
                            {isCurrentUser ? 'You' : 'Trading Partner'}
                          </p>
                          <VerifiedTraderBadge principal={thread.partner} />
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {partnerPrincipalStr}
                        </p>
                      </div>
                      <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
