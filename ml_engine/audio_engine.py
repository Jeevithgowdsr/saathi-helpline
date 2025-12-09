import os
import time
import logging
import speech_recognition as sr
from pydub import AudioSegment
import numpy as np
from better_profanity import profanity

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import faster_whisper, else set to None
try:
    from faster_whisper import WhisperModel
    HAS_WHISPER = True
except ImportError:
    HAS_WHISPER = False
    logger.warning("⚠️ faster-whisper not found. Using Google Speech Recognition as fallback.")

# Try to import noisereduce
try:
    import noisereduce as nr
    HAS_NOISEREDUCE = True
except ImportError:
    HAS_NOISEREDUCE = False
    logger.warning("⚠️ noisereduce not found. Skipping noise reduction.")

class AudioEngine:
    def __init__(self, model_size="tiny", device="cpu", compute_type="int8"):
        """
        Initialize the STT model.
        """
        self.model = None
        self.recognizer = sr.Recognizer()
        
        if HAS_WHISPER:
            logger.info(f"Loading Whisper model: {model_size} on {device}...")
            try:
                self.model = WhisperModel(model_size, device=device, compute_type=compute_type)
                logger.info("Whisper model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load Whisper model: {e}")
                self.model = None
        
        # Initialize profanity filter
        profanity.load_censor_words()

    def preprocess_audio(self, file_path):
        """
        Load audio, convert to mono/16kHz, and apply noise reduction.
        Returns a numpy array of the audio data (for Whisper) or path to processed file (for SR).
        """
        try:
            # Load audio using pydub
            audio = AudioSegment.from_file(file_path)
            
            # Convert to mono and set frame rate to 16kHz
            audio = audio.set_channels(1).set_frame_rate(16000)
            
            # Export processed audio to a temp file for SR or if we need to read samples
            processed_path = file_path.replace(".wav", "_processed.wav")
            audio.export(processed_path, format="wav")
            
            if HAS_WHISPER and self.model:
                # Convert to numpy array for Whisper
                samples = np.array(audio.get_array_of_samples())
                
                # Normalize to float32 range [-1, 1]
                if audio.sample_width == 2:
                    samples = samples.astype(np.float32) / 32768.0
                elif audio.sample_width == 4:
                    samples = samples.astype(np.float32) / 2147483648.0
                
                # Apply Noise Reduction if available
                if HAS_NOISEREDUCE:
                    samples = nr.reduce_noise(y=samples, sr=16000, prop_decrease=0.8)
                
                return samples
            
            return processed_path
            
        except Exception as e:
            logger.error(f"Error in preprocessing: {e}")
            return None

    def transcribe(self, file_path, beam_size=5):
        """
        Transcribe the audio file.
        Returns a dictionary with text, segments, and metadata.
        """
        start_time = time.time()
        
        # Preprocess
        processed_data = self.preprocess_audio(file_path)
        
        # 1. Try Whisper
        if HAS_WHISPER and self.model and isinstance(processed_data, np.ndarray):
            try:
                segments, info = self.model.transcribe(
                    processed_data, 
                    beam_size=beam_size,
                    language=None, 
                    vad_filter=True
                )

                full_text = []
                transcribed_segments = []
                
                for segment in segments:
                    clean_text = profanity.censor(segment.text)
                    full_text.append(clean_text)
                    transcribed_segments.append({
                        "start": segment.start,
                        "end": segment.end,
                        "text": clean_text,
                        "confidence": segment.avg_logprob
                    })

                final_text = " ".join(full_text).strip()
                processing_time = time.time() - start_time

                return {
                    "text": final_text,
                    "language": info.language,
                    "language_probability": info.language_probability,
                    "segments": transcribed_segments,
                    "duration": info.duration,
                    "processing_time": round(processing_time, 2)
                }
            except Exception as e:
                logger.error(f"Whisper transcription failed: {e}")
                # Fallback to SR

        # 2. Fallback to Google Speech Recognition
        try:
            # Use processed path if available, else original
            source_path = processed_data if isinstance(processed_data, str) else file_path
            
            with sr.AudioFile(source_path) as source:
                audio = self.recognizer.record(source)
            
            # Recognize
            text = self.recognizer.recognize_google(audio)
            clean_text = profanity.censor(text)
            
            processing_time = time.time() - start_time
            
            return {
                "text": clean_text,
                "language": "auto", # Google auto-detects but doesn't return lang code easily in this method
                "language_probability": 1.0,
                "segments": [],
                "duration": 0, # SR doesn't give duration
                "processing_time": round(processing_time, 2)
            }
            
        except sr.UnknownValueError:
            return {"error": "Speech not recognized"}
        except sr.RequestError as e:
            return {"error": f"API unavailable: {e}"}
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            return {"error": str(e)}

if __name__ == "__main__":
    engine = AudioEngine()
    # print(engine.transcribe("test_audio.wav"))
