<!--
SPDX-FileCopyrightText: 2026 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="entry-select">
        <button class="entry-option recommended" data-testid="quick-start" type="button" @click="$emit('select-quick-start')">
            <span class="eyebrow">{{ t("lobby.components.misc.skirmishEntryChooser.recommended") }}</span>
            <span class="title">{{ t("lobby.components.misc.skirmishEntryChooser.quickStart") }}</span>
            <span class="description">{{ t("lobby.components.misc.skirmishEntryChooser.quickStartDescription") }}</span>
            <span class="summary">{{ t("lobby.components.misc.skirmishEntryChooser.quickStartSummary") }}</span>
            <span class="action">{{ t("lobby.components.misc.skirmishEntryChooser.createQuickMatch") }}</span>
        </button>

        <button class="entry-option" data-testid="custom-skirmish" type="button" @click="$emit('select-custom')">
            <span class="eyebrow">{{ t("lobby.components.misc.skirmishEntryChooser.fullControl") }}</span>
            <span class="title">{{ t("lobby.components.misc.skirmishEntryChooser.customSkirmish") }}</span>
            <span class="description">{{ t("lobby.components.misc.skirmishEntryChooser.customSkirmishDescription") }}</span>
            <span class="summary">{{ t("lobby.components.misc.skirmishEntryChooser.customSkirmishSummary") }}</span>
            <span class="action">{{ t("lobby.components.misc.skirmishEntryChooser.setUpCustom") }}</span>
        </button>
    </div>
</template>

<script lang="ts" setup>
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
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    border: 0;
    color: white;
    background: rgba(16, 23, 30, 0.92);
    cursor: pointer;
    text-align: center;
    transform: skewX(-5deg);
    transition:
        flex 0.3s ease,
        filter 0.3s ease,
        transform 0.3s ease;

    > span {
        max-width: 70%;
        transform: skewX(5deg);
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

    &.recommended {
        background: rgba(19, 40, 49, 0.94);
    }
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
