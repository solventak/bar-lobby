<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="fullscreen" :class="{ hidden: !battleStore.isSelectingGameMode }" @click.self="closeOverlay">
        <div
            class="gamemode-container"
            :class="{
                'is-custom-collapsing': transitionPhase === 'custom-collapsing',
                'is-custom-expanding': transitionPhase === 'custom-expanding',
                'is-custom-open': transitionPhase === 'custom-open',
                'is-quick-start-open': transitionPhase === 'quick-start-open',
            }"
        >
            <div class="entry-step">
                <SkirmishEntryChooser :expanded="expandedEntry" @select-custom="openCustomModes" @select-quick-start="createQuickStart" />
            </div>
            <div v-if="showCustomModes" class="custom-mode-step">
                <button class="back-button" data-testid="back-to-skirmish-entry" type="button" @click="returnToEntry">
                    {{ t("lobby.components.misc.skirmishEntryChooser.back") }}
                </button>
                <GameModeSelector @selected="completeSelection" />
            </div>
            <div
                v-if="flowState.step === 'preparing-quick-start' || flowState.step === 'quick-start-error'"
                class="quick-start-status"
                :class="{ visible: transitionPhase === 'quick-start-open' }"
                data-testid="quick-start-status"
            >
                <template v-if="flowState.step === 'preparing-quick-start'">
                    <p data-testid="quick-start-preparing">{{ t("lobby.components.misc.skirmishEntryChooser.preparingQuickStart") }}</p>
                </template>
                <template v-else>
                    <p>{{ t("lobby.components.misc.skirmishEntryChooser.quickStartFailed") }}</p>
                    <p data-testid="quick-start-error">{{ flowState.message }}</p>
                    <button data-testid="retry-quick-start" type="button" @click="createQuickStart">
                        {{ t("lobby.components.misc.skirmishEntryChooser.retryQuickStart") }}
                    </button>
                    <button type="button" @click="returnToEntry">{{ t("lobby.components.misc.skirmishEntryChooser.back") }}</button>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import GameModeSelector from "@renderer/components/misc/GameModeSelector.vue";
import SkirmishEntryChooser from "@renderer/components/misc/SkirmishEntryChooser.vue";
import {
    initialSkirmishEntryState,
    transitionSkirmishEntry,
    type SkirmishEntryEvent,
    type SkirmishEntryState,
} from "@renderer/components/battle/skirmish-entry-flow";
import { battleActions, battleStore } from "@renderer/store/battle.store";
import { useTypedI18n } from "@renderer/i18n";
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps<{
    visible: boolean;
}>();

const emit = defineEmits<{
    closed: [];
}>();

type TransitionPhase = "idle" | "custom-expanding" | "custom-open" | "custom-collapsing" | "quick-start-open";

const { t } = useTypedI18n();
const flowState = ref<SkirmishEntryState>(initialSkirmishEntryState);
const transitionPhase = ref<TransitionPhase>("idle");
let transitionTimer: ReturnType<typeof setTimeout> | undefined;

const expandedEntry = computed<"custom" | "quick-start" | undefined>(() => {
    if (transitionPhase.value === "custom-expanding" || transitionPhase.value === "custom-open") return "custom";
    if (transitionPhase.value === "quick-start-open") return "quick-start";
    return undefined;
});
const showCustomModes = computed(() => flowState.value.step === "custom-modes" || transitionPhase.value === "custom-collapsing");

function send(event: SkirmishEntryEvent) {
    flowState.value = transitionSkirmishEntry(flowState.value, event);
}

function clearTransitionTimer() {
    if (transitionTimer) {
        clearTimeout(transitionTimer);
        transitionTimer = undefined;
    }
}

function openCustomModes() {
    battleActions.resetToDefaultBattle();
    transitionPhase.value = "custom-expanding";
    send({ type: "select-custom" });
    clearTransitionTimer();
    transitionTimer = setTimeout(() => {
        transitionPhase.value = "custom-open";
        transitionTimer = undefined;
    }, 100);
}

async function createQuickStart() {
    transitionPhase.value = "quick-start-open";
    if (flowState.value.step === "quick-start-error") {
        send({ type: "retry-quick-start" });
    } else {
        send({ type: "select-quick-start" });
    }

    const result = await battleActions.createBeginnerSkirmish();
    if (result.ok) {
        completeSelection();
    } else {
        send({ type: "quick-start-failed", message: result.message });
    }
}

function returnToEntry() {
    if (flowState.value.step !== "custom-modes") {
        transitionPhase.value = "idle";
        send({ type: "back" });
        return;
    }

    transitionPhase.value = "custom-collapsing";
    send({ type: "back" });
    clearTransitionTimer();
    transitionTimer = setTimeout(() => {
        transitionPhase.value = "idle";
        transitionTimer = undefined;
    }, 360);
}

function resetFlow() {
    clearTransitionTimer();
    transitionPhase.value = "idle";
    send({ type: "reset" });
}

onBeforeUnmount(clearTransitionTimer);

function closeOverlay() {
    battleStore.isSelectingGameMode = false;
    resetFlow();
}

function completeSelection() {
    battleStore.isSelectingGameMode = false;
    battleStore.isLobbyOpened = true;
    resetFlow();
    emit("closed");
}

watch(
    () => props.visible,
    (visible) => {
        if (!visible) {
            resetFlow();
        }
    }
);
</script>

<style lang="scss" scoped>
.fullscreen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    transition: all 0.2s ease-in-out;
    backdrop-filter: blur(5px) saturate(20%);

    &.hidden {
        opacity: 0;
        pointer-events: none;
    }
}

.gamemode-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-self: center;
    width: min(1300px, calc(100vw - 120px));
    height: 720px;
    overflow: hidden;
}

.entry-step,
.custom-mode-step,
.quick-start-status {
    position: absolute;
    inset: 0;
}

.entry-step {
    z-index: 1;
}

.custom-mode-step {
    z-index: 2;
    opacity: 1;
    clip-path: inset(0 0 0 100%);
    pointer-events: none;
    transition:
        clip-path 180ms cubic-bezier(0.2, 0.75, 0.2, 1),
        opacity 120ms ease;
}

.gamemode-container.is-custom-open .custom-mode-step {
    clip-path: inset(0);
    pointer-events: auto;
}

.gamemode-container.is-custom-collapsing .custom-mode-step {
    z-index: 0;
    opacity: 0;
    pointer-events: none;
    transition:
        clip-path 120ms ease,
        opacity 120ms ease;
}

.quick-start-status {
    z-index: 2;
    display: flex;
    opacity: 0;
    pointer-events: none;
    transition: opacity 160ms ease 160ms;
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

.quick-start-status.visible {
    opacity: 1;
    pointer-events: auto;
}

.back-button {
    position: absolute;
    top: 20px;
    left: 24px;
    z-index: 2;
    border: 0;
    color: white;
    background: rgba(0, 0, 0, 0.65);
    padding: 12px 18px;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    text-transform: uppercase;
}
</style>
