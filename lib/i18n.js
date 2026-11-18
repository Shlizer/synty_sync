// Shared i18n: loaded by the main process (require) and by the renderer (<script>, exposes window.i18n).
// A message is either a string key or { key, params }; params may themselves contain messages.
// A dictionary entry may be a plural object ({ one, few, many, other }) selected by params.n.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.i18n = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const LANGUAGES = {
    en: { name: 'English', locale: 'en-GB', flag: 'gb' },
    pl: { name: 'Polski', locale: 'pl-PL', flag: 'pl' },
  };

  const STRINGS = {
    en: {
      // Operations (shown while busy)
      'op.catalog': 'Refreshing catalog',
      'op.check': 'Checking versions',
      'op.download': 'Downloading',
      'op.changeRoot': 'Changing library folder',

      // Errors
      'error.busy': 'Another operation is in progress: {op}',
      'error.loginRequired': 'Synty Store login required',
      'error.htmlInsteadOfFile': 'The server returned a web page instead of a file (session expired?)',
      'error.incompleteFile': 'Incomplete file: {received}/{total} B',

      // Log
      'log.sessionExpired': 'Synty session expired - please log in.',
      'log.cancelled': 'Cancelled.',
      'log.error': 'Error ({op}): {error}',
      'log.checkDone': {
        one: 'Checked {n} pack; to download/update: {pending}.',
        other: 'Checked {n} packs; to download/update: {pending}.',
      },
      'log.downloadItem': '[{i}/{count}] {title} -> {variant} {version} ({size})',
      'log.downloadOk': '  OK {file}',
      'log.downloadFailed': '  ERR {title}: {error}',
      'log.imported': { one: 'Imported {n} file.', other: 'Imported {n} files.' },
      'log.fetchedList': '{path}: {n}',
      'log.iconFailed': 'Icon {handle}: {error}',
      'log.catalogDone': {
        one: 'Catalog: {n} pack, new icons: {icons}',
        other: 'Catalog: {n} packs, new icons: {icons}',
      },
      'log.libraryPage': 'Library: page {page}, items so far: {n}',
      'log.libraryItems': {
        one: 'Library: {n} item, reading versions...',
        other: 'Library: {n} items, reading versions...',
      },
      'log.openingLogin': 'Opening the Synty Store login window...',
      'log.loggedIn': 'Logged in.',
      'log.loginClosed': 'Login window closed.',
      'log.checkFirst': 'Run "Check versions" first - import matches files against the packs you own.',
      'log.scanDone': {
        one: 'Scan: {n} file to import.',
        other: 'Scan: {n} files to import.',
      },
      'log.rootChanged': 'Library folder: {root}',
      'log.rootOpened': 'Opened the existing library in {root}.',
      'log.rootAdopted': 'Library folder: {root}. The pack list was carried over; {prev} was added to the import folders - use the Import tab to move your pack files.',

      // Windows and dialogs
      'window.loginTitle': 'Log in - Synty Store',
      'dialog.chooseRoot': 'Choose the library folder',
      'dialog.addImportDir': 'Choose a folder with .unitypackage files',

      // Header
      'tab.owned': 'Owned',
      'tab.catalog': 'Catalog',
      'tab.import': 'Import',
      'btn.refreshCatalog': 'Refresh catalog',
      'btn.refreshCatalog.title': 'Fetches the pack list and icons from the store',
      'btn.check': 'Check versions',
      'btn.check.title': 'Reads your library and the latest versions',
      'btn.updateAll': 'Download updates ({n})',
      'btn.cancel': 'Cancel',
      'lang.title': 'Interface language',

      // Filters
      'search.placeholder': 'Search...',
      'filter.needs': 'To download',
      'filter.current': 'Up to date',
      'filter.owned': 'Owned',
      'filter.notowned': 'Not owned',
      'meta': 'Catalog: {catalog} | Versions: {checked}',
      'root.open': 'Library folder - click to open it',
      'btn.changeRoot': 'Change...',
      'btn.changeRoot.title': 'Choose a different library folder',
      'login.ok': 'Logged in to Synty Store',
      'login.bad': 'Not logged in - click to log in',

      // Categories (ids are folder names on disk and stay in English)
      'cat.Animation': 'Animation',
      'cat.Interface': 'Interface',
      'cat.Polygon': 'Polygon',
      'cat.Sidekick': 'Sidekick',
      'cat.Maps': 'Maps',
      'cat.Other': 'Other',

      // Statuses
      'status.current': 'Up to date',
      'status.outdated': 'Newer version',
      'status.editor-upgrade': 'Newer Unity',
      'status.missing': 'Not downloaded',
      'status.no-unity': 'No Unity file',
      'status.unknown': 'Unknown',

      // Cards
      'card.onDisk': 'On disk:',
      'card.latest': 'Latest:',
      'card.released': 'Released: {year}',
      'badge.owned': 'Owned',
      'btn.update': 'Update',
      'btn.redownload': 'Download again',
      'btn.download': 'Download',
      'btn.showFile': 'Show file',
      'btn.store': 'Store',

      // Empty states
      'empty.noResults': 'No results for the current filters.',
      'empty.owned': 'Click "Check versions" to load your library from Synty Store.',
      'empty.catalog': 'Click "Refresh catalog".',
      'empty.import': 'No files to import (or no scan has been run yet).',

      // Import
      'import.intro': 'Looks for <code>.unitypackage</code> files of the packs you own in the import folders and in the library itself. Selected files will be moved to <code>&lt;library&gt;\\&lt;Category&gt;\\</code> and marked as downloaded.',
      'btn.scan': 'Scan',
      'btn.applyImport': 'Move selected',
      'import.col.pack': 'Pack',
      'import.col.file': 'File',
      'import.col.fileVersion': 'File version',
      'import.col.latest': 'Latest',
      'import.col.after': 'After import',
      'import.fuzzy': '(approximate match)',
      'import.dirs': 'Import folders:',
      'import.noDirs': 'none - only the library folder is scanned',
      'btn.addImportDir': 'Add folder...',
      'btn.removeImportDir': 'Remove from import folders',

      // Progress
      'progress.check': 'Checking {done}/{total}: {title}',
      'progress.download': '[{index}/{count}] {title}: {amount} MB',
    },

    pl: {
      'op.catalog': 'Odświeżanie katalogu',
      'op.check': 'Sprawdzanie wersji',
      'op.download': 'Pobieranie',
      'op.changeRoot': 'Zmiana folderu biblioteki',

      'error.busy': 'Trwa inna operacja: {op}',
      'error.loginRequired': 'Wymagane logowanie do Synty Store',
      'error.htmlInsteadOfFile': 'Serwer zwrócił stronę zamiast pliku (sesja wygasła?)',
      'error.incompleteFile': 'Niekompletny plik: {received}/{total} B',

      'log.sessionExpired': 'Sesja Synty wygasła - zaloguj się.',
      'log.cancelled': 'Przerwano.',
      'log.error': 'Błąd ({op}): {error}',
      'log.checkDone': {
        one: 'Sprawdzono {n} paczkę; do pobrania/aktualizacji: {pending}.',
        few: 'Sprawdzono {n} paczki; do pobrania/aktualizacji: {pending}.',
        many: 'Sprawdzono {n} paczek; do pobrania/aktualizacji: {pending}.',
        other: 'Sprawdzono {n} paczki; do pobrania/aktualizacji: {pending}.',
      },
      'log.downloadItem': '[{i}/{count}] {title} -> {variant} {version} ({size})',
      'log.downloadOk': '  OK {file}',
      'log.downloadFailed': '  ERR {title}: {error}',
      'log.imported': {
        one: 'Zaimportowano {n} plik.',
        few: 'Zaimportowano {n} pliki.',
        many: 'Zaimportowano {n} plików.',
        other: 'Zaimportowano {n} pliku.',
      },
      'log.fetchedList': '{path}: {n}',
      'log.iconFailed': 'Ikona {handle}: {error}',
      'log.catalogDone': {
        one: 'Katalog: {n} paczka, nowe ikony: {icons}',
        few: 'Katalog: {n} paczki, nowe ikony: {icons}',
        many: 'Katalog: {n} paczek, nowe ikony: {icons}',
        other: 'Katalog: {n} paczki, nowe ikony: {icons}',
      },
      'log.libraryPage': 'Biblioteka: strona {page}, dotąd pozycji: {n}',
      'log.libraryItems': {
        one: 'Biblioteka: {n} pozycja, odczyt wersji...',
        few: 'Biblioteka: {n} pozycje, odczyt wersji...',
        many: 'Biblioteka: {n} pozycji, odczyt wersji...',
        other: 'Biblioteka: {n} pozycji, odczyt wersji...',
      },
      'log.openingLogin': 'Otwieram okno logowania Synty Store...',
      'log.loggedIn': 'Zalogowano.',
      'log.loginClosed': 'Okno logowania zamknięte.',
      'log.checkFirst': 'Najpierw "Sprawdź wersje" - import dopasowuje pliki do posiadanych paczek.',
      'log.scanDone': {
        one: 'Skan: {n} plik do zaimportowania.',
        few: 'Skan: {n} pliki do zaimportowania.',
        many: 'Skan: {n} plików do zaimportowania.',
        other: 'Skan: {n} pliku do zaimportowania.',
      },
      'log.rootChanged': 'Folder biblioteki: {root}',
      'log.rootOpened': 'Otwarto istniejącą bibliotekę w {root}.',
      'log.rootAdopted': 'Folder biblioteki: {root}. Lista paczek została przeniesiona; {prev} dodano do folderów importu - przenieś pliki paczek w zakładce Import.',

      'window.loginTitle': 'Logowanie - Synty Store',
      'dialog.chooseRoot': 'Wybierz folder biblioteki',
      'dialog.addImportDir': 'Wybierz folder z plikami .unitypackage',

      'tab.owned': 'Posiadane',
      'tab.catalog': 'Katalog',
      'tab.import': 'Import',
      'btn.refreshCatalog': 'Odśwież katalog',
      'btn.refreshCatalog.title': 'Pobiera listę paczek i ikony ze sklepu',
      'btn.check': 'Sprawdź wersje',
      'btn.check.title': 'Czyta Twoją bibliotekę i najnowsze wersje',
      'btn.updateAll': 'Pobierz aktualizacje ({n})',
      'btn.cancel': 'Przerwij',
      'lang.title': 'Język interfejsu',

      'search.placeholder': 'Szukaj...',
      'filter.needs': 'Do pobrania',
      'filter.current': 'Aktualne',
      'filter.owned': 'Posiadane',
      'filter.notowned': 'Nieposiadane',
      'meta': 'Katalog: {catalog} | Wersje: {checked}',
      'root.open': 'Folder biblioteki - kliknij, aby go otworzyć',
      'btn.changeRoot': 'Zmień...',
      'btn.changeRoot.title': 'Wybierz inny folder biblioteki',
      'login.ok': 'Zalogowano do Synty Store',
      'login.bad': 'Niezalogowany - kliknij, by się zalogować',

      'cat.Animation': 'Animacje',
      'cat.Interface': 'Interfejs',
      'cat.Polygon': 'Polygon',
      'cat.Sidekick': 'Sidekick',
      'cat.Maps': 'Mapy',
      'cat.Other': 'Inne',

      'status.current': 'Aktualna',
      'status.outdated': 'Nowsza wersja',
      'status.editor-upgrade': 'Nowszy Unity',
      'status.missing': 'Niepobrana',
      'status.no-unity': 'Brak pliku Unity',
      'status.unknown': 'Nieznany',

      'card.onDisk': 'Na dysku:',
      'card.latest': 'Najnowsza:',
      'card.released': 'Wydana: {year}',
      'badge.owned': 'Posiadana',
      'btn.update': 'Aktualizuj',
      'btn.redownload': 'Pobierz ponownie',
      'btn.download': 'Pobierz',
      'btn.showFile': 'Pokaż plik',
      'btn.store': 'Sklep',

      'empty.noResults': 'Brak wyników dla filtrów.',
      'empty.owned': 'Kliknij "Sprawdź wersje", aby wczytać Twoją bibliotekę z Synty Store.',
      'empty.catalog': 'Kliknij "Odśwież katalog".',
      'empty.import': 'Brak plików do zaimportowania (albo jeszcze nie skanowano).',

      'import.intro': 'Szuka plików <code>.unitypackage</code> paczek, które posiadasz, w folderach importu i w samej bibliotece. Zaznaczone pliki zostaną przeniesione do <code>&lt;biblioteka&gt;\\&lt;Kategoria&gt;\\</code> i oznaczone jako pobrane.',
      'btn.scan': 'Skanuj',
      'btn.applyImport': 'Przenieś zaznaczone',
      'import.col.pack': 'Paczka',
      'import.col.file': 'Plik',
      'import.col.fileVersion': 'Wersja pliku',
      'import.col.latest': 'Najnowsza',
      'import.col.after': 'Po imporcie',
      'import.fuzzy': '(dopasowanie przybliżone)',
      'import.dirs': 'Foldery importu:',
      'import.noDirs': 'brak - skanowany jest tylko folder biblioteki',
      'btn.addImportDir': 'Dodaj folder...',
      'btn.removeImportDir': 'Usuń z folderów importu',

      'progress.check': 'Sprawdzanie {done}/{total}: {title}',
      'progress.download': '[{index}/{count}] {title}: {amount} MB',
    },
  };

  const FALLBACK = 'en';
  let current = FALLBACK;

  const isMessage = (v) => !!v && typeof v === 'object' && typeof v.key === 'string';

  function t(key, params = {}, lang = current) {
    let s = STRINGS[lang]?.[key] ?? STRINGS[FALLBACK][key] ?? key;
    if (typeof s === 'object') {
      const form = new Intl.PluralRules(LANGUAGES[lang]?.locale || lang).select(Number(params.n) || 0);
      s = s[form] ?? s.other;
    }
    return s.replace(/\{(\w+)\}/g, (m, name) => (name in params ? format(params[name], lang) : m));
  }

  // Translates a message ({ key, params }) or passes plain text through.
  function format(value, lang = current) {
    if (isMessage(value)) return t(value.key, value.params || {}, lang);
    return String(value ?? '');
  }

  // Error whose text can be re-translated: `message` is English (for console/stack traces).
  class LocalizedError extends Error {
    constructor(key, params = {}) {
      super(t(key, params, FALLBACK));
      this.key = key;
      this.params = params;
    }
  }

  // Serializable form of any error for logs: a message if localized, plain text otherwise.
  const errorMessage = (e) => (e && e.key ? { key: e.key, params: e.params } : String(e?.message ?? e));

  // "pl-PL" / "pl" -> "pl"; unknown -> fallback.
  function resolveLanguage(locale) {
    const base = String(locale || '').slice(0, 2).toLowerCase();
    return STRINGS[base] ? base : FALLBACK;
  }

  return {
    LANGUAGES,
    t,
    format,
    LocalizedError,
    errorMessage,
    resolveLanguage,
    setLanguage: (lang) => (current = STRINGS[lang] ? lang : FALLBACK),
    getLanguage: () => current,
    locale: () => LANGUAGES[current].locale,
  };
});
