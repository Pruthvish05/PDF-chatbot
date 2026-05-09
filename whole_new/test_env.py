#!/usr/bin/env python3
"""
Quick test script to verify .env file and API key loading
Run this from the chatbot directory: python test_env.py
"""

import os
from dotenv import load_dotenv

print("=" * 60)
print("SigmaDoxs Environment Test")
print("=" * 60)

# Test 1: Check if .env file exists
env_path = os.path.join(os.getcwd(), '.env')
print(f"\n1. Checking .env file...")
print(f"   Working directory: {os.getcwd()}")
print(f"   .env path: {env_path}")
print(f"   File exists: {os.path.exists(env_path)}")

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        content = f.read()
        print(f"   File size: {len(content)} bytes")
        print(f"   Content: {content[:80]}...")

# Test 2: Load .env and check API key
print(f"\n2. Loading .env file...")
load_dotenv(dotenv_path=env_path)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if OPENROUTER_API_KEY:
    print(f"   ✓ API Key loaded successfully!")
    print(f"   ✓ Starts with: {OPENROUTER_API_KEY[:20]}...")
    print(f"   ✓ Length: {len(OPENROUTER_API_KEY)} characters")
    print(f"   ✓ Looks valid: {'Yes' if OPENROUTER_API_KEY.startswith('sk-or-v1-') else 'No'}")
else:
    print(f"   ✗ API Key NOT found!")
    print(f"   ✗ Make sure OPENROUTER_API_KEY is set in .env")

# Test 3: Try to import llm module
print(f"\n3. Testing llm module import...")
try:
    from llm import call_gemini_rag
    print(f"   ✓ llm module imported successfully!")
except ValueError as e:
    print(f"   ✗ Error importing llm: {e}")
except Exception as e:
    print(f"   ✗ Unexpected error: {e}")

# Test 4: Check data directories
print(f"\n4. Checking data directories...")
for dir_name in ["data/uploads", "data/index"]:
    dir_path = os.path.join(os.getcwd(), dir_name)
    exists = os.path.exists(dir_path)
    print(f"   {dir_name}: {'✓ exists' if exists else '✗ missing'}")

print("\n" + "=" * 60)
print("Test complete!")
print("=" * 60)
