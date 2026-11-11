```jsx
import React, { useEffect, useState } from 'react';

import {
  checkApi,
  getConsents,
  grantConsent,
  revokeConsent,
  getConsentHistory,
} from '../services/api';

const navigation = [
  { id: 'overview', icon: '⌂', label: 'Overview' },
  { id: 'face', icon: '◈', label: 'Face Studio' },
  { id: 'voice', icon: '♫', label: 'Voice Studio' },
  { id: 'live', icon: '◉', label: 'Live Studio' },
  { id: 'consent', icon: '♧', label: 'Consent Centre' },
];

const consentTypes = {
  face: 'face_processing',
  voice: 'voice_processing',
  live: 'live_calls',
};

const studioNames = {
  face_processing: 'Face Studio',
  voice_processing: 'Voice Studio',
  live_calls: 'Live Studio',
};

function App() {
  const [activePage, setActivePage] = useState('overview');
  const [apiOnline, setApiOnline] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [consent, setConsent] = useState({
    face: false,
    voice: false,
    live: false,
  });

  const [consentLoading, setConsentLoading] = useState(true);
  const [savingConsent, setSavingConsent] = useState(null);
  const [consentMessage, setConsentMessage] = useState('');

  const [consentHistory, setConsentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const page = navigation.find(item => item.id === activePage);

  useEffect(() => {
    let mounted = true;

    async function loadWorkspace() {
      try {
        const online = await checkApi();

        if (!mounted) return;

        setApiOnline(online);

        if (!online) {
          setConsentMessage(
            'Backend is offline. Start your FastAPI server to load permissions.'
          );
          return;
        }

        const records = await getConsents();

        if (!mounted) return;

        const savedConsent = {
          face: false,
          voice: false,
          live: false,
        };

        records.forEach(record => {
          const key = Object.keys(consentTypes).find(
            item => consentTypes[item] === record.consent_type
          );

          if (key) {
            savedConsent[key] = record.granted;
          }
        });

        setConsent(savedConsent);
        setConsentMessage('');
      } catch (error) {
        if (mounted) {
          setConsentMessage(error.message);
        }
      } finally {
        if (mounted) {
          setConsentLoading(false);
        }
      }
    }

    loadWorkspace();

    return () => {
      mounted = false;
    };
  }, []);

  async function loadConsentHistory() {
    if (!apiOnline) return;

    setHistoryLoading(true);
    setHistoryError('');

    try {
      const records = await getConsentHistory();
      setConsentHistory(records);
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    if (activePage === 'consent' && apiOnline) {
      loadConsentHistory();
    }
  }, [activePage, apiOnline]);

  async function updateConsent(key) {
    if (savingConsent || consentLoading) return;

    const currentlyEnabled = consent[key];
    const consentType = consentTypes[key];

    setSavingConsent(key);
    setConsentMessage('');

    try {
      const result = currentlyEnabled
        ? await revokeConsent(consentType)
        : await grantConsent(consentType);

      setConsent(previous => ({
        ...previous,
        [key]: result.granted,
      }));

      setConsentMessage(
        result.granted
          ? `${key} permission successfully enabled and saved.`
          : `${key} permission successfully revoked and saved.`
      );

      await loadConsentHistory();
    } catch (error) {
      setConsentMessage(
        `Could not update permission: ${error.message}`
      );
    } finally {
      setSavingConsent(null);
    }
  }

  function handleImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    if (selectedImage?.url) {
      URL.revokeObjectURL(selectedImage.url);
    }

    setSelectedImage({
      name: file.name,
      url: URL.createObjectURL(file),
    });
  }

  function renderOverview() {
    return (
      <>
        <section className="welcome-panel">
          <div>
            <div className="eyebrow">YOUR PERSONAL AI WORKSPACE</div>
            <h1>Welcome to your <span>creative space.</span></h1>
            <p>
              Your personal environment for transparent, consent-based
              AI experiences.
            </p>
          </div>
          <div className="welcome-orb">M</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <span>AVAILABLE MODULES</span>
            <strong>04</strong>
            <small>Your creative tools</small>
          </article>

          <article className="stat-card">
            <span>ACTIVE PERMISSIONS</span>
            <strong>
              {Object.values(consent).filter(Boolean).length}
            </strong>
            <small>Consent settings enabled</small>
          </article>

          <article className="stat-card">
            <span>BACKEND STATUS</span>
            <strong className={apiOnline ? 'status-good' : 'status-bad'}>
              {apiOnline ? 'Online' : 'Offline'}
            </strong>
            <small>FastAPI connection</small>
          </article>
        </section>

        <section className="content-section">
          <div className="section-title">
            <div>
              <div className="eyebrow">YOUR TOOLS</div>
              <h2>Explore your <span>studios.</span></h2>
            </div>
          </div>

          <div className="studio-grid">
            {[
              {
                id: 'face',
                icon: '◈',
                title: 'Face Studio',
                description: 'Prepare personal images for visual AI experiences.',
                tag: 'IMAGE WORKSPACE',
              },
              {
                id: 'voice',
                icon: '♫',
                title: 'Voice Studio',
                description: 'Manage your personal voice projects.',
                tag: 'AUDIO WORKSPACE',
              },
              {
                id: 'live',
                icon: '◉',
                title: 'Live Studio',
                description: 'Explore transparent real-time video experiences.',
                tag: 'REAL-TIME WORKSPACE',
              },
              {
                id: 'consent',
                icon: '♧',
                title: 'Consent Centre',
                description: 'Control permissions and participation.',
                tag: 'PRIVACY & CONTROL',
              },
            ].map((item, index) => (
              <button
                className="studio-card"
                key={item.id}
                onClick={() => setActivePage(item.id)}
              >
                <div className="studio-card-top">
                  <span className="studio-icon">{item.icon}</span>
                  <span className="card-number">0{index + 1}</span>
                </div>

                <div className="studio-card-content">
                  <span className="studio-tag">{item.tag}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="studio-card-bottom">
                  Open workspace <span>↗</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="notice-panel">
          <span className="notice-icon">✳</span>
          <div>
            <h3>Transparency comes first.</h3>
            <p>
              MIRRORA is designed around permission, privacy and clear
              disclosure whenever AI-generated media is used.
            </p>
          </div>
        </section>
      </>
    );
  }

  function renderFaceStudio() {
    return (
      <section className="workspace-panel">
        <div className="eyebrow">VISUAL CREATION</div>
        <h1>Face <span>Studio.</span></h1>
        <p className="page-description">
          Your personal visual workspace. Start with an image you own
          or have explicit permission to use.
        </p>

        <div className="upload-panel">
          <div className="upload-symbol">◈</div>
          <h2>{selectedImage ? 'Image selected' : 'Bring your image'}</h2>
          <p>
            Select an image from your device to preview it in your workspace.
            No image processing happens yet.
          </p>

          <label className="primary-button upload-button">
            Choose image
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              hidden
            />
          </label>

          {selectedImage && (
            <div className="image-preview">
              <img src={selectedImage.url} alt="Selected preview" />
              <span>{selectedImage.name}</span>
              <button
                className="text-button"
                onClick={() => {
                  URL.revokeObjectURL(selectedImage.url);
                  setSelectedImage(null);
                }}
              >
                Remove image
              </button>
            </div>
          )}

          <div className="privacy-note">
            <span>♧</span>
            Only use your own image or an image whose subject has
            explicitly agreed to this use.
          </div>
        </div>
      </section>
    );
  }

  function renderVoiceStudio() {
    return (
      <section className="workspace-panel">
        <div className="eyebrow">PERSONAL AUDIO</div>
        <h1>Voice <span>Studio.</span></h1>
        <p className="page-description">
          A dedicated space for managing voice projects with permission
          from the voice owner.
        </p>

        <div className="coming-panel">
          <div className="large-symbol">♫</div>
          <span className="coming-label">DEVELOPMENT PHASE</span>
          <h2>Your voice workspace is coming.</h2>
          <p>
            We'll build voice recording, consent verification,
            project management and clearly labelled generated audio.
          </p>
          <div className="feature-pills">
            <span>Voice recording</span>
            <span>Permission controls</span>
            <span>Audio projects</span>
          </div>
        </div>
      </section>
    );
  }

  function renderLiveStudio() {
    return (
      <section className="workspace-panel">
        <div className="eyebrow">REAL-TIME EXPERIENCES</div>
        <h1>Live <span>Studio.</span></h1>
        <p className="page-description">
          Explore the future of transparent AI-assisted video calls.
        </p>

        <div className="coming-panel live-panel">
          <div className="large-symbol">◉</div>
          <span className="coming-label">DEVELOPMENT PHASE</span>
          <h2>Live experiences, made transparent.</h2>
          <p>
            This module will eventually support video calls with
            visible disclosure whenever synthetic media is active.
          </p>
          <div className="disclosure-preview">
            <span className="live-dot"></span>
            AI-ASSISTED MEDIA ACTIVE
          </div>
        </div>
      </section>
    );
  }

  function renderConsentHistory() {
    return (
      <section className="history-section">
        <div className="section-title">
          <div>
            <div className="eyebrow">ACTIVITY LOG</div>
            <h2>Consent <span>History.</span></h2>
          </div>

          <button
            className="text-button"
            onClick={loadConsentHistory}
            disabled={historyLoading}
          >
            {historyLoading ? 'Loading...' : 'Refresh ↻'}
          </button>
        </div>

        {historyLoading && (
          <div className="privacy-note">
            Loading your consent history...
          </div>
        )}

        {historyError && (
          <div className="privacy-note consent-note" role="alert">
            Could not load history: {historyError}
          </div>
        )}

        {!historyLoading && !historyError && consentHistory.length === 0 && (
          <div className="privacy-note">
            No consent activity recorded yet.
          </div>
        )}

        {!historyLoading && !historyError && consentHistory.length > 0 && (
          <div className="history-list">
            {consentHistory.map((record, index) => (
              <article
                className="history-card"
                key={`${record.created_at}-${index}`}
              >
                <div className="history-details">
                  <h3>
                    {studioNames[record.consent_type] || record.consent_type}
                  </h3>

                  <p>
                    Permission {record.action}
                  </p>

                  <small>
                    {new Date(record.created_at).toLocaleString()}
                  </small>
                </div>

                <span
                  className={
                    record.action === 'granted'
                      ? 'permission-on'
                      : 'permission-off'
                  }
                >
                  {record.action.toUpperCase()}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderConsentCentre() {
    const permissions = [
      {
        id: 'face',
        title: 'Face Studio',
        description: 'Permission to use an approved image for visual projects.',
      },
      {
        id: 'voice',
        title: 'Voice Studio',
        description: 'Permission to use an approved voice recording.',
      },
      {
        id: 'live',
        title: 'Live Studio',
        description: 'Permission to participate in AI-assisted live experiences.',
      },
    ];

    return (
      <section className="workspace-panel">
        <div className="eyebrow">PRIVACY & CONTROL</div>
        <h1>Consent <span>Centre.</span></h1>
        <p className="page-description">
          Manage your permissions. You can revoke any permission whenever
          you want.
        </p>

        {consentLoading && (
          <div className="privacy-note">
            Loading your saved permissions...
          </div>
        )}

        {consentMessage && (
          <div className="privacy-note consent-note" role="status">
            {consentMessage}
          </div>
        )}

        <div className="consent-list">
          {permissions.map(item => (
            <article className="consent-card" key={item.id}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <span
                  className={
                    consent[item.id] ? 'permission-on' : 'permission-off'
                  }
                >
                  {savingConsent === item.id
                    ? 'SAVING...'
                    : consent[item.id]
                      ? 'ENABLED'
                      : 'DISABLED'}
                </span>
              </div>

              <button
                className={`toggle ${
                  consent[item.id] ? 'toggle-active' : ''
                }`}
                onClick={() => updateConsent(item.id)}
                disabled={
                  consentLoading ||
                  !apiOnline ||
                  savingConsent !== null
                }
                aria-label={`Toggle ${item.title} permission`}
                aria-pressed={consent[item.id]}
              >
                <span />
              </button>
            </article>
          ))}
        </div>

        <div className="privacy-note consent-note">
          Permission changes are saved through the MIRRORA backend.
          Only enable permissions when you understand and agree to the
          intended use.
        </div>

        {renderConsentHistory()}
      </section>
    );
  }

  function renderPage() {
    switch (activePage) {
      case 'face':
        return renderFaceStudio();
      case 'voice':
        return renderVoiceStudio();
      case 'live':
        return renderLiveStudio();
      case 'consent':
        return renderConsentCentre();
      default:
        return renderOverview();
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <a
          className="brand"
          href="#top"
          onClick={() => setActivePage('overview')}
        >
          <span className="brand-mark">M</span>
          <span>MIRRORA<span className="brand-ai">AI</span></span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="side-navigation">
          {navigation.map(item => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? 'nav-active' : ''
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {activePage === item.id && (
                <span className="active-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className={apiOnline ? 'online-dot' : 'offline-dot'} />
            <div>
              <strong>
                {apiOnline ? 'System online' : 'System offline'}
              </strong>
              <small>Backend connection</small>
            </div>
          </div>
          <span className="version-label">MIRRORA AI · VERSION 0.1</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="breadcrumb">WORKSPACE</span>
            <span className="breadcrumb-divider">/</span>
            <span className="breadcrumb-current">{page.label}</span>
          </div>

          <div className="topbar-right">
            <span className="workspace-badge">PERSONAL WORKSPACE</span>
            <span className="avatar">M</span>
          </div>
        </header>

        <div className="page-content" key={activePage}>
          {renderPage()}
        </div>

        <footer className="app-footer">
          <span>© 2026 MIRRORA AI</span>
          <span>BUILT FOR CREATIVITY. DESIGNED FOR CONSENT.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
```
