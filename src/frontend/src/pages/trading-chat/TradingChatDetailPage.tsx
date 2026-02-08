import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetChatMessages, useSendMessage, useGetChatThreadInfo } from '../../hooks/useTradingChat';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowLeft, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { extractBackendErrorMessage } from '../../utils/backendErrorMessage';
import { formatDate } from '../../lib/utils';
import VerifiedTraderBadge from '../../components/trading-chat/VerifiedTraderBadge';
import EscrowPanel from '../../components/trading-chat/EscrowPanel';

export default function TradingChatDetailPage() {
  const navigate = useNavigate();
  const { chatId: chatIdParam } = useParams({ from: '/trading-chat/$chatId' });
  const { identity } = useInternetIdentity();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = BigInt(chatIdParam);
  const currentUserPrincipal = identity?.getPrincipal().toString();

  const { data: threadInfo, isLoading: threadLoading } = useGetChatThreadInfo(chatId);
  const { data: messages = [], isLoading: messagesLoading, refetch } = useGetChatMessages(chatId);
  const sendMessageMutation = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      await sendMessageMutation.mutateAsync({ chatId, content: textToSend });
    } catch (error) {
      const message = extractBackendErrorMessage(error, 'Failed to send message');
      toast.error(message);
      setMessageText(textToSend);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const partnerPrincipal = threadInfo?.partner;
  const partnerPrincipalStr = partnerPrincipal?.toString();

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <Card className="border-chat-accent/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/trading-chat' })}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                {threadLoading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold">Trading Chat</h2>
                      {partnerPrincipal && <VerifiedTraderBadge principal={partnerPrincipal} />}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {partnerPrincipalStr}
                    </p>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={messagesLoading}
            >
              <RefreshCw className={`h-4 w-4 ${messagesLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Escrow Panel */}
      {partnerPrincipal && (
        <EscrowPanel chatId={chatId} partnerPrincipal={partnerPrincipal} />
      )}

      {/* Messages */}
      <Card className="border-chat-accent/20">
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-4 space-y-3">
            {messagesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-3/4" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-muted-foreground mb-2">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start the conversation below
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isOwnMessage = message.sender.toString() === currentUserPrincipal;
                  const timestamp = Number(message.timestamp) / 1_000_000;

                  return (
                    <div
                      key={index}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-chat-bubble-sent text-chat-bubble-sent-text'
                            : 'bg-chat-bubble-received text-chat-bubble-received-text'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage
                              ? 'text-chat-bubble-sent-text/70'
                              : 'text-chat-bubble-received-text/70'
                          }`}
                        >
                          {formatDate(timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="bg-chat-accent hover:bg-chat-accent-hover self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
