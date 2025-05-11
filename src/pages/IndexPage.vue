<template>
  <q-page class="row items-center justify-evenly">
    <!-- Buttons -->
    <q-page-sticky v-if="criteriaSet" position="top-right" :offset="[18, -43]" class="z-top">
      <q-btn outline icon-right="download" label="CSV" color="white"
        @click="isSaveDialogOpen = true; saveFileFormat = 'csv'" />
      <q-btn outline icon-right="save" label="Save" color="white"
        @click="isSaveDialogOpen = true; saveFileFormat = 'json'" />
    </q-page-sticky>

    <!-- Main section -->
    <div v-if="criteriaSet" class="q-pa-xl full-width">
      <!-- Summary card -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ criteriaSet?.courseTitle }} ({{ criteriaSet?.courseYear }})</div>
          <div class="text-subtitle2">{{ criteriaSet?.courseCode }}</div>
        </q-card-section>

        <div class="q-pa-md text-subtitle2">
          Overall progress: ({{criteriaSet?.sections.reduce((total, section) => {
            return total + section.criteria.reduce((sectionTotal, criteria) => {
              return sectionTotal + Math.min(criteria.claims.length, 2);
            }, 0);
          }, 0)}}/{{criteriaSet?.sections.reduce((total, section) => {
            return total + section.criteria.length * 2;
          }, 0)}}) <q-linear-progress :color="getOverallProgress() >= 1 ? 'positive' : 'primary'"
            :value="getOverallProgress()"></q-linear-progress>
        </div>
      </q-card>

      <q-list bordered class="rounded-borders">
        <!-- Sections -->
        <q-expansion-item v-for="section in criteriaSet?.sections" :key="section.id" expand-separator
          :label="section.id + ' ' + section.learningOutcome" :icon="isSectionComplete(section) ? 'check' : 'cancel'"
          default-opened header-class="bg-grey-2 text-h5">
          <!-- Section progress -->
          <div class="q-pa-md text-subtitle2">
            <div
              v-if="section.criteria.some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.Written))">
              <q-icon name="check" color="positive" />
              Contains atleast one <q-chip label="Written" :color="getClaimColor(ClaimSource.Written)"
                text-color="white" size="sm" />
              claim
            </div>
            <div v-else>
              <q-icon name="cancel" color="negative" />
              Requires atleast one <q-chip label="Written" :color="getClaimColor(ClaimSource.Written)"
                text-color="white" size="sm" /> claim
            </div>

            <div
              v-if="section.criteria.some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.Testimony))">
              <q-icon name="check" color="positive" />
              Contains atleast one <q-chip label="Testimony" :color="getClaimColor(ClaimSource.Testimony)"
                text-color="white" size="sm" /> claim
            </div>
            <div v-else>
              <q-icon name="cancel" color="negative" />
              Requires atleast one <q-chip label="Testimony" :color="getClaimColor(ClaimSource.Testimony)"
                text-color="white" size="sm" /> claim
            </div>

            <div
              v-if="section.criteria.some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.TutorObservation))">
              <q-icon name="check" color="positive" />
              Contains atleast one <q-chip label="Tutor Observation"
                :color="getClaimColor(ClaimSource.TutorObservation)" text-color="white" size="sm" /> claim
            </div>
            <div v-else>
              <q-icon name="cancel" color="negative" />
              Requires atleast one <q-chip label="Tutor Observation"
                :color="getClaimColor(ClaimSource.TutorObservation)" text-color="white" size="sm" /> claim
            </div>

            <div class="q-pa-md">
              Progress: ({{section.criteria.reduce((total, criteria) => {
                return total + Math.min(criteria.claims.length, 2);
              }, 0)}}/{{ section.criteria.length * 2 }})
              <q-linear-progress :color="getSectionProgress(section) >= 1 ? 'positive' : 'primary'"
                :value="getSectionProgress(section)"></q-linear-progress>
            </div>

          </div>

          <!-- Criteria definitions -->
          <q-expansion-item v-for="criteria in section?.criteria" :key="criteria.id" expand-separator
            :label="criteria.id + ' ' + criteria.title" default-opened :header-inset-level="0.5"
            header-class="bg-grey-2 text-h6">
            <!-- Criteria details -->
            <q-card>
              <div class="row q-pl-xl">
                <div class="col">
                  <div class="text-subtitle2">Guidance:</div>
                  <q-card-section>
                    <q-list dense v-for="item in criteria.guidance" :key="item">
                      <q-item>
                        <q-item-section>
                          <q-item-label class="text-body2">• {{ item }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </div>

                <div class="col">

                  <q-card-section>
                    <div class="float-right">
                      <q-btn @click="onClickAddClaim(criteria)" color="grey-14" text-color="white" icon="add" size="sm">
                      </q-btn>
                    </div>
                    <div class="text-subtitle2 q-pb-md">Claims:</div>

                    <q-list dense>
                      <div v-for="claim in criteria.claims" :key="claim.id">
                        <q-item>
                          <q-item-section>
                            <q-chip clickable @click="onClickClaim(claim, criteria)"
                              :color="getClaimColor(claim.source)" text-color="white"
                              :icon="claim.confirmed ? 'check' : 'question_mark'" size="md" class="glossy">
                              {{ claim.evidence }} {{ claim.claimDate ? `(${claim.claimDate})` : '' }}
                            </q-chip>
                          </q-item-section>
                        </q-item>
                      </div>
                    </q-list>
                  </q-card-section>
                </div>
              </div>
            </q-card>
          </q-expansion-item>
        </q-expansion-item>
      </q-list>
    </div>

    <!-- Upload a criteria file -->
    <div v-else class="q-pa-md">
      <q-card class="q-mb-xs">
        <q-card-section>
          <div class="text-h6">Upload a criteria file...</div>
          <div class="text-subtitle2">The file should be in .json format, check your downloads folder. </div>
        </q-card-section>

        <div class="q-pa-md">
          <q-file outlined label="File... (Drag and drop)" v-model="criteriaSetFile" stack-label
            @update:model-value="uploadFile(criteriaSetFile)" accept=".json" />
        </div>
        <q-card-section>
          <div class="text-h6">Or...</div>
          <div class="text-subtitle2">If this is your first time here select a templates</div>
          <q-list>
            <q-item clickable @click="loadTemplate('cst-l3')" class="bg-grey-4">
              <q-item-section>
                <q-item-label><b>CST-L3</b> Level 3 Certificate in Counselling Studies (2024-2025)</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Save file dialog -->
    <q-dialog v-model="isSaveDialogOpen" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Save Criteria File</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="saveFileName" label="File Name" placeholder="Enter file name" />
          <q-select v-model="saveFileFormat"
            :options="[{ label: 'JSON', value: 'json' }, { label: 'CSV', value: 'csv' }]" label="File Format"
            emit-value />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancel" icon="cancel" color="secondary" @click="isSaveDialogOpen = false" />
          <q-btn label="Save" icon="save" color="primary" @click="saveCriteriaFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Claim dialog -->
    <q-dialog v-model="isClaimDialogOpen" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="float-right">
            <q-btn v-if="claimForm.id && claimForm.id != ''" flat icon-right="delete" label="Delete" color="negative"
              @click="deleteClaim" />
          </div>
          <div class="text-h6">Edit/Add Claim</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="claimForm.evidence" label="Evidence" :rules="[
            value => !!value || 'Evidence is required',
            value => value.length <= 100 || 'Evidence must be less than 100 characters'
          ]" ref="evidence" />
          <q-input v-model="claimForm.page" type="number" label="Page" />
          <q-input v-model="claimForm.claimDate" mask="date" label="Date claimed" :rules="['date']">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="claimForm.claimDate">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select v-model="claimForm.source" :options="claimSourceOptions" label="Source" emit-value />
          <q-field label="Tutor confirmed?">
            <template v-slot:append>
              <q-toggle v-model="claimForm.confirmed" checked-icon="check" color="green" unchecked-icon="clear"
                left-label />
            </template>
          </q-field>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Cancel" icon="cancel" color="secondary" @click="closeClaimDialog" />
          <q-btn label="Save" icon="save" color="primary" @click="saveClaim" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import type { CriteriaSet, Claim, CriteriaDefinition, CriteriaSection } from 'src/components/models';
import { ClaimSource } from 'src/components/models';
import { ref } from 'vue';
import { useCriteriaSetStore } from 'src/stores/criteria-set-store';
import { QInput } from 'quasar';

const criteriaSetStore = useCriteriaSetStore();
const criteriaSet = ref<CriteriaSet | undefined>();
const criteriaSetFile = ref<File | null>(null);
const isClaimDialogOpen = ref(false);
const isSaveDialogOpen = ref(false);
const saveFileFormat = ref('json');
const saveFileName = ref('');
const selectedCriteria = ref<CriteriaDefinition | undefined>();
const claimForm = ref<Claim>({
  id: '',
  evidence: '',
  claimDate: '',
  confirmed: false,
  page: undefined,
  source: ClaimSource.Written,
});

const evidenceField = ref<InstanceType<typeof QInput> | null>(null);

const claimSourceOptions = [
  { label: 'Written', value: ClaimSource.Written },
  { label: 'Testimony', value: ClaimSource.Testimony },
  { label: 'Tutor Observation', value: ClaimSource.TutorObservation },
];

function openClaimDialog(criteria: CriteriaDefinition) {
  selectedCriteria.value = criteria;
  isClaimDialogOpen.value = true;
}

function closeClaimDialog() {
  selectedCriteria.value = undefined;
  isClaimDialogOpen.value = false;
}

function saveClaim() {
  // do validation
  void evidenceField.value?.validate();
  if (evidenceField.value?.hasError) {
    console.error('Validation failed');
    return;
  }

  if (claimForm.value.id) {
    const criteria = criteriaSet.value?.sections.flatMap(section => section.criteria).find(criteria =>
      criteria.claims.some(existingClaim => existingClaim.id === claimForm.value.id)
    );
    if (criteria) {
      const existingClaim = criteria.claims.find(existingClaim => existingClaim.id === claimForm.value.id);
      if (existingClaim) {
        Object.assign(existingClaim, claimForm.value);
      }
    }
  } else {
    const newClaim = { ...claimForm.value, id: crypto.randomUUID() };
    const criteria = selectedCriteria.value;
    if (!criteria) {
      console.error('No criteria selected for new claim');
      return;
    }
    if (criteria) {
      criteria.claims.push(newClaim);
    }
  }

  if (criteriaSet.value) {
    criteriaSetStore.setCriteriaSet(criteriaSet.value);
  }
  closeClaimDialog();
}

function deleteClaim() {
  const criteria = criteriaSet.value?.sections.flatMap(section => section.criteria).find(criteria =>
    criteria.claims.some(existingClaim => existingClaim.id === claimForm.value.id)
  );
  if (criteria) {
    criteria.claims = criteria.claims.filter(existingClaim => existingClaim.id !== claimForm.value.id);
  }

  if (criteriaSet.value) {
    criteriaSetStore.setCriteriaSet(criteriaSet.value);
  }
  closeClaimDialog();
}

function onClickAddClaim(criteria: CriteriaDefinition): void {
  claimForm.value = {
    id: '',
    evidence: '',
    claimDate: '',
    confirmed: false,
    page: undefined,
    source: ClaimSource.Written,
  };
  openClaimDialog(criteria);
}

function onClickClaim(claim: Claim, criteria: CriteriaDefinition): void {
  claimForm.value = { ...claim };
  openClaimDialog(criteria);
}

function getSectionProgress(section: { criteria: { claims: Claim[] }[] }): number {
  const totalCriteria = section.criteria.length * 2;
  const completedCriteria = section.criteria.reduce((total, criteria) => {
    return total + Math.min(criteria.claims.length, 2);
  }, 0);
  return totalCriteria > 0 ? completedCriteria / totalCriteria : 0;
}

function getOverallProgress(): number {
  if (!criteriaSet.value) return 0;
  const totalCriteria = criteriaSet.value.sections.reduce((total, section) => {
    return total + section.criteria.length * 2;
  }, 0);
  const completedCriteria = criteriaSet.value.sections.reduce((total, section) => {
    return total + section.criteria.reduce((sectionTotal, criteria) => {
      return sectionTotal + Math.min(criteria.claims.length, 2);
    }, 0);
  }, 0);
  return totalCriteria > 0 ? completedCriteria / totalCriteria : 0;
}

function isSectionComplete(section: CriteriaSection): boolean {
  const hasWritten = section.criteria.some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.Written));
  const hasTestimony = section.criteria.some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.Testimony));
  const hasTutor = section.criteria.some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.TutorObservation));
  return hasWritten && hasTestimony && hasTutor && section.criteria.every(criteria => criteria.claims.length >= 2);
}

function getClaimColor(source: ClaimSource): string {
  switch (source) {
    case ClaimSource.Written:
      return 'positive';
    case ClaimSource.Testimony:
      return 'negative';
    case ClaimSource.TutorObservation:
      return 'info';
    default:
      return 'grey';
  }
}

async function loadTemplate(templateName: string): Promise<void> {
  criteriaSet.value = await loadCriteriaSet(templateName);
  if (criteriaSet.value) {
    saveFileName.value = criteriaSet.value?.courseCode;
    criteriaSetStore.setCriteriaSet(criteriaSet.value);
  }
}

async function loadCriteriaSet(templateName: string): Promise<CriteriaSet | undefined> {
  try {
    const response = await fetch(`/${templateName}-criteria-set.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch criteria-set.json: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function uploadFile(file: File | null): void {
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        criteriaSet.value = json;
        criteriaSetStore.setCriteriaSet(json);
      } catch (error) {
        console.error('Invalid JSON file:', error);
      }
    };
    reader.readAsText(file);
    saveFileName.value = file.name.replace('.json', '');
  }
}

function saveCriteriaFile(): void {
  if (criteriaSet.value) {
    if (saveFileFormat.value === 'csv') {
      exportCsv();
    } else {
      exportCriteriaFile();
    }
  } else {
    console.error('No criteria set to save.');
  }
  isSaveDialogOpen.value = false;
}

function exportCriteriaFile() {
  const dataStr = JSON.stringify(criteriaSet.value, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${saveFileName.value}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const rows = [[criteriaSet.value?.courseCode || '']];

  criteriaSet.value?.sections.forEach(section => {
    // Add section header
    rows.push(['LEARNING OUTCOME:', `${section.id} ${section.learningOutcome}`]);

    // Add column headings
    rows.push(['Assessment criteria', 'Candidate guidance to criteria', 'Portfolio reference']);

    // Add criteria rows
    section.criteria.forEach(criteria => {
      const guidance = criteria.guidance.map(item => `• ${item}`).join('\n');
      const claims = criteria.claims.map(claim => `${claim.evidence} ${claim.claimDate ? `${claim.claimDate}` : ''} (${claim.source}) ${claim.page ? `p${claim.page}` : ''}`).join('\n');
      rows.push([`${criteria.id} ${criteria.title}`, guidance, claims]);
    });
  });

  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${saveFileName.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
</script>
