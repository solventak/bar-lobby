// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

export type ChoiceActionResult = { ok: true } | { ok: false; message: string };

interface ChoicePanelAppearance {
    id: string;
    title: string;
    artwork?: string;
    artworkTestId?: string;
    testId?: string;
    eyebrow?: string;
    description?: string;
    summary?: string;
    actionLabel?: string;
    emphasis?: "recommended" | "normal";
}

export interface ChoicePanelBranch extends ChoicePanelAppearance {
    type: "branch";
    children: ChoicePanelItem[];
    beforeEnter?: () => void | Promise<void>;
}

export interface ChoicePanelAction extends ChoicePanelAppearance {
    type: "action";
    run: () => ChoiceActionResult | Promise<ChoiceActionResult>;
}

export type ChoicePanelItem = ChoicePanelBranch | ChoicePanelAction;
