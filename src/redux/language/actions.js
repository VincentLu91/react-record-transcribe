import { LanguageTypes } from "./types"

// Action
export const printTranscription = (transcriptionText) => ({
    type: LanguageTypes.PRINT_TRANSCRIPTION,
    payload: transcriptionText,
})

