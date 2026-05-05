import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingPageEditor } from './LandingPageEditor';
import { FaqEditor } from './FaqEditor';
import { PolicyEditor } from './PolicyEditor';

export const ContentView: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700">
      <Tabs defaultValue="landing">
        <TabsList className="border-b border-gray-100 w-full justify-start rounded-none bg-transparent h-auto p-0 mb-8">
          {['landing', 'faq', 'policies'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="text-[10px] uppercase tracking-[0.2em] font-bold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-4 transition-all"
            >
              {tab === 'landing' ? 'Landing Page' : tab === 'faq' ? 'FAQ' : 'Policies'}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="landing" className="animate-in fade-in duration-300">
          <LandingPageEditor />
        </TabsContent>
        <TabsContent value="faq" className="animate-in fade-in duration-300">
          <FaqEditor />
        </TabsContent>
        <TabsContent value="policies" className="animate-in fade-in duration-300">
          <PolicyEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
