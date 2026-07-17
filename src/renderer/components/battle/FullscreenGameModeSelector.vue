<!--
SPDX-FileCopyrightText: 2025 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="fullscreen" :class="{ hidden: !battleStore.isSelectingGameMode }" @click.self="closeOverlay">
        <div class="gamemode-container">
            <NestedChoicePanel
                :choices="skirmishChoices"
                :back-label="t('lobby.components.misc.skirmishEntryChooser.back')"
                :pending-label="t('lobby.components.misc.skirmishEntryChooser.preparingQuickStart')"
                :failure-label="t('lobby.components.misc.skirmishEntryChooser.quickStartFailed')"
                :retry-label="t('lobby.components.misc.skirmishEntryChooser.retryQuickStart')"
                :reset-key="resetKey"
                @completed="completeSelection"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { GameModeID } from "@main/game/battle/battle-types";
import classicImage from "@renderer/assets/images/backgrounds/5.jpg";
import customSkirmishImage from "@renderer/assets/images/modes/classic/custom-skirmish.png";
import quickStartImage from "@renderer/assets/images/modes/classic/quick-start.png";
import ffaImage from "@renderer/assets/images/modes/ffa.jpg";
import raptorsImage from "@renderer/assets/images/modes/raptors.jpg";
import scavengersImage from "@renderer/assets/images/modes/scavengers.webp";
import NestedChoicePanel from "@renderer/components/misc/NestedChoicePanel.vue";
import type { ChoicePanelItem } from "@renderer/components/misc/nested-choice-panel.types";
import { useTypedI18n } from "@renderer/i18n";
import { battleActions, battleStore } from "@renderer/store/battle.store";
import { computed, ref, watch } from "vue";

const props = defineProps<{
    visible: boolean;
}>();

const emit = defineEmits<{
    closed: [];
}>();

const { t } = useTypedI18n();
const resetKey = ref(0);

function modeChoice(id: string, title: string, actionLabel: string, artwork: string, gameModeId: GameModeID): ChoicePanelItem {
    return {
        type: "action",
        id,
        title,
        actionLabel,
        artwork,
        presentation: "mode",
        run: async () => {
            await battleActions.loadGameMode(gameModeId);
            return { ok: true };
        },
    };
}

const skirmishChoices = computed<ChoicePanelItem[]>(() => [
    {
        type: "action",
        id: "quick-start",
        testId: "quick-start",
        artworkTestId: "quick-start-art",
        emphasis: "recommended",
        eyebrow: t("lobby.components.misc.skirmishEntryChooser.recommended"),
        title: t("lobby.components.misc.skirmishEntryChooser.quickStart"),
        description: t("lobby.components.misc.skirmishEntryChooser.quickStartDescription"),
        summary: t("lobby.components.misc.skirmishEntryChooser.quickStartSummary"),
        actionLabel: t("lobby.components.misc.skirmishEntryChooser.createQuickMatch"),
        artwork: quickStartImage,
        run: battleActions.createBeginnerSkirmish,
    },
    {
        type: "branch",
        id: "custom-skirmish",
        testId: "custom-skirmish",
        artworkTestId: "custom-skirmish-art",
        eyebrow: t("lobby.components.misc.skirmishEntryChooser.fullControl"),
        title: t("lobby.components.misc.skirmishEntryChooser.customSkirmish"),
        description: t("lobby.components.misc.skirmishEntryChooser.customSkirmishDescription"),
        summary: t("lobby.components.misc.skirmishEntryChooser.customSkirmishSummary"),
        actionLabel: t("lobby.components.misc.skirmishEntryChooser.setUpCustom"),
        artwork: customSkirmishImage,
        beforeEnter: battleActions.resetToDefaultBattle,
        children: [
            modeChoice(
                "classic",
                t("lobby.components.misc.gameModeSelector.classic"),
                t("lobby.components.misc.gameModeSelector.classicDescription"),
                classicImage,
                GameModeID.CLASSIC
            ),
            modeChoice(
                "raptors",
                t("lobby.components.misc.gameModeSelector.raptors"),
                t("lobby.components.misc.gameModeSelector.raptorsDescription"),
                raptorsImage,
                GameModeID.RAPTORS
            ),
            modeChoice(
                "scavengers",
                t("lobby.components.misc.gameModeSelector.scavengers"),
                t("lobby.components.misc.gameModeSelector.scavengersDescription"),
                scavengersImage,
                GameModeID.SCAVENGERS
            ),
            modeChoice(
                "ffa",
                t("lobby.components.misc.gameModeSelector.ffa"),
                t("lobby.components.misc.gameModeSelector.ffaDescription"),
                ffaImage,
                GameModeID.FFA
            ),
        ],
    },
]);

function resetPanel() {
    resetKey.value += 1;
}

function closeOverlay() {
    battleStore.isSelectingGameMode = false;
    resetPanel();
}

function completeSelection() {
    battleStore.isSelectingGameMode = false;
    battleStore.isLobbyOpened = true;
    resetPanel();
    emit("closed");
}

watch(
    () => props.visible,
    (visible) => {
        if (!visible) resetPanel();
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
    align-self: center;
    width: min(1300px, calc(100vw - 120px));
    height: 720px;
    overflow: hidden;
}
</style>
