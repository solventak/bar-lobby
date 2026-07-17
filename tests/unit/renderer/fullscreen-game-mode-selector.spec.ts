// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FullscreenGameModeSelector from "@renderer/components/battle/FullscreenGameModeSelector.vue";

const battleStore = vi.hoisted(() => ({
    isLobbyOpened: false,
    isSelectingGameMode: true,
}));

const createBeginnerSkirmish = vi.hoisted(() => vi.fn());
const resetToDefaultBattle = vi.hoisted(() => vi.fn());

vi.mock("@renderer/store/battle.store", () => ({ battleStore, battleActions: { createBeginnerSkirmish, resetToDefaultBattle } }));

vi.mock("@renderer/components/misc/GameModeSelector.vue", () => ({
    default: {
        name: "GameModeSelector",
        emits: ["selected"],
        template: '<div data-testid="game-mode-selector"><button data-testid="select-mode" @click="$emit(\'selected\')">Classic</button></div>',
    },
}));

describe("FullscreenGameModeSelector", () => {
    beforeEach(() => {
        battleStore.isLobbyOpened = false;
        battleStore.isSelectingGameMode = true;
        createBeginnerSkirmish.mockReset();
        createBeginnerSkirmish.mockResolvedValue({ ok: true });
        resetToDefaultBattle.mockReset();
    });

    it("opens with quick-start and custom choices", () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        expect(wrapper.get('[data-testid="quick-start"]').attributes("disabled")).toBeUndefined();
        expect(wrapper.get('[data-testid="quick-start-art"]').attributes("style")).toContain("quick-start.png");
        expect(wrapper.findAll('[data-testid="custom-skirmish"]')).toHaveLength(1);
        expect(wrapper.get('[data-testid="custom-skirmish-art"]').attributes("style")).toContain("custom-skirmish.png");
        expect(wrapper.find('[data-testid="game-mode-selector"]').exists()).toBe(false);
    });

    it("opens Quick Start only after the complete preset succeeds", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="quick-start"]').trigger("click");

        expect(createBeginnerSkirmish).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted("closed")).toHaveLength(1);
        expect(battleStore.isSelectingGameMode).toBe(false);
        expect(battleStore.isLobbyOpened).toBe(true);
    });

    it("keeps Quick Start open with a retry action when preparation fails", async () => {
        createBeginnerSkirmish.mockResolvedValueOnce({ ok: false, message: "No eligible 3v3 maps are available." });
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="quick-start"]').trigger("click");

        expect(wrapper.get('[data-testid="quick-start-error"]').text()).toContain("No eligible 3v3 maps are available.");
        expect(wrapper.get(".gamemode-container").classes()).toContain("is-quick-start-open");
        expect(wrapper.get(".entry-select").classes()).toContain("is-quick-start-expanded");
        expect(battleStore.isSelectingGameMode).toBe(true);
        await wrapper.get('[data-testid="retry-quick-start"]').trigger("click");
        expect(createBeginnerSkirmish).toHaveBeenCalledTimes(2);
    });

    it("dismisses without opening the battle room", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.trigger("click");

        expect(battleStore.isSelectingGameMode).toBe(false);
        expect(battleStore.isLobbyOpened).toBe(false);
        expect(wrapper.emitted("closed")).toBeUndefined();
    });

    it("resets the Quick Start preset before configuring a custom skirmish", async () => {
        vi.useFakeTimers();
        try {
            const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

            await wrapper.get('[data-testid="custom-skirmish"]').trigger("click");

            expect(resetToDefaultBattle).toHaveBeenCalledTimes(1);
            expect(wrapper.get(".gamemode-container").classes()).toContain("is-custom-expanding");
            expect(wrapper.get(".entry-select").classes()).toContain("is-custom-expanded");
            expect(wrapper.findAll('[data-testid="game-mode-selector"]')).toHaveLength(1);

            await vi.advanceTimersByTimeAsync(300);
            expect(wrapper.get(".gamemode-container").classes()).toContain("is-custom-open");
        } finally {
            vi.useRealTimers();
        }
    });

    it("drills into custom modes and returns to the entry choices", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="custom-skirmish"]').trigger("click");
        expect(wrapper.findAll('[data-testid="game-mode-selector"]')).toHaveLength(1);
        expect(battleStore.isSelectingGameMode).toBe(true);

        await wrapper.get('[data-testid="back-to-skirmish-entry"]').trigger("click");
        expect(wrapper.findAll('[data-testid="custom-skirmish"]')).toHaveLength(1);
    });

    it("resets to the entry choices after the overlay closes", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="custom-skirmish"]').trigger("click");
        await wrapper.setProps({ visible: false });
        await wrapper.setProps({ visible: true });

        expect(wrapper.findAll('[data-testid="custom-skirmish"]')).toHaveLength(1);
        expect(wrapper.find('[data-testid="game-mode-selector"]').exists()).toBe(false);
    });
});
