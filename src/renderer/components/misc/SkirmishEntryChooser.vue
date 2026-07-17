<!--
SPDX-FileCopyrightText: 2026 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div
        class="entry-select"
        :class="{ 'is-custom-expanded': expanded === 'custom', 'is-quick-start-expanded': expanded === 'quick-start' }"
    >
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

        <button class="entry-option custom" data-testid="custom-skirmish" type="button" @click="$emit('select-custom')">
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

withDefaults(
    defineProps<{
        expanded?: "custom" | "quick-start";
    }>(),
    { expanded: undefined }
);

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
    min-width: 0;
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
        flex 360ms cubic-bezier(0.2, 0.75, 0.2, 1),
        filter 0.3s ease,
        opacity 180ms ease,
        transform 360ms cubic-bezier(0.2, 0.75, 0.2, 1);

    &::after {
        position: absolute;
        z-index: -1;
        inset: 0;
        background: linear-gradient(180deg, rgba(6, 10, 14, 0.18), rgba(6, 10, 14, 0.78));
        content: "";
        transition: opacity 180ms ease 140ms;
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

.entry-select.is-custom-expanded,
.entry-select.is-quick-start-expanded {
    pointer-events: none;

    .entry-option {
        filter: none;
    }

    .content {
        opacity: 0;
    }

    .art,
    .entry-option::after {
        transition:
            opacity 180ms ease 140ms,
            transform 360ms cubic-bezier(0.2, 0.75, 0.2, 1);
    }
}

.entry-select.is-custom-expanded {
    .recommended {
        flex: 0;
        opacity: 0;
        transform: translateX(-24px) skewX(-5deg);
    }

    .custom {
        flex: 1;
        transform: skewX(0deg);

        .art {
            opacity: 0.15;
            transform: scale(1.03);
        }

        &::after {
            opacity: 0.2;
        }
    }
}

.entry-select.is-quick-start-expanded {
    .custom {
        flex: 0;
        opacity: 0;
        transform: translateX(24px) skewX(-5deg);
    }

    .recommended {
        flex: 1;
        transform: skewX(0deg);

        .art {
            opacity: 0.2;
            transform: scale(1.03);
        }

        &::after {
            opacity: 0.2;
        }
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
    transition:
        opacity 180ms ease 140ms,
        transform 360ms cubic-bezier(0.2, 0.75, 0.2, 1);
}

.content {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    width: min(460px, calc(100vw - 96px));
    gap: 20px;
    opacity: 1;
    transform: skewX(5deg);
    transition: opacity 120ms ease;
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
