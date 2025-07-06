import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Star, 
  Archive, 
  MoreHorizontal,
  Filter,
  Clock,
  Check,
  CheckCheck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  eventId?: number;
  content: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    profilePhoto?: string;
    role: string;
  };
  receiver: {
    id: number;
    name: string;
    profilePhoto?: string;
    role: string;
  };
  event?: {
    id: number;
    title: string;
  };
}

interface Conversation {
  participantId: number;
  participant: {
    id: number;
    name: string;
    profilePhoto?: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

export function MessageCenter() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Handle URL parameters for direct chef messaging
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chefIdParam = urlParams.get('chef');
    
    if (chefIdParam) {
      const chefId = parseInt(chefIdParam);
      setSelectedConversation(chefId);
      // Clear the URL parameter after setting the conversation
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations', activeFilter, searchTerm, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.append('filter', activeFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (activeTab === 'sent') params.append('type', 'sent');
      
      const token = localStorage.getItem('chefbounty_token');
      
      // Debug token issue
      if (!token) {
        console.error('No authentication token found in localStorage');
        throw new Error('Authentication required');
      }
      console.log('Using token for conversations:', token.substring(0, 20) + '...');
      
      const response = await fetch(`/api/conversations?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
    refetchInterval: 3000, // Poll for new messages every 3 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const token = localStorage.getItem('chefbounty_token');
      const response = await fetch(`/api/messages/${selectedConversation}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 2000, // More frequent polling for active conversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: number; content: string; eventId?: number }) => {
      const token = localStorage.getItem('chefbounty_token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setNewMessage("");
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const token = localStorage.getItem('chefbounty_token');
      const response = await fetch(`/api/messages/mark-read/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // Star/unstar message mutation
  const toggleStarMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const token = localStorage.getItem('chefbounty_token');
      const response = await fetch(`/api/messages/${messageId}/star`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) throw new Error('Failed to toggle star');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedConversation,
      content: newMessage.trim(),
    });
  };

  const filteredConversations = conversations.filter((conv: Conversation) => {
    if (searchTerm) {
      return conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const selectedConversationData = conversations.find((conv: Conversation) => 
    conv.participantId === selectedConversation
  );

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Messages</h3>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Inbox/Sent Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'inbox' | 'sent')} className="mb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-2 pb-1">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-gray-100">
              <TabsTrigger value="all" className="text-sm px-3 py-2 h-7 data-[state=active]:bg-white">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-sm px-3 py-2 h-7 data-[state=active]:bg-white">Unread</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conversations List */}
        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-3">
              {filteredConversations.map((conversation: Conversation) => (
                <div
                  key={conversation.participantId}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 mb-1 ${
                    selectedConversation === conversation.participantId ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.participantId)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conversation.participant.profilePhoto} />
                      <AvatarFallback>
                        {conversation.participant.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.participant.name}
                        </h4>
                        <div className="flex items-center gap-1">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs px-1.5 py-0.5">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {conversation.participant.role}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConversations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-base">No conversations found</p>
                  <p className="text-sm text-gray-400 mt-1">Start messaging hosts and chefs</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationData ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversationData.participant.profilePhoto} />
                  <AvatarFallback>
                    {selectedConversationData.participant.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConversationData.participant.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedConversationData.participant.role}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      message.senderId === user?.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    } rounded-lg px-4 py-2`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                        {message.senderId === user?.id && (
                          <span className="flex items-center gap-1">
                            {message.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}