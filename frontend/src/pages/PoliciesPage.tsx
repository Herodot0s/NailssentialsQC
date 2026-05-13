import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getCmsContent } from '@/api/apiClient';

const PoliciesPage: React.FC = () => {
  const { data: faqData, isLoading: faqLoading } = useQuery({
    queryKey: ['cms-faqs-all'],
    queryFn: () =>
      getCmsContent({ type: 'faq', activeOnly: true }).then((r) =>
        Array.isArray(r.data.data) ? r.data.data : [],
      ),
    staleTime: 10 * 60 * 1000,
  });

  const { data: policyData, isLoading: policyLoading } = useQuery({
    queryKey: ['cms-policies'],
    queryFn: () =>
      getCmsContent({ type: 'policy', activeOnly: true }).then((r) =>
        Array.isArray(r.data.data) ? r.data.data : [],
      ),
    staleTime: 10 * 60 * 1000,
  });

  const faqs = faqData ?? [];
  const policies = policyData ?? [];
  const isLoading = faqLoading || policyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-24 max-w-3xl">
      <h1 className="font-serif text-4xl font-light text-foreground text-center mb-16">
        Salon Policies &amp; FAQ
      </h1>

      <div className="space-y-16">
        {faqs.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-light text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion className="space-y-0">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={`faq-${faq.id}`}
                  className="border-b border-primary/10"
                >
                  <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline py-5">
                    {faq.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                    {faq.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {policies.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-light text-foreground mb-8">Our Policies</h2>
            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id} className="rounded-none border-gray-100">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl font-light">{policy.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {policy.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {faqs.length === 0 && policies.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-16">
            No policies or FAQs published yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default PoliciesPage;
