'use strict';

const PAGE_SIZE = 20;

const state = {
  entries: [],
  filtered: [],
  page: 1,
  query: '',
  field: 'all',
  loaded: false
};

const elements = {
  searchInput: document.getElementById('search-input'),
  clearSearch: document.getElementById('clear-search'),
  emptyClear: document.getElementById('empty-clear'),
  fieldFilter: document.getElementById('field-filter'),
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  emptyState: document.getElementById('empty-state'),
  entryList: document.getElementById('entry-list'),
  pagination: document.getElementById('pagination'),
  prevPage: document.getElementById('prev-page'),
  nextPage: document.getElementById('next-page'),
  pageStatus: document.getElementById('page-status'),
  resultsSummary: document.getElementById('results-summary'),
  statEntries: document.getElementById('stat-entries')
};

function normalize(value) {
  return String(value == null ? '' : value)
    .normalize('NFKC')
    .toLocaleLowerCase()
    .trim();
}

function matches(entry) {
  const query = normalize(state.query);
  if (!query) return true;

  const values = state.field === 'all'
    ? [entry.id, entry.English, entry.Chinese, entry.English_Nominal, entry.Chinese_Verb]
    : [entry[state.field]];

  const haystack = normalize(values.join(' '));
  return query.split(/\s+/).every(function (token) {
    return haystack.includes(token);
  });
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

function addLanguageBlock(card, labelText, value, language, paragraphClass) {
  const block = makeElement('div', 'language-block');
  const label = makeElement('span', 'language-label', labelText);
  const paragraph = makeElement('p', paragraphClass, value);
  paragraph.lang = language;
  block.append(label, paragraph);
  card.append(block);
}

function createEntryCard(entry, sourceIndex) {
  const card = makeElement('article', 'entry-card');

  const topline = makeElement('div', 'entry-topline');
  topline.append(
    makeElement('span', 'entry-id', 'ID ' + entry.id),
    makeElement('span', 'entry-index', 'Source row ' + String(sourceIndex + 1).padStart(3, '0'))
  );

  const terms = makeElement('div', 'entry-terms');
  const nominal = makeElement('span', 'term term-nominal');
  nominal.append(
    makeElement('span', null, 'Nominal'),
    makeElement('strong', null, entry.English_Nominal)
  );

  const verb = makeElement('span', 'term term-verb');
  verb.append(
    makeElement('span', null, 'Verb'),
    makeElement('strong', null, entry.Chinese_Verb)
  );
  terms.append(nominal, verb);

  card.append(topline);
  addLanguageBlock(card, 'English', entry.English, 'en', 'english-text');
  addLanguageBlock(card, '中文', entry.Chinese, 'zh-Hans', 'chinese-text');
  card.append(terms);
  return card;
}

function updateSummary(total) {
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(state.page * PAGE_SIZE, total);
  const currentField = elements.fieldFilter.options[elements.fieldFilter.selectedIndex].textContent;
  const query = state.query.trim();

  if (!query) {
    elements.resultsSummary.textContent = total === state.entries.length
      ? 'Showing ' + start + '–' + end + ' of ' + total + ' entries'
      : 'Showing ' + start + '–' + end + ' of ' + total + ' entries in ' + currentField;
  } else {
    elements.resultsSummary.textContent = total + ' match' + (total === 1 ? '' : 'es') +
      ' for “' + query + '” · showing ' + start + '–' + end;
  }

  elements.pageStatus.textContent = total === 0 ? '' : 'Page ' + state.page + ' of ' + pageCount;
  elements.prevPage.disabled = state.page <= 1;
  elements.nextPage.disabled = state.page >= pageCount;
  elements.pagination.hidden = total <= PAGE_SIZE;
}

function render() {
  if (!state.loaded) return;

  const filtered = state.entries
    .map(function (entry, sourceIndex) {
      return { entry: entry, sourceIndex: sourceIndex };
    })
    .filter(function (item) {
      return matches(item.entry);
    });

  state.filtered = filtered;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(Math.max(state.page, 1), pageCount);

  elements.loadingState.hidden = true;
  elements.errorState.hidden = true;
  elements.emptyState.hidden = filtered.length !== 0;
  elements.entryList.hidden = filtered.length === 0;

  const fragment = document.createDocumentFragment();
  const start = (state.page - 1) * PAGE_SIZE;
  filtered.slice(start, start + PAGE_SIZE).forEach(function (item) {
    fragment.append(createEntryCard(item.entry, item.sourceIndex));
  });
  elements.entryList.replaceChildren(fragment);

  updateSummary(filtered.length);
}

function resetPageAndRender() {
  state.page = 1;
  render();
}

function clearSearch() {
  state.query = '';
  state.field = 'all';
  elements.searchInput.value = '';
  elements.fieldFilter.value = 'all';
  elements.clearSearch.hidden = true;
  resetPageAndRender();
  elements.searchInput.focus();
}

elements.searchInput.addEventListener('input', function (event) {
  state.query = event.target.value;
  elements.clearSearch.hidden = state.query.length === 0;
  resetPageAndRender();
});

elements.fieldFilter.addEventListener('change', function (event) {
  state.field = event.target.value;
  resetPageAndRender();
});

elements.clearSearch.addEventListener('click', clearSearch);
elements.emptyClear.addEventListener('click', clearSearch);

document.querySelectorAll('[data-query]').forEach(function (button) {
  button.addEventListener('click', function () {
    const query = button.getAttribute('data-query') || '';
    state.query = query;
    state.field = 'all';
    elements.searchInput.value = query;
    elements.fieldFilter.value = 'all';
    elements.clearSearch.hidden = false;
    resetPageAndRender();
    document.getElementById('entries').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

elements.prevPage.addEventListener('click', function () {
  if (state.page > 1) {
    state.page -= 1;
    render();
    document.getElementById('entries').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

elements.nextPage.addEventListener('click', function () {
  const pageCount = Math.ceil(state.filtered.length / PAGE_SIZE);
  if (state.page < pageCount) {
    state.page += 1;
    render();
    document.getElementById('entries').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

async function loadCorpus() {
  try {
    const response = await fetch('data/nvatlas.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.entries) || data.entries.length === 0) {
      throw new Error('The dataset contains no entries.');
    }

    state.entries = data.entries;
    state.loaded = true;
    elements.statEntries.textContent = data.entries.length.toLocaleString();
    render();
  } catch (error) {
    console.error('Unable to load the NV Atlas dataset:', error);
    elements.loadingState.hidden = true;
    elements.entryList.hidden = true;
    elements.emptyState.hidden = true;
    elements.pagination.hidden = true;
    elements.errorState.hidden = false;
    elements.resultsSummary.textContent = 'Dataset unavailable';
  }
}

loadCorpus();
