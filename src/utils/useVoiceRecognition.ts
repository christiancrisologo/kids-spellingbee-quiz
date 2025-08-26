// import { useState, useEffect, useCallback } from 'react';

// interface VoiceRecognitionHook {
//   transcript: string;
//   startListening: () => void;
//   stopListening: () => void;
//   isListening: boolean;
//   error: string | null;
// }

// const useVoiceRecognition = (): VoiceRecognitionHook => {
//   const [transcript, setTranscript] = useState<string>('');
//   const [isListening, setIsListening] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [recognition, setRecognition] = useState(null);

//   useEffect(() => {
//     const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition) as typeof window.SpeechRecognition;
    
//     if (recognition) {
//         console.log('SpeechRecongition already initialized!');
        
//         return 

//     }
//     if (!SpeechRecognition) {
//       setError('Web Speech API is not supported in this browser');
//       return;
//     }

//     const _recognition = new SpeechRecognition();
//     _recognition.continuous = true;
//     _recognition.interimResults = true;

//     _recognition.onresult = (event: any) => {
//         const result = event.results[0][0].transcript;
//         setTranscript(result);
//     };

//     _recognition.onerror = (event: any) => {
//       setError(`Speech recognition error: ${event.error}`);
//       stopRecognition();
//     };

//     setRecognition(_recognition);
//     return () => {
//       if (recognition) {
//         recognition.stop();
//       }
//     };
//   }, []);

//   const startListening = useCallback(() => {
//     if (recognition) {
//       setError(null);
//       recognition.start();
//       setIsListening(true);
//     }
//   }, [recognition]);

//   const stopListening = useCallback(() => {
//     if (recognition) {
//       recognition.stop();
//       setIsListening(false);
//     }
//   }, [recognition]);

//   const stopRecognition = useCallback(() => {
//     if (recognition) {
//       recognition.stop();
//       setIsListening(false);
//     }
//   }, [recognition]);

//   console.log('recognition --- ', recognition);
//   return {
//     transcript,
//     startListening,
//     stopListening,
//     isListening,
//     error,
//   };
// };

// export default useVoiceRecognition;
