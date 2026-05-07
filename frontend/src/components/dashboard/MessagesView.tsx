import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Loader2, Search } from 'lucide-react';
import { getMyMessages, sendMessage, getAllStaff } from '../../api/apiClient';
import type { Message, StaffMember } from '@/types/api';

export const MessagesView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState({ receiverId: '', subject: '', body: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [msgRes, staffRes] = await Promise.all([
        getMyMessages(),
        getAllStaff()
      ]);
      if (msgRes.data.success) setMessages(msgRes.data.data);
      if (staffRes.data.success) {
        const staffData = staffRes.data.data;
        setStaff(Array.isArray(staffData) ? staffData : (staffData?.items || []));
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage({
        receiverId: parseInt(newMessage.receiverId),
        subject: newMessage.subject,
        body: newMessage.body
      });
      setShowMessageModal(false);
      setNewMessage({ receiverId: '', subject: '', body: '' });
      fetchData();
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sender.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">Retrieving Secure Dispatches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search communications..." 
            className="pl-10 rounded-none border-primary/10 h-11 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowMessageModal(true)} className="rounded-none gap-2 px-8 h-11 text-[10px] uppercase font-bold tracking-widest">
          <Mail className="h-4 w-4" /> Compose Dispatch
        </Button>
      </div>

      <Card className="rounded-none border-none shadow-sm min-h-[500px]">
        <CardHeader className="bg-primary/5 border-b border-primary/5 flex flex-row justify-between items-center py-8">
          <div>
            <CardTitle className="font-serif text-2xl">Internal Inbox</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">Management and Staff Correspondence</CardDescription>
          </div>
          <Badge className="rounded-none bg-primary text-white text-[8px] uppercase tracking-widest font-bold px-3 py-1">
            {messages.filter(m => !m.is_read).length} Unread
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-primary/5">
            {filteredMessages.map(msg => (
              <div key={msg.id} className={`p-8 hover:bg-primary-ultra/10 transition-colors cursor-pointer group ${!msg.is_read ? 'bg-primary-ultra/30' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-[12px] font-bold text-primary uppercase border border-primary/5">
                      {msg.sender.username.charAt(0)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest">{msg.sender.username}</p>
                        <Badge variant="outline" className="text-[7px] uppercase h-4 px-1.5 border-primary/20 text-primary/60">{msg.sender.role}</Badge>
                      </div>
                      <p className="text-sm font-bold text-foreground">{msg.subject}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-light leading-relaxed pl-14 line-clamp-2 group-hover:line-clamp-none transition-all">
                  {msg.body}
                </p>
              </div>
            ))}
            {filteredMessages.length === 0 && (
              <div className="text-center py-48 text-muted-foreground italic text-[10px] uppercase tracking-widest font-bold">
                No dispatches found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-none p-0 overflow-hidden">
          <div className="bg-primary p-10 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-4xl font-light">Internal <span className="italic">Dispatch</span></DialogTitle>
              <DialogDescription className="text-white/70 font-light mt-2">Send secure communication to any artisan or manager.</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSendMessage} className="p-10 space-y-6 bg-white">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Recipient</Label>
                <Select required onValueChange={(val: string | null) => setNewMessage({...newMessage, receiverId: val || ''})}>
                  <SelectTrigger className="rounded-none border-primary/10 h-12 focus:ring-primary/20">
                    <SelectValue placeholder="Select Technician / Manager" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-none shadow-2xl max-h-64">
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()} className="text-xs uppercase tracking-widest font-medium py-3">
                        {s.fullName} ({s.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Subject</Label>
                <Input 
                  required 
                  value={newMessage.subject} 
                  onChange={e => setNewMessage({...newMessage, subject: e.target.value})} 
                  placeholder="Dispatch Topic" 
                  className="rounded-none border-primary/10 h-12 focus:ring-primary/20" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Message Body</Label>
                <textarea 
                  required 
                  value={newMessage.body} 
                  onChange={e => setNewMessage({...newMessage, body: e.target.value})} 
                  className="w-full min-h-[180px] rounded-none border border-primary/10 p-4 focus:outline-none focus:ring-1 focus:ring-primary/20 font-light text-sm bg-gray-50/30" 
                  placeholder="Detail your correspondence..." 
                />
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" className="rounded-none text-[10px] uppercase font-bold tracking-widest" onClick={() => setShowMessageModal(false)}>Cancel</Button>
              <Button type="submit" className="rounded-none px-10 h-12 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20">
                <Send className="h-3.5 w-3.5" /> Dispatch Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
