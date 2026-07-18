<!--
SPDX-FileCopyrightText: 2026 The BAR Lobby Authors

SPDX-License-Identifier: MIT
-->

<template>
    <div
        class="choice-level"
        :class="transitionRole && `is-${transitionRole}`"
        :data-testid="transitionRole ? `choice-level-${transitionRole}` : undefined"
        @animationend="onAnimationEnd"
    >
        <button
            v-for="item in items"
            :key="item.id"
            class="choice-item"
            :class="[
                `presentation-${item.presentation ?? 'detailed'}`,
                {
                    recommended: item.emphasis === 'recommended',
                    'is-selected': item.id === selectedId,
                    'is-sibling': selectedId !== undefined && item.id !== selectedId,
                },
            ]"
            :data-testid="item.testId ?? `choice-${item.id}`"
            :disabled="!interactive"
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

withDefaults(
    defineProps<{
        items: ChoicePanelItem[];
        selectedId?: string;
        transitionRole?: "branch-expanding" | "branch-expanded" | "child-entering" | "child-exiting" | "branch-collapsing";
        interactive?: boolean;
    }>(),
    { selectedId: undefined, transitionRole: undefined, interactive: true }
);

const emit = defineEmits<{
    select: [item: ChoicePanelItem];
    "transition-complete": [];
}>();

function onAnimationEnd(event: AnimationEvent) {
    if (event.target === event.currentTarget) emit("transition-complete");
}
</script>

<style lang="scss" scoped>
$branch-duration: 300ms;
$swipe-duration: 220ms;

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

    &:not(:disabled):hover,
    &:not(:disabled):focus-visible {
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

    &:not(:disabled):hover,
    &:not(:disabled):focus-visible {
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

.is-branch-expanding,
.is-branch-expanded,
.is-child-entering,
.is-child-exiting,
.is-branch-collapsing {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.is-branch-expanding,
.is-branch-collapsing {
    z-index: 1;
    animation: hold-level $branch-duration linear both;

    .choice-item {
        transition: none;
    }
}

.is-branch-expanding {
    .choice-item.is-selected {
        animation: expand-selected $branch-duration cubic-bezier(0.2, 0.75, 0.2, 1) both;
    }

    .choice-item.is-sibling {
        animation: contract-sibling $branch-duration cubic-bezier(0.2, 0.75, 0.2, 1) both;
    }
}

.is-branch-expanded {
    z-index: 1;

    .choice-item {
        transition: none;
    }

    .choice-item.is-selected {
        flex-grow: 1;
        opacity: 1;
        filter: brightness(1);
        transform: skewX(0deg);
    }

    .choice-item.is-sibling {
        min-width: 0;
        flex-grow: 0;
        opacity: 0;
    }
}

.is-child-entering {
    z-index: 2;
    animation: child-enter-from-right $swipe-duration cubic-bezier(0.2, 0.75, 0.2, 1) both;
}

.is-child-exiting {
    z-index: 2;
    animation: child-exit-to-right $swipe-duration cubic-bezier(0.4, 0, 0.8, 0.25) both;
}

.is-branch-collapsing {
    .choice-item.is-selected {
        animation: collapse-selected $branch-duration cubic-bezier(0.2, 0.75, 0.2, 1) both;
    }

    .choice-item.is-sibling {
        animation: restore-sibling $branch-duration cubic-bezier(0.2, 0.75, 0.2, 1) both;
    }
}

@keyframes hold-level {
    from,
    to {
        visibility: visible;
    }
}

@keyframes expand-selected {
    from {
        flex-grow: 1;
        filter: brightness(0.85);
        transform: skewX(-5deg);
    }
    to {
        flex-grow: 1;
        filter: brightness(1);
        transform: skewX(0deg);
    }
}

@keyframes contract-sibling {
    from {
        min-width: 0;
        flex-grow: 1;
        opacity: 1;
    }
    to {
        min-width: 0;
        flex-grow: 0;
        opacity: 0;
    }
}

@keyframes child-enter-from-right {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

@keyframes child-exit-to-right {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(100%);
    }
}

@keyframes collapse-selected {
    from {
        flex-grow: 1;
        filter: brightness(1);
        transform: skewX(0deg);
    }
    to {
        flex-grow: 1;
        filter: brightness(0.85);
        transform: skewX(-5deg);
    }
}

@keyframes restore-sibling {
    from {
        min-width: 0;
        flex-grow: 0;
        opacity: 0;
    }
    to {
        min-width: 0;
        flex-grow: 1;
        opacity: 1;
    }
}
</style>
