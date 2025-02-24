'use client';

import Head from 'next/head';
import { useEffect } from 'react';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

import getConfig from './CookieConsentConfig';

function ResetCookieConsent() {
  CookieConsent.reset(true);
  CookieConsent.run(getConfig());
}

function CookieConsentComponent() {
  useEffect(() => {
    CookieConsent.run(getConfig());
  }, []);

  return (
    <div>
      <Head>
        <link
          href='https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.0.1/dist/cookieconsent.css'
          rel='stylesheet'
        />
      </Head>
      <button onClick={CookieConsent.showPreferences} type='button'>
        Manage cookie preferences
      </button>
      <button onClick={ResetCookieConsent} type='button'>
        Reset cookie consent
      </button>
    </div>
  );
}

export default CookieConsentComponent;
