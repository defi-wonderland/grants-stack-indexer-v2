import { Changeset } from "@grants-stack-indexer/repository";

export type ChangesetHandler<T extends Changeset["type"]> = (
    changeset: Extract<Changeset, { type: T }>,
) => Promise<void>;

export type ChangesetHandlers = {
    [K in Changeset["type"]]: ChangesetHandler<K>;
};
