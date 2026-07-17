<!--
SPDX-FileCopyrightText: 2026 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div class="choice-level">
        <button
            v-for="item in items"
            :key="item.id"
            class="choice-item"
            :class="[`presentation-${item.presentation ?? 'detailed'}`, { recommended: item.emphasis === 'recommended' }]"
            :data-testid="item.testId ?? `choice-${item.id}`"
            type="button"
            @click="$emit('select', item)"
        >
            <span
                v-if="item.artwork"
                class="art"
                :style="{ backgroundImage: `url(${item.artwork})` }"
                :data-testid="item.artworkTestId"
                aria-hidden="true"
            ></span>
            <span class="content">
                <span v-if="item.eyebrow" class="eyebrow">{{ item.eyebrow }}</span>
                <span class="title">{{ item.title }}</span>
                <span v-if="item.description" class="description">{{ item.description }}</span>
                <span v-if="item.summary" class="summary">{{ item.summary }}</span>
                <span v-if="item.actionLabel" class="action">{{ item.actionLabel }}</span>
            </span>
        </button>
    </div>
</template>

<script lang="ts" setup>
import type { ChoicePanelItem } from "@renderer/components/misc/nested-choice-panel.types";

defineProps<{ items: ChoicePanelItem[] }>();

defineEmits<{
    select: [item: ChoicePanelItem];
}>();
</script>

<style lang="scss" scoped>
.choice-level {
    display: flex;
    height: 100%;
    overflow: hidden;
}

.choice-item {
    position: relative;
    isolation: isolate;
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 0;
    padding: 0;
    color: white;
    background: #10171e;
    cursor: pointer;
    text-align: center;
    filter: brightness(0.85);
    transform: skewX(-5deg);
    transition:
        flex 300ms ease,
        filter 300ms ease,
        transform 300ms ease;

    &::after {
        position: absolute;
        z-index: -1;
        inset: 0;
        background: linear-gradient(180deg, rgba(6, 10, 14, 0.18), rgba(6, 10, 14, 0.78));
        content: "";
    }

    &:hover,
    &:focus-visible {
        z-index: 1;
        flex: 1.15;
        filter: brightness(1.15);
        outline: none;
        transform: scale(1.025) skewX(-5deg);
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

.presentation-mode {
    justify-content: center;
    padding-top: 30px;
    filter: brightness(0.7);

    &:hover,
    &:focus-visible {
        flex: 1.5;
        filter: brightness(1);
        transform: scale(1.05) skewX(0deg);
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.5);
    }

    .content {
        justify-content: space-between;
        width: 100%;
        height: 100%;
        gap: 0;
    }

    .title {
        font-size: 2rem;
        filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.8));
    }

    .action {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 100%;
        min-height: 120px;
        padding: 20px;
        color: white;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        box-shadow: 0 8px 15px rgba(34, 197, 94, 0.4);
        font-family: Rajdhani;
        font-size: 2rem;
        letter-spacing: normal;
    }
}
</style>
