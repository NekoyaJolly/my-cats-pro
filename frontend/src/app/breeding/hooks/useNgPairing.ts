/**
 * NGペアリング判定フック
 */

import { useCallback } from 'react';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { NgPairingRule } from '../types';

export interface UseNgPairingParams {
  activeMales: Cat[];
  allCats: Cat[];
  ngPairingRules: NgPairingRule[];
}

export interface UseNgPairingReturn {
  isNGPairing: (maleId: string, femaleId: string) => boolean;
  findMatchingRule: (maleId: string, femaleId: string) => NgPairingRule | undefined;
}

export function useNgPairing({
  activeMales,
  allCats,
  ngPairingRules,
}: UseNgPairingParams): UseNgPairingReturn {
  
  const isNGPairing = useCallback((maleId: string, femaleId: string): boolean => {
    const male = activeMales.find((m) => m.id === maleId);
    const female = allCats.find((f) => f.id === femaleId);
    
    if (!male || !female) return false;
    
    const maleTags = male.tags?.map((catTag) => catTag.tag.name) ?? [];
    const femaleTags = female.tags?.map((catTag) => catTag.tag.name) ?? [];
    
    return ngPairingRules.some((rule) => {
      if (!rule.active) return false;
      
      if (rule.type === 'TAG_COMBINATION' && rule.maleConditions && rule.femaleConditions) {
        const maleMatches = rule.maleConditions.some((condition) => maleTags.includes(condition));
        const femaleMatches = rule.femaleConditions.some((condition) => femaleTags.includes(condition));
        return maleMatches && femaleMatches;
      }
      
      if (rule.type === 'INDIVIDUAL_PROHIBITION' && rule.maleNames && rule.femaleNames) {
        return rule.maleNames.includes(male.name) && rule.femaleNames.includes(female.name);
      }
      
      // generation_limit の実装（将来的にpedigree機能連携）
      if (rule.type === 'GENERATION_LIMIT') {
        return false;
      }
      
      return false;
    });
  }, [activeMales, allCats, ngPairingRules]);

  const findMatchingRule = useCallback((maleId: string, femaleId: string): NgPairingRule | undefined => {
    const male = activeMales.find((m) => m.id === maleId);
    const female = allCats.find((f) => f.id === femaleId);
    
    if (!male || !female) return undefined;
    
    const maleTags = male.tags?.map((catTag) => catTag.tag.name) ?? [];
    const femaleTags = female.tags?.map((catTag) => catTag.tag.name) ?? [];
    
    return ngPairingRules.find((rule) => {
      if (!rule.active) return false;
      
      if (rule.type === 'TAG_COMBINATION' && rule.maleConditions && rule.femaleConditions) {
        const maleMatches = rule.maleConditions.some((condition) => maleTags.includes(condition));
        const femaleMatches = rule.femaleConditions.some((condition) => femaleTags.includes(condition));
        return maleMatches && femaleMatches;
      }
      
      if (rule.type === 'INDIVIDUAL_PROHIBITION' && rule.maleNames && rule.femaleNames) {
        return rule.maleNames.includes(male.name) && rule.femaleNames.includes(female.name);
      }
      
      return false;
    });
  }, [activeMales, allCats, ngPairingRules]);

  return {
    isNGPairing,
    findMatchingRule,
  };
}









