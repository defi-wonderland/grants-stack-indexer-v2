export const isValidCid = (cid: string): boolean => {
    const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[0-9A-Za-z]{50,})$/;
    return cidRegex.test(cid);
};
