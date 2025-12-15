# Setup Guide

## OpenRouter Integration

We have switched from Google Gemini to OpenRouter to access free LLM models.

### Configuration

1.  Ensure you have your OpenRouter API Key.
2.  Add it to your `.env.local` file:

```env
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Model Used

We are currently using the **Meta Llama 3.3 70B Instruct (Free)** model.

-   **Model ID**: `meta-llama/llama-3.3-70b-instruct:free`
-   **Provider**: OpenRouter (various providers)
-   **Cost**: Free

### Switching Models

To switch models, update the `NEXT_PUBLIC_OPENROUTER_MODEL` variable in your `.env.local` file.

```env
NEXT_PUBLIC_OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```
