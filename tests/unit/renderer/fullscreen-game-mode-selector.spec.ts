// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { GameModeID } from "@main/game/battle/battle-types";
import FullscreenGameModeSelector from "@renderer/components/battle/FullscreenGameModeSelector.vue";
import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const battleStore = vi.hoisted(() => ({
    isLobbyOpened: false,
    isSelectingGameMode: true,
}));

const createBeginnerSkirmish = vi.hoisted(() => vi.fn());
const loadGameMode = vi.hoisted(() => vi.fn());
const resetToDefaultBattle = vi.hoisted(() => vi.fn());

vi.mock("@renderer/store/battle.store", () => ({
    battleStore,
    battleActions: { createBeginnerSkirmish, loadGameMode, resetToDefaultBattle },
}));

describe("FullscreenGameModeSelector", () => {
    beforeEach(() => {
        battleStore.isLobbyOpened = false;
        battleStore.isSelectingGameMode = true;
        createBeginnerSkirmish.mockReset();
        createBeginnerSkirmish.mockResolvedValue({ ok: true });
        loadGameMode.mockReset();
        loadGameMode.mockResolvedValue(undefined);
        resetToDefaultBattle.mockReset();
    });

    it("opens with quick-start and custom choices", () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        expect(wrapper.get('[data-testid="quick-start"]').attributes("disabled")).toBeUndefined();
        expect(wrapper.get('[data-testid="quick-start-art"]').attributes("style")).toContain("quick-start.png");
        expect(wrapper.findAll('[data-testid="custom-skirmish"]')).toHaveLength(1);
        expect(wrapper.get('[data-testid="custom-skirmish-art"]').attributes("style")).toContain("custom-skirmish.png");
        expect(wrapper.find('[data-testid="choice-classic"]').exists()).toBe(false);
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

        expect(wrapper.get('[data-testid="choice-panel-error"]').text()).toContain("No eligible 3v3 maps are available.");
        expect(battleStore.isSelectingGameMode).toBe(true);
        await wrapper.get('[data-testid="choice-panel-retry"]').trigger("click");
        expect(createBeginnerSkirmish).toHaveBeenCalledTimes(2);
    });

    it("dismisses without opening the battle room", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.trigger("click");

        expect(battleStore.isSelectingGameMode).toBe(false);
        expect(battleStore.isLobbyOpened).toBe(false);
        expect(wrapper.emitted("closed")).toBeUndefined();
    });

    it("resets the Quick Start preset before showing custom modes", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="custom-skirmish"]').trigger("click");

        expect(resetToDefaultBattle).toHaveBeenCalledTimes(1);
        expect(wrapper.find('[data-testid="choice-classic"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="choice-raptors"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="choice-scavengers"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="choice-ffa"]').exists()).toBe(true);
    });

    it("loads the selected custom mode before opening the battle room", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="custom-skirmish"]').trigger("click");
        await wrapper.get('[data-testid="choice-classic"]').trigger("click");

        expect(loadGameMode).toHaveBeenCalledWith(GameModeID.CLASSIC);
        expect(battleStore.isSelectingGameMode).toBe(false);
        expect(battleStore.isLobbyOpened).toBe(true);
    });

    it("returns from custom modes to the entry choices", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="custom-skirmish"]').trigger("click");
        await wrapper.get('[data-testid="choice-panel-back"]').trigger("click");

        expect(wrapper.findAll('[data-testid="custom-skirmish"]')).toHaveLength(1);
        expect(wrapper.find('[data-testid="choice-classic"]').exists()).toBe(false);
    });

    it("resets to the entry choices after the overlay closes", async () => {
        const wrapper = mount(FullscreenGameModeSelector, { props: { visible: true } });

        await wrapper.get('[data-testid="custom-skirmish"]').trigger("click");
        await wrapper.setProps({ visible: false });
        await wrapper.setProps({ visible: true });

        expect(wrapper.findAll('[data-testid="custom-skirmish"]')).toHaveLength(1);
        expect(wrapper.find('[data-testid="choice-classic"]').exists()).toBe(false);
    });
});
