// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import NestedChoicePanel from "@renderer/components/misc/NestedChoicePanel.vue";
import type { ChoicePanelItem } from "@renderer/components/misc/nested-choice-panel.types";

function action(id: string, run = vi.fn().mockResolvedValue({ ok: true })): ChoicePanelItem {
    return { type: "action", id, title: id, actionLabel: `Select ${id}`, run };
}

describe("NestedChoicePanel", () => {
    it("navigates branches at arbitrary depth and returns one level at a time", async () => {
        const beforeEnter = vi.fn();
        const choices: ChoicePanelItem[] = [
            action("root-action"),
            {
                type: "branch",
                id: "first-branch",
                title: "First branch",
                beforeEnter,
                children: [
                    action("first-leaf"),
                    {
                        type: "branch",
                        id: "second-branch",
                        title: "Second branch",
                        children: [action("deep-leaf")],
                    },
                ],
            },
        ];
        const wrapper = mount(NestedChoicePanel, { props: { choices, backLabel: "Back" } });

        await wrapper.get('[data-testid="choice-first-branch"]').trigger("click");
        expect(beforeEnter).toHaveBeenCalledTimes(1);
        expect(wrapper.find('[data-testid="choice-root-action"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="choice-second-branch"]').exists()).toBe(true);

        await wrapper.get('[data-testid="choice-second-branch"]').trigger("click");
        expect(wrapper.find('[data-testid="choice-deep-leaf"]').exists()).toBe(true);

        await wrapper.get('[data-testid="choice-panel-back"]').trigger("click");
        expect(wrapper.find('[data-testid="choice-second-branch"]').exists()).toBe(true);
        await wrapper.get('[data-testid="choice-panel-back"]').trigger("click");
        expect(wrapper.find('[data-testid="choice-first-branch"]').exists()).toBe(true);
    });

    it("resets nested navigation to the root", async () => {
        const choices: ChoicePanelItem[] = [
            {
                type: "branch",
                id: "branch",
                title: "Branch",
                children: [action("leaf")],
            },
        ];
        const wrapper = mount(NestedChoicePanel, { props: { choices, backLabel: "Back", resetKey: 0 } });

        await wrapper.get('[data-testid="choice-branch"]').trigger("click");
        expect(wrapper.find('[data-testid="choice-leaf"]').exists()).toBe(true);
        await wrapper.setProps({ resetKey: 1 });

        expect(wrapper.find('[data-testid="choice-branch"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="choice-leaf"]').exists()).toBe(false);
    });

    it("keeps an action pending until it completes", async () => {
        let resolve!: (result: { ok: true }) => void;
        const run = vi.fn(() => new Promise<{ ok: true }>((done) => (resolve = done)));
        const wrapper = mount(NestedChoicePanel, {
            props: { choices: [action("launch", run)], backLabel: "Back", pendingLabel: "Preparing" },
        });

        await wrapper.get('[data-testid="choice-launch"]').trigger("click");
        expect(wrapper.get('[data-testid="choice-panel-pending"]').text()).toContain("Preparing");
        expect(wrapper.emitted("completed")).toBeUndefined();

        resolve({ ok: true });
        await nextTick();
        await nextTick();
        expect(wrapper.emitted("completed")).toEqual([["launch"]]);
    });

    it("shows action failures and retries the same action", async () => {
        const run = vi.fn().mockResolvedValueOnce({ ok: false, message: "Unavailable" }).mockResolvedValueOnce({ ok: true });
        const wrapper = mount(NestedChoicePanel, {
            props: {
                choices: [action("launch", run)],
                backLabel: "Back",
                pendingLabel: "Preparing",
                failureLabel: "Could not prepare",
                retryLabel: "Retry",
            },
        });

        await wrapper.get('[data-testid="choice-launch"]').trigger("click");
        expect(wrapper.get('[data-testid="choice-panel-error"]').text()).toContain("Unavailable");
        expect(wrapper.emitted("completed")).toBeUndefined();

        await wrapper.get('[data-testid="choice-panel-retry"]').trigger("click");
        expect(run).toHaveBeenCalledTimes(2);
        expect(wrapper.emitted("completed")).toEqual([["launch"]]);
    });
});
