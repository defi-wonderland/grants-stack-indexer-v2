import { beforeEach, describe, expect, it, vi } from "vitest";

import { IApplicationRepository, NewApplication } from "@grants-stack-indexer/repository";
import { ChainId } from "@grants-stack-indexer/shared";

import { createApplicationHandlers } from "../../../src/data-loader/handlers/application.handlers.js";

describe("Application Handlers", () => {
    const mockRepository = {
        insertApplication: vi.fn(),
        updateApplication: vi.fn(),
    } as unknown as IApplicationRepository;

    const handlers = createApplicationHandlers(mockRepository);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("handle InsertApplication changeset", async () => {
        const application = { id: "1", name: "Test Application" } as unknown as NewApplication;
        await handlers.InsertApplication({
            type: "InsertApplication",
            args: application,
        });

        expect(mockRepository.insertApplication).toHaveBeenCalledWith(application);
    });

    it("handle UpdateApplication changeset", async () => {
        const update = {
            type: "UpdateApplication",
            args: {
                chainId: 1 as ChainId,
                roundId: "round1",
                applicationId: "app1",
                application: { status: "APPROVED" },
            },
        } as const;

        await handlers.UpdateApplication(update);

        expect(mockRepository.updateApplication).toHaveBeenCalledWith(
            { chainId: 1, roundId: "round1", id: "app1" },
            { status: "APPROVED" },
        );
    });
});
