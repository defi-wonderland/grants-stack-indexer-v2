import { Hex } from "viem";

import { ChainId, StrategyEvent } from "@grants-stack-indexer/shared";

import { IStrategyHandler, ProcessorDependencies, UnsupportedStrategy } from "../internal.js";
import { DVMDDirectTransferHandler } from "./donationVotingMerkleDistributionDirectTransfer/dvmdDirectTransfer.handler.js";

export class StrategyHandlerFactory {
    static createHandler(
        chainId: ChainId,
        dependencies: ProcessorDependencies,
        strategyId: Hex,
    ): IStrategyHandler<StrategyEvent> {
        const _strategyId = strategyId.toLowerCase();

        switch (_strategyId) {
            case "0x6f9291df02b2664139cec5703c124e4ebce32879c74b6297faa1468aa5ff9ebf":
            // DonationVotingMerkleDistributionDirectTransferStrategyv1.1
            case "0x2f46bf157821dc41daa51479e94783bb0c8699eac63bf75ec450508ab03867ce":
            // DonationVotingMerkleDistributionDirectTransferStrategyv2.0
            case "0x2f0250d534b2d59b8b5cfa5eb0d0848a59ccbf5de2eaf72d2ba4bfe73dce7c6b":
            // DonationVotingMerkleDistributionDirectTransferStrategyv2.1
            case "0x9fa6890423649187b1f0e8bf4265f0305ce99523c3d11aa36b35a54617bb0ec0":
                return new DVMDDirectTransferHandler(chainId, dependencies);

            default:
                throw new UnsupportedStrategy(strategyId);
        }
    }
}
