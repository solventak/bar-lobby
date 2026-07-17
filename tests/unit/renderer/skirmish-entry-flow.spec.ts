// SPDX-FileCopyrightText: 2026 The BAR Lobby Authors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from "vitest";
import { initialSkirmishEntryState, transitionSkirmishEntry } from "@renderer/components/battle/skirmish-entry-flow";

describe("skirmish entry flow", () => {
    it("starts at the quick-start or custom choice", () => {
        expect(initialSkirmishEntryState).toEqual({ step: "entry" });
    });

    it("drills into custom mode selection", () => {
        expect(transitionSkirmishEntry(initialSkirmishEntryState, { type: "select-custom" })).toEqual({ step: "custom-modes" });
    });

    it("returns from custom modes to the entry choice", () => {
        expect(transitionSkirmishEntry({ step: "custom-modes" }, { type: "back" })).toEqual({ step: "entry" });
    });

    it("resets a nested flow when the overlay closes", () => {
        expect(transitionSkirmishEntry({ step: "custom-modes" }, { type: "reset" })).toEqual({ step: "entry" });
    });
});
