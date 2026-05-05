import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivePackages } from '@/api/apiClient';
import PackageCard from './PackageCard';

export default function PackageDiscoverySection() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['activePackages'],
    queryFn: () => getActivePackages(),
  });

  const packages = response?.data?.data || [];

  if (isLoading || error || packages.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#fafaf9] py-16 border-y border-primary/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="container max-w-5xl mx-auto px-6 sm:px-12">
        <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary">
          Curated Bundles
        </p>
        <h2 className="font-serif text-4xl font-light text-foreground mt-2">
          Save with Our <em className="italic text-primary/80">Packages</em>
        </h2>
        <p className="text-muted-foreground text-base font-light max-w-xl mt-3">
          Handpicked combinations for the complete experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.id} pkg={pkg} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
