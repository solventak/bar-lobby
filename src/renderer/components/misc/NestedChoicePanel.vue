<!--
SPDX-FileCopyrightText: 2026 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="nested-choice-panel">
        <template v-if="operation.status === 'idle'">
            <button v-if="path.length && !transition" class="back-button" data-testid="choice-panel-back" type="button" @click="goBack">
                {{ backLabel }}
            </button>
            <div v-if="transition" class="transition-stack" :class="`transition-${transition.direction}`">
                <DiagonalChoiceLevel
                    :items="transition.outgoingItems"
                    :selected-id="transition.direction === 'forward' ? transition.branch.id : undefined"
                    :transition-role="`${transition.direction}-outgoing`"
                    :interactive="false"
                    @transition-complete="transition.direction === 'forward' && completeTransition()"
                />
                <DiagonalChoiceLevel
                    :items="transition.incomingItems"
                    :selected-id="transition.direction === 'back' ? transition.branch.id : undefined"
                    :transition-role="`${transition.direction}-incoming`"
                    :interactive="false"
                    @transition-complete="transition.direction === 'back' && completeTransition()"
                />
            </div>
            <DiagonalChoiceLevel v-else :items="currentItems" @select="selectItem" />
        </template>
        <div v-else class="operation-status">
            <p v-if="operation.status === 'pending'" data-testid="choice-panel-pending">{{ pendingLabel }}</p>
            <template v-else>
                <p>{{ failureLabel }}</p>
                <p data-testid="choice-panel-error">{{ operation.message }}</p>
                <button data-testid="choice-panel-retry" type="button" @click="runActiveAction">{{ retryLabel }}</button>
                <button type="button" @click="clearOperation">{{ backLabel }}</button>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import DiagonalChoiceLevel from "@renderer/components/misc/DiagonalChoiceLevel.vue";
import type { ChoicePanelAction, ChoicePanelBranch, ChoicePanelItem } from "@renderer/components/misc/nested-choice-panel.types";
import { computed, reactive, ref, watch } from "vue";

const props = withDefaults(
    defineProps<{
        choices: ChoicePanelItem[];
        backLabel: string;
        pendingLabel?: string;
        failureLabel?: string;
        retryLabel?: string;
        resetKey?: number;
    }>(),
    {
        pendingLabel: "Preparing…",
        failureLabel: "The selection could not be prepared.",
        retryLabel: "Retry",
        resetKey: 0,
    }
);

const emit = defineEmits<{
    completed: [id: string];
}>();

type PanelTransition = {
    direction: "forward" | "back";
    branch: ChoicePanelBranch;
    outgoingItems: ChoicePanelItem[];
    incomingItems: ChoicePanelItem[];
};

const path = ref<ChoicePanelBranch[]>([]);
const transition = ref<PanelTransition>();
const activeAction = ref<ChoicePanelAction>();
const operation = reactive<{ status: "idle" | "pending" | "error"; message?: string }>({ status: "idle" });

const currentItems = computed(() => path.value.at(-1)?.children ?? props.choices);

async function selectItem(item: ChoicePanelItem) {
    if (transition.value) return;

    if (item.type === "branch") {
        await item.beforeEnter?.();
        if (transition.value) return;
        transition.value = {
            direction: "forward",
            branch: item,
            outgoingItems: currentItems.value,
            incomingItems: item.children,
        };
        return;
    }

    activeAction.value = item;
    await runActiveAction();
}

async function runActiveAction() {
    const action = activeAction.value;
    if (!action || operation.status === "pending") return;

    operation.status = "pending";
    operation.message = undefined;
    try {
        const result = await action.run();
        if (result.ok) {
            emit("completed", action.id);
            return;
        }

        operation.status = "error";
        operation.message = result.message;
    } catch (error) {
        operation.status = "error";
        operation.message = error instanceof Error ? error.message : String(error);
    }
}

function clearOperation() {
    activeAction.value = undefined;
    operation.status = "idle";
    operation.message = undefined;
}

function goBack() {
    if (transition.value) return;
    const branch = path.value.at(-1);
    if (!branch) return;

    const parentItems = path.value.at(-2)?.children ?? props.choices;
    transition.value = {
        direction: "back",
        branch,
        outgoingItems: currentItems.value,
        incomingItems: parentItems,
    };
}

function completeTransition() {
    const activeTransition = transition.value;
    if (!activeTransition) return;

    if (activeTransition.direction === "forward") {
        path.value.push(activeTransition.branch);
    } else {
        path.value.pop();
    }
    transition.value = undefined;
}

function reset() {
    transition.value = undefined;
    path.value = [];
    clearOperation();
}

watch(() => props.resetKey, reset);

defineExpose({ reset });
</script>

<style lang="scss" scoped>
.nested-choice-panel {
    position: relative;
    height: 100%;
    overflow: hidden;
}

.transition-stack {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.back-button {
    position: absolute;
    top: 20px;
    left: 24px;
    z-index: 3;
    border: 0;
    padding: 12px 18px;
    color: white;
    background: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    text-transform: uppercase;
}

.operation-status {
    display: flex;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    color: white;
    text-align: center;
    background: rgba(19, 40, 49, 0.94);

    p {
        max-width: 38rem;
        margin: 0;
        font-size: 1.3rem;
    }

    button {
        border: 0;
        padding: 12px 18px;
        color: white;
        background: rgba(0, 0, 0, 0.65);
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        text-transform: uppercase;
    }
}
</style>
