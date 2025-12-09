import edge_tts
import asyncio
import logging
import os
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class TTSEngine:
    def __init__(self):
        # OpenAI Setup
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.use_openai = bool(self.openai_api_key)
        
        if self.use_openai:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.openai_api_key)
                logger.info("✅ OpenAI TTS Enabled")
            except Exception as e:
                logger.warning(f"⚠️ OpenAI Init Failed: {e}. Falling back to Edge TTS.")
                self.use_openai = False

        # Edge TTS Mapping (Fallback / Default)
        self.voices = {
            'en': 'en-US-ChristopherNeural', # Clear, authoritative
            'hi': 'hi-IN-MadhurNeural',      # Natural Hindi
            'kn': 'kn-IN-GaganNeural',       # Kannada
            'ta': 'ta-IN-ValluvarNeural',    # Tamil
            'te': 'te-IN-MohanNeural'        # Telugu
        }
        self.default_voice = 'en-US-ChristopherNeural'

    async def generate_audio(self, text, lang='en', urgency=0.0):
        """
        Generate TTS audio.
        Prioritizes OpenAI if available, else uses Edge TTS.
        Returns base64 encoded audio string.
        """
        if self.use_openai:
            return await self._generate_openai(text, lang, urgency)
        else:
            return await self._generate_edge(text, lang, urgency)

    async def _generate_openai(self, text, lang, urgency):
        try:
            # OpenAI Voice Selection based on Urgency/Context
            # 'onyx': Authoritative, Deep (Good for Police/High Urgency)
            # 'shimmer': Soothing, Clear (Good for Medical/Comfort)
            # 'alloy': Neutral, Versatile
            
            voice = "alloy"
            if urgency > 0.7:
                voice = "onyx" # Authoritative
            elif urgency > 0.4:
                voice = "shimmer" # Reassuring
            
            # Speed: 1.0 is normal. Max 4.0.
            # Increase speed slightly for urgency
            speed = 1.0
            if urgency > 0.7:
                speed = 1.15
            elif urgency > 0.4:
                speed = 1.05

            response = self.client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=text,
                speed=speed,
                response_format="mp3"
            )
            
            # Get binary data directly
            audio_data = response.content
            return base64.b64encode(audio_data).decode('utf-8')

        except Exception as e:
            logger.error(f"OpenAI TTS failed: {e}. Falling back to Edge TTS.")
            return await self._generate_edge(text, lang, urgency)

    async def _generate_edge(self, text, lang, urgency):
        voice = self.voices.get(lang, self.default_voice)
        
        # Adjust prosody based on urgency
        rate = "+0%"
        pitch = "+0Hz"
        
        if urgency > 0.7:
            rate = "+15%"
            pitch = "+2Hz"
        elif urgency > 0.4:
            rate = "+5%"
        
        try:
            communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
            
            temp_file = f"temp_tts_{os.urandom(4).hex()}.mp3"
            await communicate.save(temp_file)
            
            with open(temp_file, "rb") as f:
                audio_data = f.read()
                
            if os.path.exists(temp_file):
                os.remove(temp_file)
                
            return base64.b64encode(audio_data).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Edge TTS Generation failed: {e}")
            return None

    def generate_sync(self, text, lang='en', urgency=0.0):
        """
        Synchronous wrapper for generate_audio
        """
        return asyncio.run(self.generate_audio(text, lang, urgency))
