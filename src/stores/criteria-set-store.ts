import { defineStore } from 'pinia';
import type { CriteriaSet } from 'src/components/models';

export const useCriteriaSetStore = defineStore('criteriaSet', {
  state: () => ({
    criteriaSet: null as CriteriaSet | null,
  }),
  actions: {
    setCriteriaSet(criteriaSet: CriteriaSet) {
      this.criteriaSet = criteriaSet;
    },
    clearCriteriaSet() {
      this.criteriaSet = null;
    },
    updateCriteriaSet(updatedFields: Partial<CriteriaSet>) {
      if (this.criteriaSet) {
        this.criteriaSet = { ...this.criteriaSet, ...updatedFields };
      }
    },
  },
});