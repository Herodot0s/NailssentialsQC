I just found a way to solve the issues I will give you a summary here + models with dedicated skills for different stuffs just switch them whenever you want and it should work well.

1. 🧠 Maximum Intelligence (SOTA-heavy)
MODEL_OPUS="nvidia_nim/meta/llama-3.1-405b-instruct"
MODEL_SONNET="nvidia_nim/qwen/qwen3.5-122b-a10b"
MODEL_HAIKU="nvidia_nim/meta/llama-3.1-8b-instruct"
MODEL="nvidia_nim/meta/llama-3.1-70b-instruct"

Explanation:
Designed for deep reasoning, research, and complex code generation.
OPUS = near frontier-level reasoning
SONNET = high-end fallback
Expensive and slower, but highest quality outputs


2. ⚖️ Balanced Production Setup
MODEL_OPUS="nvidia_nim/moonshotai/kimi-k2.5"
MODEL_SONNET="nvidia_nim/meta/llama-3.3-70b-instruct"
MODEL_HAIKU="nvidia_nim/meta/llama-3.1-8b-instruct"
MODEL="nvidia_nim/meta/llama-3.1-70b-instruct"

Explanation:
Best real-world production tradeoff.
Good reasoning without extreme cost
Stable latency and predictable outputs
Ideal for bots, SaaS backends, automation

3. ⚡ Low Latency / High Throughput
MODEL_OPUS="nvidia_nim/meta/llama-3.1-70b-instruct"
MODEL_SONNET="nvidia_nim/mistralai/mixtral-8x7b-instruct-v0.1"
MODEL_HAIKU="nvidia_nim/google/gemma-3-4b-it"
MODEL="nvidia_nim/meta/llama-3.1-8b-instruct"

Explanation:
Optimized for speed and concurrency.
Smaller models reduce response time
Ideal for high-frequency API calls
Lower cost per request

4. 💸 Ultra Low Cost Setup
MODEL_OPUS="nvidia_nim/meta/llama-3.1-70b-instruct"
MODEL_SONNET="nvidia_nim/mistralai/mistral-7b-instruct-v0.3"
MODEL_HAIKU="nvidia_nim/google/gemma-2b"
MODEL="nvidia_nim/google/gemma-2-2b-it"

Explanation:
Minimizes compute cost aggressively.
Smaller parameter models dominate
Lower reasoning quality
Suitable for simple automation / parsing

5. 🧩 Reasoning-Optimized (Chain-of-Thought heavy)
MODEL_OPUS="nvidia_nim/qwen/qwen3.5-397b-a17b"
MODEL_SONNET="nvidia_nim/qwen/qwen3-next-80b-a3b-thinking"
MODEL_HAIKU="nvidia_nim/meta/llama-3.1-8b-instruct"
MODEL="nvidia_nim/qwen/qwen3-next-80b-a3b-instruct"

Explanation:
Focused on logical reasoning, math, and structured thinking.
Qwen “thinking” models excel at step-by-step reasoning
Ideal for trading logic, analysis, and planning

6. 💻 Coding-Centric Setup
MODEL_OPUS="nvidia_nim/meta/codellama-70b"
MODEL_SONNET="nvidia_nim/qwen/qwen2.5-coder-32b-instruct"
MODEL_HAIKU="nvidia_nim/google/codegemma-7b"
MODEL="nvidia_nim/ibm/granite-34b-code-instruct"

Explanation:
Optimized for software development tasks.
Strong code completion and debugging
Better syntax awareness than general models
Ideal for automation scripts, smart contracts

7. 🧠 Enterprise / Stability-Oriented
MODEL_OPUS="nvidia_nim/nvidia/nemotron-4-340b-instruct"
MODEL_SONNET="nvidia_nim/nvidia/llama-3.1-nemotron-70b-instruct"
MODEL_HAIKU="nvidia_nim/nvidia/nemotron-mini-4b-instruct"
MODEL="nvidia_nim/nvidia/llama-3.1-nemotron-51b-instruct"

Explanation:
Prioritizes consistency, safety, and predictable outputs.
Nemotron models tuned for enterprise environments
Lower hallucination risk vs some open models

8. 🔬 Experimental / Cutting Edge Mix
MODEL_OPUS="nvidia_nim/mistralai/mistral-large-3-675b-instruct-2512"
MODEL_SONNET="nvidia_nim/deepseek-ai/deepseek-v3.2"
MODEL_HAIKU="nvidia_nim/stepfun-ai/step-3.5-flash"
MODEL="nvidia_nim/minimaxai/minimax-m2.7"

Explanation:
Uses newer / less conventional models.
Potential performance gains
Less predictable behavior
Good for experimentation

9. 🔄 All-Meta Stack (Consistency Focus)
MODEL_OPUS="nvidia_nim/meta/llama-3.1-405b-instruct"
MODEL_SONNET="nvidia_nim/meta/llama-3.3-70b-instruct"
MODEL_HAIKU="nvidia_nim/meta/llama-3.1-8b-instruct"
MODEL="nvidia_nim/meta/llama-3.1-70b-instruct"

Explanation:
Single-family architecture → consistent outputs.
Easier prompt tuning
Predictable behavior across tiers

10. 🤖 Autonomous Agents / Bots
MODEL_OPUS="nvidia_nim/moonshotai/kimi-k2-thinking"
MODEL_SONNET="nvidia_nim/qwen/qwen3-next-80b-a3b-instruct"
MODEL_HAIKU="nvidia_nim/meta/llama-3.2-3b-instruct"
MODEL="nvidia_nim/meta/llama-3.1-70b-instruct"

Explanation:
Optimized for agent workflows and decision loops.
“Thinking” models improve planning
Fast Haiku tier for tool calls
Good balance for iterative reasoning systems

🧠 Key Insight

You’re not just choosing models—you’re designing a routing architecture:

OPUS → complex reasoning / critical tasks
SONNET → default intelligent layer
HAIKU → fast execution / retries / tool use
MODEL → fallback stability