<template>
  <q-page class="row items-center justify-evenly">
    <!-- Buttons -->
    <q-page-sticky v-if="criteriaSet" position="top-right" :offset="[18, -43]" class="z-top">
      <q-btn outline icon-right="download" label="CSV" color="white"
        @click="isSaveDialogOpen = true; saveFileFormat = 'csv'" />
      <q-btn outline icon-right="save" label="Save" color="white"
        @click="isSaveDialogOpen = true; saveFileFormat = 'localStorage'" />
    </q-page-sticky>

    <!-- Main section -->
    <div v-if="criteriaSet" class="full-width">
      <!-- Summary card -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">{{ criteriaSet?.courseTitle }} ({{ criteriaSet?.courseYear }})</div>
          <div class="text-subtitle2">{{ criteriaSet?.courseCode }}</div>
        </q-card-section>

        <div class="q-pa-md text-subtitle2">
          Overall progress: ({{criteriaSet?.units.reduce((total, unit) => {
            return total + unit.sections.reduce((sectionTotal, section) => {
              return sectionTotal + section.criteria.reduce((criteriaTotal, criteria) => {
                return criteriaTotal + Math.min(criteria.claims.length, 2);
              }, 0);
            }, 0);
          }, 0)}}/{{criteriaSet?.units.reduce((total, unit) => {
            return total + unit.sections.reduce((sectionTotal, section) => {
              return sectionTotal + section.criteria.length * 2;
            }, 0);
          }, 0)}})
          <q-linear-progress :color="getOverallProgress() >= 1 ? 'positive' : 'primary'"
            :value="getOverallProgress()"></q-linear-progress>
        </div>
      </q-card>

      <q-list bordered class="rounded-borders">
        <!-- Units -->
        <q-expansion-item v-for="unit in criteriaSet?.units" :key="unit.id" expand-separator
          :label="unit.id + ' ' + unit.learningOutcome" :icon="isUnitComplete(unit) ? 'check' : 'cancel'"
          :header-class="$q.screen.gt.sm ? 'bg-grey-5 text-h4' : 'bg-grey-5'">

          <!-- Unit progress -->
          <div class="q-pa-md text-subtitle2">
            <div
              v-if="unit.sections.flatMap(s => s.criteria).some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.Written))">
              <q-icon name="check" color="positive" />
              Contains at least one <q-chip label="Written" :color="getClaimColor(ClaimSource.Written)"
                text-color="white" size="sm" /> claim
            </div>
            <div v-else>
              <q-icon name="cancel" color="negative" />
              Requires at least one <q-chip label="Written" :color="getClaimColor(ClaimSource.Written)"
                text-color="white" size="sm" /> claim
            </div>

            <div
              v-if="unit.sections.flatMap(s => s.criteria).some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.Testimony))">
              <q-icon name="check" color="positive" />
              Contains at least one <q-chip label="Testimony" :color="getClaimColor(ClaimSource.Testimony)"
                text-color="white" size="sm" /> claim
            </div>
            <div v-else>
              <q-icon name="cancel" color="negative" />
              Requires at least one <q-chip label="Testimony" :color="getClaimColor(ClaimSource.Testimony)"
                text-color="white" size="sm" /> claim
            </div>

            <div
              v-if="unit.sections.flatMap(s => s.criteria).some(criteria => criteria.claims.some(claim => claim.source === ClaimSource.TutorObservation))">
              <q-icon name="check" color="positive" />
              Contains at least one <q-chip label="Tutor Observation"
                :color="getClaimColor(ClaimSource.TutorObservation)" text-color="white" size="sm" /> claim
            </div>
            <div v-else>
              <q-icon name="cancel" color="negative" />
              Requires at least one <q-chip label="Tutor Observation"
                :color="getClaimColor(ClaimSource.TutorObservation)" text-color="white" size="sm" /> claim
            </div>

            <div class="q-pa-md">
              Progress: ({{unit.sections.reduce((total, section) => {
                return total + section.criteria.reduce((criteriaTotal, criteria) => {
                  return criteriaTotal + Math.min(criteria.claims.length, 2);
                }, 0);
              }, 0)}}/{{unit.sections.reduce((total, section) => {
                return total + section.criteria.length * 2;
              }, 0)}})
              <q-linear-progress :color="unit.sections.reduce((total, section) => {
                return total + section.criteria.reduce((criteriaTotal, criteria) => {
                  return criteriaTotal + Math.min(criteria.claims.length, 2);
                }, 0);
              }, 0) / (unit.sections.reduce((total, section) => {
                return total + section.criteria.length * 2;
              }, 0)) >= 1 ? 'positive' : 'primary'" :value="unit.sections.reduce((total, section) => {
                return total + section.criteria.reduce((criteriaTotal, criteria) => {
                  return criteriaTotal + Math.min(criteria.claims.length, 2);
                }, 0);
              }, 0) / (unit.sections.reduce((total, section) => {
                return total + section.criteria.length * 2;
              }, 0))"></q-linear-progress>
            </div>
          </div>

          <!-- Sections -->
          <q-expansion-item v-for="section in unit?.sections" :key="section.id" expand-separator
            :label="section.id + ' ' + section.learningOutcome" :icon="isSectionComplete(section) ? 'check' : 'cancel'"
            default-opened :header-class="$q.screen.gt.sm ? 'bg-grey-3 text-h5' : 'bg-grey-3'">

            <!-- Section progress -->
            <div class="q-pa-md text-subtitle2">
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
              :label="criteria.id + ' ' + criteria.title" default-opened
              :icon="criteria.claims.length >= 2 ? 'check' : 'cancel'"
              :header-class="$q.screen.gt.sm ? 'bg-grey-1 text-h6' : 'bg-grey-1'">
              <!-- Criteria details -->
              <q-card>
                <div :class="$q.screen.gt.sm ? 'row q-pl-xl' : 'row'">
                  <template v-if="$q.screen.gt.sm">
                    <!-- Desktop: show both columns -->
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
                          <q-btn @click="onClickAddClaim(criteria)" color="grey-14" text-color="white" icon="add"
                            size="sm" />
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
                  </template>
                  <template v-else>
                    <!-- Mobile: Guidance above Claims -->
                    <div class="col-12">
                      <q-card-section>
                        <div class="text-subtitle2">Guidance:</div>
                        <q-list dense v-for="item in criteria.guidance" :key="item">
                          <q-item>
                            <q-item-section>
                              <q-item-label class="text-body2">• {{ item }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                      <q-card-section>
                        <div class="float-right">
                          <q-btn @click="onClickAddClaim(criteria)" color="grey-14" text-color="white" icon="add"
                            size="sm" />
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
                  </template>
                </div>
              </q-card>
            </q-expansion-item>
          </q-expansion-item>
        </q-expansion-item>
      </q-list>
    </div>

    <!-- Upload a criteria file -->
    <div v-else class="q-pa-md">
      <q-card class="q-mb-xs">
        <q-card-section>
          <div class="text-h5">Welcome to Criteria Tracker</div>
          <div class="text-subtitle2">A simple tool to help you track your progress against your course criteria.</div>
        </q-card-section>

        <q-card-section v-if="localStorageCriteriaSets.length > 0">
          <div class="text-h6">Load from browser storage...</div>
          <div class="text-subtitle2">If you have previously saved your criteria file in the browser local storage you
            can load it
            here.</div>
          <q-table :rows="localStorageCriteriaSets" :columns="[
            { name: 'fileName', label: 'File Name', field: 'fileName', align: 'left' },
            { name: 'action', label: '', field: 'action', align: 'center' }
          ]" row-key="fileName" @row-click="(_, row) => loadFromLocalStorage(row.fileName)">
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <q-btn color="negative" icon="delete" size="sm" flat
                  @click.stop="deleteFileName = props.row.fileName; isDeleteDialogOpen = true" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

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
          <div class="text-subtitle2">If this is your first time here select a template</div>
          <q-list bordered>
            <!-- <q-item clickable @click="loadTemplate('cst-l3')">
              <q-item-section>
                <q-item-label><b>CST-L3</b> Level 3 Certificate in Counselling Studies (2024-2025)</q-item-label>
              </q-item-section>
            </q-item> -->

            <q-item clickable @click="loadTemplate('L4-1-0925-127CC')">
              <q-item-section>
                <q-item-label><b>L4-1-0925-127CC</b> Level 4 Diploma in Integrative Therapeutic Counselling: Year 1
                  (2025-2026)</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable @click="loadTemplate('tutorial')">
              <q-item-section>
                <q-item-label><b>TUTORIAL</b> Learn how to use this application</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Save file dialog -->
    <q-dialog v-model="isSaveDialogOpen" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Save Criteria File</div>
        </q-card-section>

        <q-card-section class="text-subtitle2">
          Choose how you would like to save your criteria file.
        </q-card-section>

        <q-card-section v-if="saveFileFormat === 'localStorage'" class="text-subtitle2">

        </q-card-section>

        <q-card-section>
          <q-input v-model="saveFileName" label="File Name" placeholder="Enter file name" />
          <q-select v-model="saveFileFormat"
            :options="[{ label: 'Local storage (Kept in the browser)', value: 'localStorage' }, { label: 'JSON (Download folder)', value: 'json' }, { label: 'CSV (Download folder)', value: 'csv' }]"
            label="File Format" emit-value />
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
          ]" ref="evidence" autofocus>
            <template v-slot:append>
              <q-icon name="auto_awesome" class="cursor-pointer" color="pink">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale" v-model="showEvidenceSuggestions">
                  <q-banner style="max-width: 600px;">
                    <q-chip clickable v-for="suggestion in [
                      { text: 'Learning review', type: ClaimSource.Written },
                      { text: 'Journal', type: ClaimSource.Written },
                      { text: 'Presentation', type: ClaimSource.Written },
                      { text: 'Assignment', type: ClaimSource.Written },
                      { text: 'Case study', type: ClaimSource.Written },
                      { text: 'Research project', type: ClaimSource.Written },
                      { text: 'Self-assessment', type: ClaimSource.Written },
                      { text: 'Development plan', type: ClaimSource.Written },
                      { text: 'Supervision log', type: ClaimSource.Testimony },
                      { text: 'Client session log', type: ClaimSource.Testimony },
                      { text: 'Peer skills feedback', type: ClaimSource.Testimony },
                      { text: 'Group work log', type: ClaimSource.Testimony },
                      { text: 'Workshop activity', type: ClaimSource.Testimony },
                      { text: 'Tutorial log', type: ClaimSource.TutorObservation },
                      { text: 'Tutor skills feedback', type: ClaimSource.TutorObservation }
                    ]" :key="suggestion.text"
                      @click="claimForm.evidence = suggestion.text; claimForm.source = suggestion.type; showEvidenceSuggestions = false"
                      :color="getClaimColor(suggestion.type)" text-color="white">
                      {{ suggestion.text }}
                    </q-chip>
                  </q-banner>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn-toggle v-model="claimForm.source" :options="claimSourceOptions"
            :toggle-color="getClaimColor(claimForm.source)" label="Source" spread dense rounded />
          <q-input v-model="claimForm.page" type="number" label="Page" />
          <q-input v-model="claimForm.claimDate" mask="date" label="Date claimed" :rules="['date']">
            <template v-slot:append>
              <q-icon v-if="!claimForm.claimDate" name="auto_awesome" class="cursor-pointer" color="pink"
                @click="claimForm.claimDate = new Date().toISOString().slice(0, 10)" />
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

    <!-- Delete local storage criteria set dialog -->
    <q-dialog v-model="isDeleteDialogOpen" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Delete Criteria File</div>
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle2">
            Are you sure you want to delete this file from local storage? This action cannot be undone.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancel" color="secondary" @click="isDeleteDialogOpen = false" />
          <q-btn label="Delete" color="negative" @click="deleteFromLocalStorage(saveFileName)" />
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
import { v4 as uuidv4 } from 'uuid';

const criteriaSetStore = useCriteriaSetStore();
const criteriaSet = ref<CriteriaSet | undefined>();
const criteriaSetFile = ref<File | null>(null);
const isClaimDialogOpen = ref(false);
const isSaveDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const showEvidenceSuggestions = ref(false);
const saveFileFormat = ref('localStorage');
const saveFileName = ref('');
const deleteFileName = ref('');
const selectedCriteria = ref<CriteriaDefinition | undefined>();
const claimForm = ref<Claim>({
  id: '',
  evidence: '',
  claimDate: '',
  confirmed: false,
  page: undefined,
  source: ClaimSource.Written,
});
const localStorageCriteriaSets = ref(loadAllFromLocalStorage());

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
  if (claimForm.value.id) {
    const criteria = criteriaSet.value?.units
      .flatMap(unit => unit.sections)
      .flatMap(section => section.criteria)
      .find(criteria =>
        criteria.claims.some(existingClaim => existingClaim.id === claimForm.value.id)
      );
    if (criteria) {
      const existingClaim = criteria.claims.find(existingClaim => existingClaim.id === claimForm.value.id);
      if (existingClaim) {
        Object.assign(existingClaim, claimForm.value);
      }
    }
  } else {
    alert('Adding new claim');
    const newClaim = claimForm.value;
    alert(newClaim.evidence);
    newClaim.id = uuidv4();
    alert(newClaim.id);
    const criteria = selectedCriteria.value;
    if (!criteria) {
      console.error('No criteria selected for new claim');
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
  const criteria = criteriaSet.value?.units
    .flatMap(unit => unit.sections)
    .flatMap(section => section.criteria)
    .find(criteria =>
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
  const totalCriteria = criteriaSet.value.units.reduce((unitTotal, unit) => {
    return unitTotal + unit.sections.reduce((sectionTotal, section) => {
      return sectionTotal + section.criteria.length * 2;
    }, 0);
  }, 0);
  const completedCriteria = criteriaSet.value.units.reduce((unitTotal, unit) => {
    return unitTotal + unit.sections.reduce((sectionTotal, section) => {
      return sectionTotal + section.criteria.reduce((criteriaTotal, criteria) => {
        return criteriaTotal + Math.min(criteria.claims.length, 2);
      }, 0);
    }, 0);
  }, 0);
  return totalCriteria > 0 ? completedCriteria / totalCriteria : 0;
}

function isUnitComplete(unit: { sections: CriteriaSection[] }): boolean {
  return unit.sections.every(section => isSectionComplete(section));
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
  if (criteriaSet.value && !criteriaSet.value?.sections) {
    criteriaSet.value.sections = []
  }
  if (criteriaSet.value && !criteriaSet.value?.units) {
    criteriaSet.value.units = [
      {
        id: 1,
        learningOutcome: criteriaSet.value.courseTitle,
        sections: criteriaSet.value.sections
      }
    ]
  }
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
    } else if (saveFileFormat.value === 'localStorage') {
      saveInLocalStorage();
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

  criteriaSet.value?.units.forEach(unit => {
    rows.push([`UNIT: ${unit.id} ${unit.learningOutcome}`]);
    unit.sections.forEach(section => {
      // Add section header
      rows.push(['LEARNING OUTCOME:', `${section.id} ${section.learningOutcome}`]);

      // Add column headings
      rows.push(['Assessment criteria', 'Candidate guidance to criteria', 'Portfolio reference']);

      // Add criteria rows
      section.criteria.forEach(criteria => {
        const guidance = criteria.guidance.map(item => `• ${item}`).join('\n');
        const claims = criteria.claims.map(claim => {
          let formattedDate = '';
          if (claim.claimDate) {
            const dateObj = new Date(claim.claimDate);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            formattedDate = `${day}/${month}/${year}`;
          }
          return `${claim.evidence} ${formattedDate ? `${formattedDate}` : ''} (${claim.source}) ${claim.page ? `p${claim.page}` : ''}`;
        }).join('\n');
        rows.push([`${criteria.id} ${criteria.title}`, guidance, claims]);
      });
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

function saveInLocalStorage() {
  if (criteriaSet.value) {
    localStorage.setItem(saveFileName.value, JSON.stringify(criteriaSet.value));
  }
}

function loadAllFromLocalStorage() {
  const keys = Object.keys(localStorage);
  if (keys.length === 0) {
    return [];
  }

  return keys.map(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return { fileName: key, criteriaSet: JSON.parse(data) as CriteriaSet };
      } catch (error) {
        console.error('Failed to parse criteria set from local storage:', error);
        return null;
      }
    }
    return null;
  }).filter(item => item !== null) as { fileName: string; criteriaSet: CriteriaSet }[];
}

function loadFromLocalStorage(fileName: string): void {
  const data = localStorage.getItem(fileName);
  if (data) {
    try {
      criteriaSet.value = JSON.parse(data);
      if (criteriaSet.value) {
        criteriaSetStore.setCriteriaSet(criteriaSet.value);
        saveFileName.value = fileName;
      }
    } catch (error) {
      console.error('Failed to parse criteria set from local storage:', error);
    }
  } else {
    console.error('No data found in local storage for the given file name.');
  }
}

function deleteFromLocalStorage(fileName: string): void {
  localStorage.removeItem(fileName);
  if (criteriaSet?.value && saveFileName.value === fileName) {
    criteriaSet.value = undefined;
    saveFileName.value = '';
  }
  localStorageCriteriaSets.value = loadAllFromLocalStorage();
}
</script>
