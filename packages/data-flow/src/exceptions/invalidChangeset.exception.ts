export class InvalidChangeset extends Error {
    constructor(invalidTypes: string[]) {
        super(`Invalid changeset types: ${invalidTypes.join(", ")}`);
    }
}
