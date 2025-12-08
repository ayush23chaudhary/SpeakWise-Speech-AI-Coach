#!/usr/bin/env python3
"""
Whisper Local Transcription Script
Uses OpenAI's open-source Whisper model for speech recognition
"""

import sys
import json
import whisper
import warnings
import os

# Suppress warnings
warnings.filterwarnings("ignore")

def transcribe_audio(audio_path, model_name="base", language="en"):
    """
    Transcribe audio file using local Whisper model
    
    Args:
        audio_path: Path to audio file
        model_name: Whisper model size (tiny, base, small, medium, large, turbo)
        language: Language code (en, es, fr, etc.)
    
    Returns:
        JSON string with transcription results
    """
    try:
        # Load model (downloads on first use, cached after)
        print(f"Loading Whisper model: {model_name}...", file=sys.stderr)
        model = whisper.load_model(model_name)
        
        # Transcribe with word-level timestamps
        print(f"Transcribing audio: {audio_path}...", file=sys.stderr)
        result = model.transcribe(
            audio_path,
            language=language,
            word_timestamps=True,  # Enable word-level timestamps
            verbose=False
        )
        
        # Extract word-level timing information
        words = []
        if 'segments' in result:
            for segment in result['segments']:
                if 'words' in segment:
                    for word_info in segment['words']:
                        words.append({
                            'word': word_info.get('word', '').strip(),
                            'start': word_info.get('start', 0),
                            'end': word_info.get('end', 0),
                            'probability': word_info.get('probability', 1.0)
                        })
        
        # Prepare output in format compatible with Node.js service
        output = {
            'success': True,
            'transcript': result['text'].strip(),
            'language': result.get('language', language),
            'duration': result.get('duration', 0),
            'words': words,
            'segments': len(result.get('segments', [])),
        }
        
        # Output as JSON
        print(json.dumps(output, ensure_ascii=False))
        return 0
        
    except FileNotFoundError:
        error = {
            'success': False,
            'error': 'Audio file not found',
            'message': f'File does not exist: {audio_path}'
        }
        print(json.dumps(error), file=sys.stderr)
        return 1
        
    except Exception as e:
        error = {
            'success': False,
            'error': str(type(e).__name__),
            'message': str(e)
        }
        print(json.dumps(error), file=sys.stderr)
        return 1

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'InvalidArguments',
            'message': 'Usage: whisper-transcribe.py <audio_file> [model_name] [language]'
        }), file=sys.stderr)
        return 1
    
    audio_path = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else os.getenv('WHISPER_MODEL', 'base')
    language = sys.argv[3] if len(sys.argv) > 3 else 'en'
    
    return transcribe_audio(audio_path, model_name, language)

if __name__ == '__main__':
    sys.exit(main())
