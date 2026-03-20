export type ProgressRecordListItemDto = {
  id: string;
  studentId: string;
  studentName: string;
  recordedAt: Date;
  weight: number | null;
  bodyFat: number | null;
  notes: string | null;
};

export type ProgressRecordFormValuesDto = {
  studentId: string;
  recordedAt: string;
  weight?: number;
  bodyFat?: number;
  notes: string;
};
