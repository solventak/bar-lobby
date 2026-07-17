<!--
SPDX-FileCopyrightText: 2026 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="entry-select">
        <button class="entry-option recommended" data-testid="quick-start" type="button" @click="$emit('select-quick-start')">
            <span
                class="art"
                :style="{ backgroundImage: `url(${quickStartImage})` }"
                aria-hidden="true"
                data-testid="quick-start-art"
            ></span>
            <span class="content">
                <span class="eyebrow">{{ t("lobby.components.misc.skirmishEntryChooser.recommended") }}</span>
                <span class="title">{{ t("lobby.components.misc.skirmishEntryChooser.quickStart") }}</span>
                <span class="description">{{ t("lobby.components.misc.skirmishEntryChooser.quickStartDescription") }}</span>
                <span class="summary">{{ t("lobby.components.misc.skirmishEntryChooser.quickStartSummary") }}</span>
                <span class="action">{{ t("lobby.components.misc.skirmishEntryChooser.createQuickMatch") }}</span>
            </span>
        </button>

        <button class="entry-option" data-testid="custom-skirmish" type="button" @click="$emit('select-custom')">
            <span
                class="art"
                :style="{ backgroundImage: `url(${customSkirmishImage})` }"
                aria-hidden="true"
                data-testid="custom-skirmish-art"
            ></span>
            <span class="content">
                <span class="eyebrow">{{ t("lobby.components.misc.skirmishEntryChooser.fullControl") }}</span>
                <span class="title">{{ t("lobby.components.misc.skirmishEntryChooser.customSkirmish") }}</span>
                <span class="description">{{ t("lobby.components.misc.skirmishEntryChooser.customSkirmishDescription") }}</span>
                <span class="summary">{{ t("lobby.components.misc.skirmishEntryChooser.customSkirmishSummary") }}</span>
                <span class="action">{{ t("lobby.components.misc.skirmishEntryChooser.setUpCustom") }}</span>
            </span>
        </button>
    </div>
</template>

<script lang="ts" setup>
import customSkirmishImage from "@renderer/assets/images/modes/classic/custom-skirmish.png";
import quickStartImage from "@renderer/assets/images/modes/classic/quick-start.png";
import { useTypedI18n } from "@renderer/i18n";

const { t } = useTypedI18n();

defineEmits<{
    "select-custom": [];
    "select-quick-start": [];
}>();
</script>

<style lang="scss" scoped>
.entry-select {
    display: flex;
    height: 100%;
    overflow: hidden;
}

.entry-option {
    position: relative;
    isolation: isolate;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 0;
    color: white;
    background: #10171e;
    cursor: pointer;
    text-align: center;
    transform: skewX(-5deg);
    transition:
        flex 0.3s ease,
        filter 0.3s ease,
        transform 0.3s ease;

    &::after {
        position: absolute;
        z-index: -1;
        inset: 0;
        background: linear-gradient(180deg, rgba(6, 10, 14, 0.18), rgba(6, 10, 14, 0.78));
        content: "";
    }

    &:not(:disabled):hover,
    &:not(:disabled):focus-visible {
        flex: 1.15;
        filter: brightness(1.15);
        outline: none;
        transform: scale(1.025) skewX(-5deg);
    }

    &:disabled {
        cursor: not-allowed;
    }
}

.art {
    position: absolute;
    z-index: -2;
    inset: -2px -80px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    transform: skewX(5deg) scale(1.03);
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    width: min(460px, calc(100vw - 96px));
    gap: 20px;
    transform: skewX(5deg);
}

.eyebrow,
.availability,
.action {
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.title {
    font-size: 3rem;
    font-weight: 700;
    text-transform: uppercase;
}

.description {
    font-size: 1.6rem;
    font-weight: 600;
}

.summary {
    font-size: 1.2rem;
}

.availability {
    opacity: 0.7;
}
</style>
