export interface LocalizedValidityState {
  valueMissing?: boolean;
  typeMismatch?: boolean;
  patternMismatch?: boolean;
  tooShort?: boolean;
  tooLong?: boolean;
  rangeUnderflow?: boolean;
  rangeOverflow?: boolean;
  badInput?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  min?: string;
  max?: string;
}

export function getLocalizedValidationMessage(validity: LocalizedValidityState, label?: string): string;
export function installLocalizedFormValidation(documentRef: Document): () => void;
