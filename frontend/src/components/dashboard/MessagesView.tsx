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
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6c6e63]" />
          <Input 
            placeholder="Search communications..." 
            className="pl-10 rounded-md border-[#bfc1b7] bg-white h-11 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowMessageModal(true)} className="w-full md:w-auto rounded-md gap-3 px-8 h-11 text-[13px] uppercase font-bold tracking-widest bg-[#23251d] hover:bg-[#33342d] text-white">
          <Mail className="h-4 w-4" /> Compose Dispatch
        </Button>
      </div>

      <Card className="rounded-md border border-[#bfc1b7] shadow-none min-h-[400px] overflow-hidden bg-white">
        <CardHeader className="bg-[#fcfcfa] border-b border-[#bfc1b7] flex flex-row justify-between items-center py-6 md:py-8 px-6 md:px-8">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-[#23251d]">Internal Inbox</CardTitle>
            <CardDescription className="text-[12px] uppercase font-bold tracking-widest mt-1 text-[#6c6e63]">Management and Staff Correspondence</CardDescription>
          </div>
          <Badge className="rounded-md bg-[#B8794E] text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 border-none shadow-none">
            {messages.filter(m => !m.is_read).length} Unread
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#bfc1b7]/30">
            {filteredMessages.map(msg => (
              <div key={msg.id} className={`p-6 md:p-8 hover:bg-[#eeefe9]/50 transition-colors cursor-pointer group ${!msg.is_read ? 'bg-[#dceaf6]/30' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#e5e7e0] flex items-center justify-center text-[12px] font-bold text-[#23251d] uppercase border border-[#bfc1b7]/20">
                      {msg.sender.username.charAt(0)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#B8794E]">{msg.sender.username}</p>
                        <Badge variant="outline" className="text-[8px] uppercase h-4 px-1.5 border-[#bfc1b7] text-[#6c6e63] font-bold rounded-md">{msg.sender.role}</Badge>
                      </div>
                      <p className="text-sm font-bold text-[#23251d]">{msg.subject}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#6c6e63] uppercase tracking-tighter tabular-nums">
                    {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-[13px] text-[#4d4f46] font-medium leading-relaxed pl-14 line-clamp-2 group-hover:line-clamp-none transition-all">
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
        <DialogContent className="max-w-md border-none shadow-2xl rounded-md p-0 overflow-hidden bg-[#eeefe9]">
          <div className="bg-[#23251d] p-8 md:p-10 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">Internal <span className="text-[#B8794E]">Dispatch</span></DialogTitle>
              <DialogDescription className="text-white/60 font-bold mt-2 text-[10px] uppercase tracking-[0.2em]">Secure Staff Correspondence</DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSendMessage} className="p-8 md:p-10 space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-[#6c6e63]">Recipient</Label>
                <Select required onValueChange={(val: string | null) => setNewMessage({...newMessage, receiverId: val || ''})}>
                  <SelectTrigger className="rounded-md border-[#bfc1b7] h-12 bg-white">
                    <SelectValue placeholder="Select Staff Member">
                      {staff.find(s => s.id.toString() === newMessage.receiverId)?.fullName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-none shadow-2xl max-h-64">
                    {staff.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()} className="text-xs font-bold py-3">
                        {s.fullName} ({s.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-[#6c6e63]">Subject</Label>
                <Input 
                  required 
                  value={newMessage.subject} 
                  onChange={e => setNewMessage({...newMessage, subject: e.target.value})} 
                  placeholder="Inquiry / schedule update" 
                  className="rounded-md border-[#bfc1b7] h-12 bg-white" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-[#6c6e63]">Message Body</Label>
                <textarea 
                  required 
                  value={newMessage.body} 
                  onChange={e => setNewMessage({...newMessage, body: e.target.value})} 
                  className="w-full min-h-[160px] rounded-md border border-[#bfc1b7] p-4 focus:outline-none focus:ring-2 focus:ring-[#B8794E]/10 font-medium text-sm bg-white resize-none" 
                  placeholder="Enter message details..." 
                />
              </div>
            </div>
            <DialogFooter className="pt-6 gap-3">
              <Button type="button" variant="ghost" className="rounded-md text-[12px] uppercase font-bold tracking-widest text-[#6c6e63] hover:bg-[#e5e7e0]" onClick={() => setShowMessageModal(false)}>Cancel</Button>
              <Button type="submit" className="rounded-md px-8 h-12 font-bold uppercase tracking-widest text-[12px] bg-[#23251d] hover:bg-[#33342d] text-white shadow-none">
                <Send className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
