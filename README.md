# React App to record, transcribe, save, and summarize spoken words

The React and [Expo React Native](https://github.com/VincentLu91/Expo-RN-record-transcribe) versions of the NLP project are more web development focused, but again it demonstrates my ability to build an AI software as a form of feasibility study. I used AssemblyAI's APIs to capture audio via microphone. The audio input is then passed through a web socket to be processed as written transcription which is then printed on the UI. The transcriptions are stored in the Firestore backend so they could be retrieved later for viewing. I later deployed two models for translating and summarizing the transcriptions.

YouTube: https://youtu.be/n5TJhp8XACM

Keys, tokens, and API endpoints are removed from the codebase to prevent from being exposed. Also the endpoints rely on rented cloud GPU to be called and I turned them off to avoid overspending.

This is the React.js version of the project. The Expo React Native version of the project is found in
https://github.com/VincentLu91/Expo-RN-record-transcribe
