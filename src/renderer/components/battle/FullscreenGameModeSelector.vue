<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="fullscreen" :class="{ hidden: !battleStore.isSelectingGameMode }" @click.self="closeOverlay">
        <div class="gamemode-container">
            <Transition :name="transitionName" mode="out-in">
                <SkirmishEntryChooser
                    v-if="flowState.step === 'entry'"
                    key="entry"
                    @select-custom="openCustomModes"
                    @select-quick-start="createQuickStart"
                />
                <div v-else-if="flowState.step === 'preparing-quick-start'" key="preparing" class="quick-start-status" data-testid="quick-start-preparing">
                    <p>{{ t("lobby.components.misc.skirmishEntryChooser.preparingQuickStart") }}</p>
                </div>
                <div v-else-if="flowState.step === 'quick-start-error'" key="error" class="quick-start-status" data-testid="quick-start-error">
                    <p>{{ t("lobby.components.misc.skirmishEntryChooser.quickStartFailed") }}</p>
                    <p>{{ flowState.message }}</p>
                    <button data-testid="retry-quick-start" type="button" @click="createQuickStart">
                        {{ t("lobby.components.misc.skirmishEntryChooser.retryQuickStart") }}
                    </button>
                    <button type="button" @click="returnToEntry">{{ t("lobby.components.misc.skirmishEntryChooser.back") }}</button>
                </div>
                <div v-else key="custom-modes" class="custom-mode-step">
                    <button class="back-button" data-testid="back-to-skirmish-entry" type="button" @click="returnToEntry">
                        {{ t("lobby.components.misc.skirmishEntryChooser.back") }}
                    </button>
                    <GameModeSelector @selected="completeSelection" />
                </div>
            </Transition>
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
import { computed, ref, watch } from "vue";

const props = defineProps<{
    visible: boolean;
}>();

const emit = defineEmits<{
    closed: [];
}>();

const { t } = useTypedI18n();
const flowState = ref<SkirmishEntryState>(initialSkirmishEntryState);
const direction = ref<"forward" | "back">("forward");
const transitionName = computed(() => (direction.value === "forward" ? "drill-forward" : "drill-back"));

function send(event: SkirmishEntryEvent) {
    flowState.value = transitionSkirmishEntry(flowState.value, event);
}

function openCustomModes() {
    direction.value = "forward";
    send({ type: "select-custom" });
}

async function createQuickStart() {
    direction.value = "forward";
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
    direction.value = "back";
    send({ type: "back" });
}

function resetFlow() {
    direction.value = "forward";
    send({ type: "reset" });
}

function closeOverlay() {
    battleStore.isSelectingGameMode = false;
    resetFlow();
}

function completeSelection() {
    battleStore.isSelectingGameMode = false;
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
    display: flex;
    flex-direction: column;
    align-self: center;
    height: 720px;
    width: min(1300px, calc(100vw - 120px));
    overflow: hidden;
}

.custom-mode-step {
    position: relative;
    height: 100%;
}

.quick-start-status {
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

.drill-forward-enter-active,
.drill-forward-leave-active,
.drill-back-enter-active,
.drill-back-leave-active {
    transition:
        opacity 180ms ease,
        transform 180ms ease;
}

.drill-forward-enter-from,
.drill-back-leave-to {
    opacity: 0;
    transform: translateX(72px);
}

.drill-forward-leave-to,
.drill-back-enter-from {
    opacity: 0;
    transform: translateX(-72px);
}
</style>
