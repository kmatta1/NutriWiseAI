
"use client";

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const ChatWidget = dynamic(() => import('@/components/chat-widget'), {
  ssr: false,
  loading: () => (
    <Button className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg" size="icon" disabled>
      <MessageCircle className="h-8 w-8" />
    </Button>
  ),
});

export default function ClientOnlyChatWidget() {
  return <ChatWidget />;
}
