from deep_translator import GoogleTranslator
import logging

logger = logging.getLogger(__name__)

class TranslationEngine:
    def __init__(self):
        self.supported_languages = {
            'en': 'English',
            'hi': 'Hindi',
            'kn': 'Kannada',
            'ta': 'Tamil',
            'te': 'Telugu'
        }

    def translate_to_english(self, text, source_lang='auto'):
        """
        Translates text to English.
        If source_lang is 'auto', it relies on the translator's auto-detection.
        Returns (translated_text, detected_source_lang)
        """
        if not text:
            return "", "en"

        try:
            # If source is already English, just return it
            if source_lang == 'en':
                return text, 'en'

            # Translate
            translator = GoogleTranslator(source=source_lang, target='en')
            translated_text = translator.translate(text)
            
            # deep-translator doesn't always return the detected language code easily in the simple API
            # We will assume the requested source_lang was correct, or if 'auto', we might not know the exact code
            # For the purpose of replying, if 'auto' was used, we might need to rely on the user's preferred lang
            # or try to detect it separately if needed. 
            # For now, we return source_lang as passed (or 'en' if it was effectively English)
            
            logger.info(f"Translated to EN: '{text}' -> '{translated_text}'")
            return translated_text, source_lang

        except Exception as e:
            logger.error(f"Translation to English failed: {e}")
            return text, source_lang

    def translate_from_english(self, text, target_lang):
        """
        Translates text from English to the target language.
        """
        if not text or target_lang == 'en':
            return text

        try:
            translator = GoogleTranslator(source='en', target=target_lang)
            translated_text = translator.translate(text)
            logger.info(f"Translated from EN: '{text}' -> '{translated_text}' ({target_lang})")
            return translated_text
        except Exception as e:
            logger.error(f"Translation to {target_lang} failed: {e}")
            return text
