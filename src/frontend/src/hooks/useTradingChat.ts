import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import type { ChatId, Message } from '../backend';

interface ChatThread {
  chatId: bigint;
  partner: Principal;
}

interface Escrow {
  escrowId: bigint;
  buyer: Principal;
  seller: Principal;
  amount: bigint;
  status: { __kind__: 'created' | 'funded' | 'released' | 'cancelled' };
  chatId: bigint;
}

// Store chat threads in memory (since backend doesn't have a list method)
const chatThreadsCache = new Map<string, ChatThread[]>();

function getCacheKey(principal: string | undefined): string {
  return `chat-threads-${principal || 'anonymous'}`;
}

export function useGetChatThreads() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  return useQuery<ChatThread[]>({
    queryKey: ['chatThreads', principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return [];
      const cacheKey = getCacheKey(principalStr);
      return chatThreadsCache.get(cacheKey) || [];
    },
    enabled: !!actor && !isFetching && !!principalStr,
  });
}

export function useGetChatThreadInfo(chatId: ChatId) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalStr = identity?.getPrincipal().toString();

  return useQuery<ChatThread | null>({
    queryKey: ['chatThread', chatId.toString(), principalStr],
    queryFn: async () => {
      if (!actor || !principalStr) return null;
      const cacheKey = getCacheKey(principalStr);
      const threads = chatThreadsCache.get(cacheKey) || [];
      return threads.find(t => t.chatId === chatId) || null;
    },
    enabled: !!actor && !isFetching && !!principalStr,
  });
}

export function useCreateChatThread() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerPrincipalStr: string) => {
      if (!actor) throw new Error('Actor not available');
      
      // Parse the principal string
      const partnerPrincipal = Principal.fromText(partnerPrincipalStr);
      
      const chatId = await actor.createChat(partnerPrincipal);
      
      // Store in cache
      const principalStr = identity?.getPrincipal().toString();
      if (principalStr) {
        const cacheKey = getCacheKey(principalStr);
        const threads = chatThreadsCache.get(cacheKey) || [];
        threads.push({ chatId, partner: partnerPrincipal });
        chatThreadsCache.set(cacheKey, threads);
      }
      
      return chatId;
    },
    onSuccess: () => {
      const principalStr = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({ queryKey: ['chatThreads', principalStr] });
    },
  });
}

export function useGetChatMessages(chatId: ChatId) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['chatMessages', chatId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const messages = await actor.getAllChatMessages(chatId);
      // Reverse to show oldest first
      return [...messages].reverse();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, content }: { chatId: ChatId; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage(chatId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.chatId.toString()] });
    },
  });
}

export function useGetVerificationStatus(principal: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['verificationStatus', principal.toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasVerifiedTraderBadge(principal);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000, // Cache for 1 minute
  });
}

// Escrow hooks
export function useGetChatEscrows(chatId: ChatId) {
  const { actor, isFetching } = useActor();

  return useQuery<Escrow[]>({
    queryKey: ['chatEscrows', chatId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have a list method yet, return cached escrows
      const cacheKey = getEscrowCacheKey(chatId);
      return escrowsCache.get(cacheKey) || [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

// In-memory escrow cache
const escrowsCache = new Map<string, Escrow[]>();

function getEscrowCacheKey(chatId: ChatId): string {
  return `escrows-${chatId.toString()}`;
}

export function useCreateEscrow() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, amount, seller }: { chatId: ChatId; amount: bigint; seller: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      const escrowId = await actor.createEscrow(chatId, amount, seller);
      
      // Get buyer from identity
      const buyer = identity?.getPrincipal();
      if (!buyer) throw new Error('Identity not available');
      
      // Store in cache
      const cacheKey = getEscrowCacheKey(chatId);
      const escrows = escrowsCache.get(cacheKey) || [];
      escrows.push({
        escrowId,
        buyer,
        seller,
        amount,
        status: { __kind__: 'created' },
        chatId,
      });
      escrowsCache.set(cacheKey, escrows);
      
      return escrowId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatEscrows', variables.chatId.toString()] });
    },
  });
}

export function useFundEscrow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (escrowId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.fundEscrow(escrowId);
      
      // Update cache
      for (const [key, escrows] of escrowsCache.entries()) {
        const escrow = escrows.find(e => e.escrowId === escrowId);
        if (escrow) {
          escrow.status = { __kind__: 'funded' };
          escrowsCache.set(key, escrows);
          break;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatEscrows'] });
    },
  });
}

export function useReleaseEscrow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (escrowId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.releaseEscrow(escrowId);
      
      // Update cache
      for (const [key, escrows] of escrowsCache.entries()) {
        const escrow = escrows.find(e => e.escrowId === escrowId);
        if (escrow) {
          escrow.status = { __kind__: 'released' };
          escrowsCache.set(key, escrows);
          break;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatEscrows'] });
    },
  });
}

export function useCancelEscrow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (escrowId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.cancelEscrow(escrowId);
      
      // Update cache
      for (const [key, escrows] of escrowsCache.entries()) {
        const escrow = escrows.find(e => e.escrowId === escrowId);
        if (escrow) {
          escrow.status = { __kind__: 'cancelled' };
          escrowsCache.set(key, escrows);
          break;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatEscrows'] });
    },
  });
}
