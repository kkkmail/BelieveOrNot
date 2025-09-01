#!/usr/bin/env python3
"""
Direct Ollama API client for code generation
Usage: python ollama_coder.py prompt_file.md
"""

import requests
import json
import sys
import os
from pathlib import Path

def call_ollama(prompt, model="qwen2.5-coder:14b"):
    """Call Ollama API with the given prompt"""
    url = "http://localhost:11434/api/generate"
    
    data = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,  # Lower temperature for more consistent code
            "top_p": 0.9,
            "num_ctx": 8192
        }
    }
    
    try:
        response = requests.post(url, json=data, timeout=10800)
        response.raise_for_status()
        result = response.json()
        return result.get('response', '')
    except requests.exceptions.RequestException as e:
        print(f"Error calling Ollama: {e}")
        return None

def extract_commands_and_files(response):
    """Extract shell commands and file contents from the response"""
    lines = response.split('\n')
    commands = []
    files = {}
    current_file = None
    current_content = []
    in_code_block = False
    code_type = None
    
    for line in lines:
        # Detect code blocks
        if line.strip().startswith('```'):
            if in_code_block:
                # End of code block
                if code_type == 'sh' or code_type == 'bash':
                    commands.extend([cmd.strip() for cmd in current_content if cmd.strip() and not cmd.strip().startswith('#')])
                elif current_file:
                    files[current_file] = '\n'.join(current_content)
                in_code_block = False
                current_file = None
                current_content = []
                code_type = None
            else:
                # Start of code block
                in_code_block = True
                parts = line.strip()[3:].split()
                if parts:
                    code_type = parts[0]
                current_content = []
        elif in_code_block:
            current_content.append(line)
        else:
            # Look for file references
            if line.strip().endswith('.cs') or line.strip().endswith('.csproj') or line.strip().endswith('.sln') or line.strip().endswith('.md'):
                potential_file = line.strip().rstrip(':')
                if '/' in potential_file or '\\' in potential_file or '.' in potential_file:
                    current_file = potential_file
    
    return commands, files

def execute_commands(commands):
    """Execute shell commands"""
    for cmd in commands:
        if cmd.strip():
            print(f"Executing: {cmd}")
            os.system(cmd)

def write_files(files):
    """Write files to disk"""
    for filepath, content in files.items():
        try:
            # Create directory if it doesn't exist
            Path(filepath).parent.mkdir(parents=True, exist_ok=True)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Created: {filepath}")
        except Exception as e:
            print(f"Error creating {filepath}: {e}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python ollama_coder.py prompt_file.md")
        sys.exit(1)
    
    prompt_file = sys.argv[1]
    
    if not os.path.exists(prompt_file):
        print(f"Prompt file not found: {prompt_file}")
        sys.exit(1)
    
    # Read the prompt
    with open(prompt_file, 'r', encoding='utf-8') as f:
        prompt = f.read()
    
    print(f"Sending prompt to Ollama...")
    
    # Enhanced prompt for better code generation
    enhanced_prompt = f"""
You are a senior software developer. Please read the following requirements and provide a complete implementation with:

1. All necessary shell commands (in ```sh code blocks)
2. Complete file contents (with proper file paths as headers)
3. Ensure all commands are executable and files are syntactically correct

Requirements:
{prompt}

Please provide shell commands first, then all file contents. Be very explicit about file paths and ensure the project structure is correct.
"""
    
    response = call_ollama(enhanced_prompt)
    
    if response:
        print(f"Response received ({len(response)} characters)")
        
        # Extract commands and files
        commands, files = extract_commands_and_files(response)
        
        if commands:
            print(f"\nFound {len(commands)} commands:")
            for cmd in commands:
                print(f"  {cmd}")
            
            proceed = input("\nExecute these commands? (y/N): ")
            if proceed.lower() == 'y':
                execute_commands(commands)
        
        if files:
            print(f"\nFound {len(files)} files:")
            for filepath in files.keys():
                print(f"  {filepath}")
            
            proceed = input("\nCreate these files? (y/N): ")
            if proceed.lower() == 'y':
                write_files(files)
        
        # Save full response for review
        with open(f"response_{os.path.basename(prompt_file)}.txt", 'w', encoding='utf-8') as f:
            f.write(response)
        print(f"\nFull response saved to: response_{os.path.basename(prompt_file)}.txt")
    
    else:
        print("Failed to get response from Ollama")

if __name__ == "__main__":
    main()
