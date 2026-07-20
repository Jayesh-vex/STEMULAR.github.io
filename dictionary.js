const apiKeyInput = document.getElementById('apiKey');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const dictionaryForm = document.getElementById('dictionaryForm');
const wordInput = document.getElementById('wordInput');
const resultBox = document.getElementById('dictionaryResult');
const mainSearchForm = document.getElementById('mainSearchForm');
const mainSearchInput = document.getElementById('mainSearchInput');
const mainSearchResult = document.getElementById('mainSearchResult');

const STORAGE_KEY = 'stemularMerriamApiKey';

if (apiKeyInput) {
  const savedApiKey = localStorage.getItem(STORAGE_KEY) || '';
  const fallbackApiKey = apiKeyInput.dataset.apiKey?.trim() || apiKeyInput.placeholder?.trim() || '';
  apiKeyInput.value = savedApiKey || fallbackApiKey;
}

if (saveKeyBtn && apiKeyInput) {
  saveKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    localStorage.setItem(STORAGE_KEY, apiKey);
    if (resultBox) {
      resultBox.innerHTML = '<strong>API key saved.</strong> You can now search for a word.';
    }
  });
}

const renderDictionaryResult = (word, entry, targetBox) => {
  if (!entry) {
    targetBox.innerHTML = '<strong>No result found.</strong> Try another word.';
    return;
  }

  const shortDef = Array.isArray(entry.shortdef) && entry.shortdef.length > 0
    ? entry.shortdef.join(' • ')
    : 'No short definition available.';

  const wordText = entry.meta?.stems?.[0] || word;
  const partOfSpeech = entry.fl || 'word';

  const getDefinitionText = () => {
    const defs = entry.defs || [];
    if (defs.length > 0) {
      const firstDef = defs[0];
      const seq = firstDef?.sseq || [];
      for (const item of seq) {
        const firstEntry = item?.[0];
        const secondEntry = item?.[1];
        if (secondEntry?.dt) {
          const textItem = secondEntry.dt.find((dtItem) => Array.isArray(dtItem) && dtItem[0] === 'text');
          if (textItem?.[1]) {
            return Array.isArray(textItem[1]) ? textItem[1].join(' ') : textItem[1];
          }
        }
        if (firstEntry?.dt) {
          const textItem = firstEntry.dt.find((dtItem) => Array.isArray(dtItem) && dtItem[0] === 'text');
          if (textItem?.[1]) {
            return Array.isArray(textItem[1]) ? textItem[1].join(' ') : textItem[1];
          }
        }
      }
    }
    return shortDef;
  };

  const usage = getDefinitionText();
  const meaning = shortDef;

  targetBox.innerHTML = `
    <h3>${wordText}</h3>
    <div class="result-block">
      <span class="result-label">When to use it</span>
      <div>${partOfSpeech}</div>
    </div>
    <div class="result-block">
      <span class="result-label">How to use it</span>
      <div>${wordText}</div>
    </div>
    <div class="result-block">
      <span class="result-label">Meaning</span>
      <div>${meaning}</div>
    </div>
    <div class="result-block">
      <span class="result-label">Details</span>
      <div>${usage}</div>
    </div>
  `;
};

const fetchDefinition = async (word, targetBox) => {
  const apiKey = localStorage.getItem(STORAGE_KEY) || (apiKeyInput ? apiKeyInput.value.trim() : '');

  if (!word) {
    targetBox.innerHTML = '<strong>Please enter a word.</strong>';
    return;
  }

  if (!apiKey) {
    targetBox.innerHTML = '<strong>No API key found.</strong> Paste your Merriam-Webster API key and save it first.';
    return;
  }

  targetBox.innerHTML = 'Searching...';

  try {
    const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      targetBox.innerHTML = '<strong>No result found.</strong> Try another word.';
      return;
    }

    const entry = data.find((item) => item && typeof item === 'object' && item.shortdef) || data[0];
    renderDictionaryResult(word, entry, targetBox);
  } catch (error) {
    targetBox.innerHTML = '<strong>Could not fetch definition.</strong> Check your API key or internet connection.';
  }
};

if (dictionaryForm && wordInput && resultBox) {
  dictionaryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await fetchDefinition(wordInput.value.trim(), resultBox);
  });
}

if (mainSearchForm && mainSearchInput && mainSearchResult) {
  mainSearchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await fetchDefinition(mainSearchInput.value.trim(), mainSearchResult);
  });
}
