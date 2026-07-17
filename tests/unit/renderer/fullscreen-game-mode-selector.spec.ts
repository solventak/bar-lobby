// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FullscreenGameModeSelector from "@renderer/components/battle/FullscreenGameModeSelector.vue";

const battleStore = vi.hoisted(() => ({
    isSelectingGameMode: true,
}));

const createBeginnerSkirmish = vi.hoisted(() => vi.fn());

vi.mock("@renderer/store/battle.store", () => ({ battleStore, battleActions: { createBeginnerSkirmish } }));

vi.mock("@renderer/components/misc/GameModeSelector.vue", () => ({
    default: {
        name: "GameModeSelector",
        emits: ["selected"],
        template: '<div data-testid="game-mode-selector"><button data-testid="select-mode" @click="$emit(\'selected\')">Classic</button></div>',
    },
}));

describe("FullscreenGameModeSelector", () => {
    beforeEach(() => {
        battleStore.isSelectingGameMode = true;
        createBeginnerSkirmish.mockReset();
        createBeginnerSkirmish.mockResolvedValue({ ok: true });
    });

    it("opens with quick-start and custom choices", () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        expect(wrapper.get('[data-testid="quick-start"]').attributes("disabled")).toBeUndefined();
        expect(wrapper.findAll('[data-testid="custom-skirmish"]')).toHaveLength(1);
        expect(wrapper.find('[data-testid="game-mode-selector"]').exists()).toBe(false);
    });

    it("opens Quick Start only after the complete preset succeeds", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="quick-start"]').trigger("click");

        expect(createBeginnerSkirmish).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted("closed")).toHaveLength(1);
        expect(battleStore.isSelectingGameMode).toBe(false);
    });

    it("keeps Quick Start open with a retry action when preparation fails", async () => {
        createBeginnerSkirmish.mockResolvedValueOnce({ ok: false, message: "No eligible 3v3 maps are available." });
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="quick-start"]').trigger("click");

        expect(wrapper.get('[data-testid="quick-start-error"]').text()).toContain("No eligible 3v3 maps are available.");
        expect(battleStore.isSelectingGameMode).toBe(true);
        await wrapper.get('[data-testid="retry-quick-start"]').trigger("click");
        expect(createBeginnerSkirmish).toHaveBeenCalledTimes(2);
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

    it("preserves the existing mode-selection completion event", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="custom-skirmish"]').trigger("click");
        await wrapper.get('[data-testid="select-mode"]').trigger("click");

        expect(wrapper.emitted("closed")).toHaveLength(1);
        expect(battleStore.isSelectingGameMode).toBe(false);
    });
});
