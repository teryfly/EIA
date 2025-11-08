export interface AIDraftSequenceSeedData {
  id: string;
  nextNumber: bigint;
}

export const aiDraftSequenceData: AIDraftSequenceSeedData = {
  id: 'global',
  nextNumber: BigInt(1),
};