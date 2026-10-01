<script lang="ts">
  type KnownLanguage =
    | 'typescript'
    | 'javascript'
    | 'python'
    | 'go'
    | 'java'
    | 'csharp'
    | 'rust'
    | 'php'
    | 'ruby'
    | 'kotlin'
    | 'cpp';

  type SourceLanguage = KnownLanguage | 'other';

  type KnownFramework =
    | 'vitest'
    | 'jest'
    | 'pytest'
    | 'unittest'
    | 'go-testing'
    | 'junit5'
    | 'xunit'
    | 'cargo-test'
    | 'phpunit'
    | 'rspec'
    | 'googletest'
    | 'catch2'
    | 'doctest';

  type TestFramework = KnownFramework | 'custom';

  type ApiResponse = {
    tests?: unknown;
    error?: unknown;
    model?: unknown;
  };

  const MAX_SOURCE_CHARACTERS = 20_000;

  const LANGUAGES: SourceLanguage[] = [
    'typescript',
    'javascript',
    'python',
    'go',
    'java',
    'csharp',
    'rust',
    'php',
    'ruby',
    'kotlin',
    'cpp',
    'other'
  ];

  const FRAMEWORKS: Record<KnownLanguage, readonly KnownFramework[]> = {
    typescript: ['vitest', 'jest'],
    javascript: ['vitest', 'jest'],
    python: ['pytest', 'unittest'],
    go: ['go-testing'],
    java: ['junit5'],
    csharp: ['xunit'],
    rust: ['cargo-test'],
    php: ['phpunit'],
    ruby: ['rspec'],
    kotlin: ['junit5'],
    cpp: ['googletest', 'catch2', 'doctest']
  };

  const DEFAULT_MODULE_PATH: Record<SourceLanguage, string> = {
    typescript: './module-under-test',
    javascript: './module-under-test',
    python: 'module_under_test',
    go: 'example.com/your-module/pkg',
    java: 'com.example.ModuleUnderTest',
    csharp: 'YourProject.Namespace.TypeName',
    rust: 'your_crate::module_under_test',
    php: 'App\\Pricing\\ModuleUnderTest',
    ruby: './lib/module_under_test',
    kotlin: 'com.example.ModuleUnderTest',
    cpp: 'include/module_under_test.hpp',
    other: 'module_under_test'
  };

  const LABELS: Record<KnownLanguage, string> = {
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    python: 'Python',
    go: 'Go',
    java: 'Java',
    csharp: 'C#',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    kotlin: 'Kotlin',
    cpp: 'C++'
  };

  const FRAMEWORK_LABELS: Record<KnownFramework, string> = {
    vitest: 'Vitest',
    jest: 'Jest',
    pytest: 'pytest',
    unittest: 'unittest',
    'go-testing': 'Go testing',
    junit5: 'JUnit 5',
    xunit: 'xUnit',
    'cargo-test': 'Cargo test',
    phpunit: 'PHPUnit',
    rspec: 'RSpec',
    googletest: 'GoogleTest',
    catch2: 'Catch2',
    doctest: 'doctest'
  };

  const MODULE_PATH_HINTS: Record<SourceLanguage, string> = {
    typescript: 'Use the module specifier your test file will import, such as ../lib/discount.',
    javascript: 'Use the module specifier your test file will import, such as ../lib/discount.',
    python: 'Use a dotted Python module name, such as my_package.discount.',
    go: 'Use the Go package import path, such as example.com/project/pkg/pricing.',
    java: 'Use the fully qualified class name, such as com.example.Pricing.',
    csharp: 'Use the namespace and type name, such as MyProject.Pricing.Discount.',
    rust: 'Use the Rust crate/module path, such as my_crate::pricing.',
    php: 'Use the fully qualified PHP class name, such as App\\Pricing\\DiscountCalculator.',
    ruby: 'Use the require path for the target, such as ./lib/pricing.',
    kotlin: 'Use the fully qualified class name, such as com.example.Pricing.',
    cpp: 'Use the header include path or namespace/type, such as include/pricing.hpp or myapp::Pricing.',
    other: 'Enter the module, package, type, or file path expected by your language and framework.'
  };

  const wordSet = (value: string): Set<string> =>
    new Set(value.split(/\s+/));

  const JS_KEYWORDS = wordSet(
    'abstract as asserts async await break case catch class const continue debugger declare default delete do else enum export extends finally for function get if implements import in infer instanceof interface keyof let module namespace new of override package private protected public readonly return satisfies set static super switch this throw try type typeof unique using var void while with yield'
  );

  const PYTHON_KEYWORDS = wordSet(
    'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'
  );

  const GO_KEYWORDS = wordSet(
    'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var'
  );

  const JAVA_KEYWORDS = wordSet(
    'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while'
  );

  const CSHARP_KEYWORDS = wordSet(
    'abstract as async await base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new object operator out override params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw try typeof uint ulong unchecked unsafe ushort using var virtual void volatile while'
  );

  const RUST_KEYWORDS = wordSet(
    'as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait type unsafe use where while'
  );

  const PHP_KEYWORDS = wordSet(
    'abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty endfor endforeach endif endswitch endwhile enum extends final finally fn for foreach function global if implements include include_once instanceof interface isset list match namespace new or print private protected public readonly require require_once return self static switch throw trait try unset use var while yield'
  );

  const RUBY_KEYWORDS = wordSet(
    'alias and begin break case class def defined do else elsif end ensure for if in module next not or redo rescue retry return self super then undef unless until when while yield'
  );

  const KOTLIN_KEYWORDS = wordSet(
    'as break class continue data do else enum false for fun if import in interface is object package private protected public return sealed super this throw try typealias val var when while'
  );

  const CPP_KEYWORDS = wordSet(
    'alignas alignof and asm auto bitand bitor bool break case catch char class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not not_eq nullptr operator or private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor'
  );

  const KEYWORDS: Record<KnownLanguage, Set<string>> = {
    typescript: JS_KEYWORDS,
    javascript: JS_KEYWORDS,
    python: PYTHON_KEYWORDS,
    go: GO_KEYWORDS,
    java: JAVA_KEYWORDS,
    csharp: CSHARP_KEYWORDS,
    rust: RUST_KEYWORDS,
    php: PHP_KEYWORDS,
    ruby: RUBY_KEYWORDS,
    kotlin: KOTLIN_KEYWORDS,
    cpp: CPP_KEYWORDS
  };

  const JS_LITERALS = wordSet('false Infinity NaN null true undefined');
  const PYTHON_LITERALS = wordSet('Ellipsis False None NotImplemented True');
  const GO_LITERALS = wordSet('false iota nil true');
  const JAVA_LITERALS = wordSet('false null true');
  const CSHARP_LITERALS = wordSet('false null true');
  const RUST_LITERALS = wordSet('false None Some true');
  const PHP_LITERALS = wordSet('false null true');
  const RUBY_LITERALS = wordSet('false nil true');
  const KOTLIN_LITERALS = wordSet('false null true');
  const CPP_LITERALS = wordSet('false NULL nullptr true');

  const LITERALS: Record<KnownLanguage, Set<string>> = {
    typescript: JS_LITERALS,
    javascript: JS_LITERALS,
    python: PYTHON_LITERALS,
    go: GO_LITERALS,
    java: JAVA_LITERALS,
    csharp: CSHARP_LITERALS,
    rust: RUST_LITERALS,
    php: PHP_LITERALS,
    ruby: RUBY_LITERALS,
    kotlin: KOTLIN_LITERALS,
    cpp: CPP_LITERALS
  };

  let sourceCode = $state('');
  let sourceLanguage = $state<SourceLanguage>('typescript');
  let framework = $state<TestFramework>('vitest');
  let customLanguage = $state('');
  let customFramework = $state('');
  let modulePath = $state(DEFAULT_MODULE_PATH.typescript);

  let generatedTests = $state('');
  let isGenerating = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');
  let copied = $state(false);

  let highlightedTests = $derived(
    generatedTests ? highlightCode(generatedTests, sourceLanguage) : ''
  );

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightCode(source: string, language: SourceLanguage): string {
    const pattern =
      language === 'python' || language === 'ruby'
        ? /#[^\r\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|[A-Za-z_$][A-Za-z0-9_$]*/g
        : /\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)n?\b|[A-Za-z_$][A-Za-z0-9_$]*/g;

    const knownLanguage: KnownLanguage =
      language === 'other' ? 'javascript' : language;

    let html = '';
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(source)) !== null) {
      const token = match[0];
      const start = match.index;

      html += escapeHtml(source.slice(cursor, start));

      let kind = 'identifier';

      if (
        ((language === 'python' || language === 'ruby') &&
          token.startsWith('#')) ||
        (language !== 'python' &&
          language !== 'ruby' &&
          (token.startsWith('//') || token.startsWith('/*')))
      ) {
        kind = 'comment';
      } else if (
        token.startsWith('"') ||
        token.startsWith("'") ||
        token.startsWith('`')
      ) {
        kind = 'string';
      } else if (/^\d/.test(token)) {
        kind = 'number';
      } else if (KEYWORDS[knownLanguage].has(token)) {
        kind = 'keyword';
      } else if (LITERALS[knownLanguage].has(token)) {
        kind = 'literal';
      } else {
        let next = start + token.length;

        while (next < source.length && /\s/.test(source[next])) {
          next += 1;
        }

        if (source[next] === '(') {
          kind = 'function';
        } else if (/^[A-Z]/.test(token)) {
          kind = 'type';
        }
      }

      html += `<span class="syntax-${kind}">${escapeHtml(token)}</span>`;
      cursor = start + token.length;
    }

    return html + escapeHtml(source.slice(cursor));
  }

  function languageLabel(language: SourceLanguage): string {
    if (language === 'other') {
      return customLanguage.trim() || 'Other language';
    }

    return LABELS[language];
  }

  function frameworkLabel(value: TestFramework): string {
    if (value === 'custom') {
      return customFramework.trim() || 'Custom framework';
    }

    return FRAMEWORK_LABELS[value];
  }

  function frameworkOptions(language: SourceLanguage): readonly TestFramework[] {
    if (language === 'other') return ['custom'];
    return [...FRAMEWORKS[language], 'custom'];
  }

  function handleLanguageChange(event: Event): void {
    const selected = (event.currentTarget as HTMLSelectElement).value;
    const language = LANGUAGES.find((item) => item === selected);

    if (!language) return;

    if (modulePath === DEFAULT_MODULE_PATH[sourceLanguage]) {
      modulePath = DEFAULT_MODULE_PATH[language];
    }

    sourceLanguage = language;

    if (language === 'other') {
      framework = 'custom';
    } else if (
      framework === 'custom' ||
      !FRAMEWORKS[language].includes(framework as KnownFramework)
    ) {
      framework = FRAMEWORKS[language][0];
    }

    errorMessage = '';
    successMessage = '';
  }

  function handleFrameworkChange(event: Event): void {
    const selected = (event.currentTarget as HTMLSelectElement).value;

    if (selected === 'custom') {
      framework = 'custom';
    } else if (
      sourceLanguage !== 'other' &&
      FRAMEWORKS[sourceLanguage].includes(selected as KnownFramework)
    ) {
      framework = selected as KnownFramework;
    }

    errorMessage = '';
    successMessage = '';
  }

  async function generateTests(): Promise<void> {
    if (isGenerating) return;

    errorMessage = '';
    successMessage = '';
    copied = false;

    if (!sourceCode.trim()) {
      errorMessage = 'Paste a function, component, or program before generating tests.';
      return;
    }

    if (sourceLanguage === 'other' && !customLanguage.trim()) {
      errorMessage = 'Enter the name of the programming language.';
      return;
    }

    if (framework === 'custom' && !customFramework.trim()) {
      errorMessage = 'Enter the name of the test framework.';
      return;
    }

    isGenerating = true;
    generatedTests = '';

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 65_000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sourceCode,
          sourceLanguage,
          customLanguage,
          framework,
          customFramework,
          modulePath
        }),
        signal: controller.signal
      });

      const payload = (await response.json().catch(() => null)) as
        | ApiResponse
        | null;

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === 'string'
            ? payload.error
            : 'Test generation failed. Please try again.'
        );
      }

      if (!payload || typeof payload.tests !== 'string' || !payload.tests.trim()) {
        throw new Error('The AI returned an empty response. Please try again.');
      }

      generatedTests = payload.tests.trim();

      const model =
        typeof payload.model === 'string' ? ` using ${payload.model}` : '';

      successMessage =
        `Generated a ${frameworkLabel(framework)} test file${model}.`;
    } catch (error) {
      errorMessage = controller.signal.aborted
        ? 'The request timed out. Try again with a smaller source sample.'
        : error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';
    } finally {
      window.clearTimeout(timeoutId);
      isGenerating = false;
    }
  }

  async function copyTests(): Promise<void> {
    if (!generatedTests) return;

    errorMessage = '';

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedTests);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = generatedTests;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.select();

        const successful = document.execCommand('copy');
        textarea.remove();

        if (!successful) throw new Error('Clipboard access was blocked.');
      }

      copied = true;
      window.setTimeout(() => {
        copied = false;
      }, 1800);
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? `Could not copy the tests: ${error.message}`
          : 'Could not copy the tests. Select the output and copy it manually.';
    }
  }

  function clearSource(): void {
    sourceCode = '';
    generatedTests = '';
    errorMessage = '';
    successMessage = '';
    copied = false;
  }
</script>

<svelte:head>
  <title>edge-case — AI test generator</title>
  <meta
    name="description"
    content="Generate tests for curated or custom programming languages and test frameworks."
  />
</svelte:head>

<div class="relative min-h-screen overflow-hidden">
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 -z-10 bg-lab-grid bg-[size:36px_36px] opacity-30"
  ></div>

  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
    <header class="flex items-center justify-between gap-4">
      <a href="/" class="flex items-center gap-3" aria-label="edge-case home">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-display text-sm font-bold text-white shadow-glow-indigo">
          EC
        </span>
        <span class="font-display text-xl font-bold text-secondary">
          edge<span class="text-primary">-case</span>
        </span>
      </a>

      <span class="hidden items-center gap-2 rounded-full border border-white/10 bg-surface/70 px-3 py-1.5 text-xs text-secondary sm:inline-flex">
        <span class="h-2 w-2 rounded-full bg-accent"></span>
        Multi-language test generation
      </span>
    </header>

    <section class="mx-auto max-w-3xl py-12 text-center sm:py-16">
      <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
        <span class="h-1.5 w-1.5 rounded-full bg-brand-teal"></span>
        AI-assisted test design
      </div>

      <h1 class="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
        Find the paths your tests are missing.
      </h1>

      <p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
        Paste a function, component, or program. Choose a curated language or
        describe a custom language and framework.
      </p>
    </section>

    <div class="grid items-start gap-5 lg:grid-cols-2">
      <section
        aria-labelledby="source-heading"
        class="rounded-3xl border border-white/10 bg-surface/75 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6"
      >
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
              Step 01
            </p>
            <h2 id="source-heading" class="mt-1 font-display text-xl font-semibold text-white">
              Source code
            </h2>
          </div>

          <span class="rounded-lg bg-midnight px-2.5 py-1 font-mono text-xs text-slate-400">
            {sourceCode.length.toLocaleString()} / {MAX_SOURCE_CHARACTERS.toLocaleString()}
          </span>
        </div>

        <label for="source-code" class="sr-only">Paste source code</label>
        <textarea
          id="source-code"
          name="code"
          bind:value={sourceCode}
          maxlength={MAX_SOURCE_CHARACTERS}
          rows="15"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          disabled={isGenerating}
          placeholder={`Paste ${languageLabel(sourceLanguage)} source code here...`}
          oninput={() => {
            errorMessage = '';
            successMessage = '';
          }}
          class="w-full resize-y rounded-2xl border border-white/10 bg-midnight/80 px-4 py-4 font-mono text-sm leading-6 text-slate-200 placeholder:text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        ></textarea>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label for="source-language" class="mb-2 block text-sm font-medium text-slate-300">
              Programming language
            </label>
            <select
              id="source-language"
              value={sourceLanguage}
              onchange={handleLanguageChange}
              disabled={isGenerating}
              class="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            >
              {#each LANGUAGES as language (language)}
                <option value={language}>
                  {language === 'other' ? 'Other / custom' : LABELS[language]}
                </option>
              {/each}
            </select>
          </div>

          {#if sourceLanguage === 'other'}
            <div>
              <label for="custom-language" class="mb-2 block text-sm font-medium text-slate-300">
                Language name
              </label>
              <input
                id="custom-language"
                bind:value={customLanguage}
                maxlength="64"
                disabled={isGenerating}
                placeholder="e.g. Scala, Elixir, Solidity"
                class="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>
          {:else}
            <div>
              <label for="test-framework" class="mb-2 block text-sm font-medium text-slate-300">
                Test framework
              </label>
              <select
                id="test-framework"
                value={framework}
                onchange={handleFrameworkChange}
                disabled={isGenerating}
                class="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              >
                {#each frameworkOptions(sourceLanguage) as option (option)}
                  <option value={option}>
                    {option === 'custom' ? 'Custom framework…' : FRAMEWORK_LABELS[option]}
                  </option>
                {/each}
              </select>
            </div>
          {/if}
        </div>

        {#if sourceLanguage === 'other' || framework === 'custom'}
          <div class="mt-4">
            <label for="custom-framework" class="mb-2 block text-sm font-medium text-slate-300">
              Test framework
            </label>
            <input
              id="custom-framework"
              bind:value={customFramework}
              maxlength="64"
              disabled={isGenerating}
              placeholder="e.g. ScalaTest, Catch2, ExUnit"
              class="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>
        {/if}

        <div class="mt-4">
          <label for="module-path" class="mb-2 block text-sm font-medium text-slate-300">
            Module, package, or type path
          </label>
          <input
            id="module-path"
            bind:value={modulePath}
            maxlength="200"
            disabled={isGenerating}
            placeholder={DEFAULT_MODULE_PATH[sourceLanguage]}
            class="w-full rounded-xl border border-white/10 bg-midnight px-3 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
          <p class="mt-2 text-xs leading-5 text-slate-500">
            {MODULE_PATH_HINTS[sourceLanguage]}
          </p>
        </div>

        {#if errorMessage}
          <div role="alert" class="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        {/if}

        {#if successMessage}
          <div role="status" aria-live="polite" class="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        {/if}

        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="max-w-sm text-xs leading-5 text-slate-500">
            Source is sent to Groq to generate tests. Don’t paste credentials or other secrets.
          </p>

          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              onclick={clearSource}
              disabled={isGenerating || (!sourceCode && !generatedTests)}
              class="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Clear
            </button>

            <button
              type="button"
              onclick={generateTests}
              disabled={isGenerating || !sourceCode.trim()}
              class="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? 'Generating…' : 'Generate tests'}
              {#if !isGenerating}<span aria-hidden="true">→</span>{/if}
            </button>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="output-heading"
        class="rounded-3xl border border-white/10 bg-surface/75 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6"
      >
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
              Step 02
            </p>
            <h2 id="output-heading" class="mt-1 font-display text-xl font-semibold text-white">
              Generated test file
            </h2>
          </div>

          <button
            type="button"
            onclick={copyTests}
            disabled={!generatedTests}
            class="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-primary/50 hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? 'Copied' : 'Copy code'}
          </button>
        </div>

        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span class="rounded-lg border border-white/10 bg-midnight px-2.5 py-1 font-mono text-xs text-slate-300">
            {frameworkLabel(framework)}
          </span>
          <span class="rounded-lg border border-white/10 bg-midnight px-2.5 py-1 font-mono text-xs text-slate-400">
            {languageLabel(sourceLanguage)}
          </span>
        </div>

        <div class="code-preview min-h-[26rem] overflow-hidden rounded-2xl border border-white/10 bg-midnight">
          {#if generatedTests}
            <pre class="m-0 max-h-[36rem] min-h-[26rem] overflow-auto p-5 text-sm leading-6"><code class="block whitespace-pre">{@html highlightedTests}</code></pre>
          {:else}
            <div class="flex min-h-[26rem] flex-col items-center justify-center px-6 text-center">
              <span class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-surface font-mono text-sm font-semibold text-primary" aria-hidden="true">
                &lt;/&gt;
              </span>
              <p class="font-medium text-slate-300">Your tests will appear here</p>
              <p class="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Choose a language and framework, then paste source code to generate a test file.
              </p>
            </div>
          {/if}
        </div>

        <p class="mt-3 text-xs leading-5 text-slate-500">
          Custom languages and frameworks are best-effort. Review generated tests and adjust paths or project setup as needed.
        </p>
      </section>
    </div>

    <footer class="mt-10 border-t border-white/10 pt-5 text-center text-xs text-slate-500">
      edge-case helps you explore behavior; always review AI-generated tests before relying on them.
    </footer>
  </main>
</div>

<style>
  .code-preview pre {
    tab-size: 2;
  }

  :global(.code-preview .syntax-comment) {
    color: #64748b;
    font-style: italic;
  }

  :global(.code-preview .syntax-string) {
    color: #86efac;
  }

  :global(.code-preview .syntax-number) {
    color: #fbbf24;
  }

  :global(.code-preview .syntax-keyword) {
    color: #c4b5fd;
    font-weight: 600;
  }

  :global(.code-preview .syntax-literal) {
    color: #fda4af;
  }

  :global(.code-preview .syntax-function) {
    color: #67e8f9;
  }

  :global(.code-preview .syntax-type) {
    color: #93c5fd;
  }

  :global(.code-preview .syntax-identifier) {
    color: #e2e8f0;
  }
</style>