/* eslint-disable no-console */
import type { CookieConsentConfig } from 'vanilla-cookieconsent';

function getConfig() {
  const config: CookieConsentConfig = {
    // root: 'body',
    // autoShow: true,
    // disablePageInteraction: true,
    // hideFromBots: true,
    mode: 'opt-in',
    revision: 1,
    cookie: {
      // name: 'cc_cookie',
      // domain: location.hostname,
      // path: '/',
      sameSite: 'Lax',
      expiresAfterDays: 60,
    },
    /**
     * Callback functions
     */
    onFirstConsent: ({ cookie }) => {
      console.log('onFirstConsent fired', cookie);
      // logConsent();
    },
    onConsent: ({ cookie }) => {
      console.log('onConsent fired!', cookie);
    },

    onChange: ({ changedCategories, changedServices }) => {
      console.log('onChange fired!', changedCategories, changedServices);
      // logConsent();
    },

    onModalReady: ({ modalName }) => {
      console.log('ready:', modalName);
    },

    onModalShow: ({ modalName }) => {
      console.log('visible:', modalName);
    },

    onModalHide: ({ modalName }) => {
      console.log('hidden:', modalName);
    },

    // https://cookieconsent.orestbida.com/reference/configuration-reference.html#guioptions
    guiOptions: {
      consentModal: {
        layout: 'cloud',
        position: 'middle center',
        equalWeightButtons: true,
        flipButtons: true,
      },
      preferencesModal: {
        layout: 'bar',
        position: 'right',
        equalWeightButtons: true,
        flipButtons: true,
      },
    },

    categories: {
      necessary: {
        enabled: true, // this category is enabled by default
        readOnly: true, // this category cannot be disabled
      },
      analytics: {
        autoClear: {
          cookies: [
            {
              name: /^_ga/, // regex: match all cookies starting with '_ga'
            },
            {
              name: '_gid', // string: exact cookie name
            },
          ],
        },

        // https://cookieconsent.orestbida.com/reference/configuration-reference.html#category-services
        services: {
          ga: {
            label: 'Google Analytics',
            onAccept: () => {},
            onReject: () => {},
          },
          youtube: {
            label: 'Youtube Embed',
            onAccept: () => {},
            onReject: () => {},
          },
        },
      },
      ads: {},
    },

    language: {
      default: 'de',

      translations: {
        de: {
          consentModal: {
            title: 'Cookie-Einstellungen',
            description:
              'Diese Website verwendet Cookies, um Ihre Nutzererfahrung zu verbessern',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            showPreferencesBtn: 'Einstellungen verwalten',
          },
          preferencesModal: {
            title: 'Cookie-Einstellungen',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            savePreferencesBtn: 'Einstellungen speichern',
            closeIconLabel: 'Schließen',
            sections: [
              {
                title: 'Cookie-Nutzung',
                description:
                  'Wir verwenden Cookies, um die grundlegenden Funktionen der Website sicherzustellen und Ihr Online-Erlebnis zu verbessern ...',
              },
              {
                title: 'Technisch notwendige Cookies',
                description:
                  'Diese Cookies sind für das ordnungsgemäße Funktionieren unserer Website unerlässlich. Ohne diese Cookies würde die Website nicht richtig funktionieren',
                linkedCategory: 'necessary',
              },
              {
                title: 'Performance- und Analyse-Cookies',
                description:
                  'Diese Cookies ermöglichen es der Website, sich Ihre zuvor getroffenen Entscheidungen zu merken',
                linkedCategory: 'analytics',
                cookieTable: {
                  headers: {
                    name: 'Name',
                    domain: 'Dienst',
                    description: 'Beschreibung',
                    expiration: 'Ablaufzeit',
                  },
                  body: [
                    {
                      name: '_ga',
                      domain: 'Google Analytics',
                      description:
                        'Cookie von <a href="#das">Google Analytics</a>.',
                      expiration: 'Läuft nach 12 Tagen ab',
                    },
                    {
                      name: '_gid',
                      domain: 'Google Analytics',
                      description:
                        'Cookie von <a href="#das">Google Analytics</a>',
                      expiration: 'Sitzung',
                    },
                  ],
                },
              },
              {
                title: 'Weitere Informationen',
                description:
                  'Bei Fragen zu unserer Cookie-Richtlinie und Ihren Auswahlmöglichkeiten <a class="cc-link" href="#yourdomain.com">kontaktieren Sie uns</a>.',
              },
            ],
          },
        },
      },
    },
    disablePageInteraction: true,
  };
  return config;
}

export default getConfig;

// import type { CookieConsentConfig } from 'vanilla-cookieconsent';

// const getConfig = () => {
//     const config: CookieConsentConfig = {
//       // root: 'body',
//       // autoShow: true,
//       // disablePageInteraction: true,
//       // hideFromBots: true,
//       mode: 'opt-in',
//       revision: 1,

//       cookie: {
//         // name: 'cc_cookie',
//         // domain: location.hostname,
//         // path: '/',
//         sameSite: "Lax",
//         expiresAfterDays: 60,
//       },

//       /**
//        * Callback functions
//        */
//       onFirstConsent: ({ cookie }) => {
//         console.log('onFirstConsent fired', cookie);
//       },

//       onConsent: ({ cookie }) => {
//         console.log('onConsent fired!', cookie);
//       },

//       onChange: ({ changedCategories, changedServices }) => {
//         console.log('onChange fired!', changedCategories, changedServices);
//       },

//       onModalReady: ({ modalName }) => {
//         console.log('ready:', modalName);
//       },

//       onModalShow: ({ modalName }) => {
//         console.log('visible:', modalName);
//       },

//       onModalHide: ({ modalName }) => {
//         console.log('hidden:', modalName);
//       },

//       // https://cookieconsent.orestbida.com/reference/configuration-reference.html#guioptions
// guiOptions: {
//   consentModal: {
//     layout: "cloud",
//     position: "middle center",
//     equalWeightButtons: true,
//     flipButtons: true
//   },
//   preferencesModal: {
//     layout: "bar",
//     position: "right",
//     equalWeightButtons: true,
//     flipButtons: true
//   }
//       },

//       categories: {
//         necessary: {
//           enabled: true,
//           readOnly: true,
//           services: {
//             sentry: {
//               label: 'Sentry Error Tracking',
//               onAccept: () => {
//                 Sentry.init({
//                   dsn: "your-sentry-dsn",
//                   tracesSampleRate: 1.0,
//                 });
//               },
//               onReject: () => {
//                 if (typeof window !== 'undefined' && window.__SENTRY__) {
//                   Sentry.close();
//                 }
//               },
//             },
//           }
//         },
//         analytics: {
//           autoClear: {
//             cookies: [
//               {
//                 name: /^_ga/, // regex: match all cookies starting with '_ga'
//               },
//               {
//                 name: '_gid', // string: exact cookie name
//               },
//             ],
//           },

//           // https://cookieconsent.orestbida.com/reference/configuration-reference.html#category-services
//           services: {
//             ga: {
//               label: 'Google Analytics',
//               onAccept: () => { },
//               onReject: () => { },
//             },
//             youtube: {
//               label: 'Youtube Embed',
//               onAccept: () => { },
//               onReject: () => { },
//             },
//             clarity: {
//               label: 'Microsoft Clarity',
//               onAccept: () => {
//                 (window as any).clarity('consent');
//               },
//               onReject: () => {
//                 if ((window as any).clarity) {
//                   (window as any).clarity('stop');
//                 }
//               },
//             },
//           },
//         },
//         ads: {},
//       },

//       language: {
//         default: "de",

//         translations: {
//           de: {
//             consentModal: {
//                 title: "Hallo Reisende, es ist Kekszeit!",
//                 description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
//                 closeIconLabel: "",
//                 acceptAllBtn: "Alle akzeptieren",
//                 acceptNecessaryBtn: "Alle ablehnen",
//                 showPreferencesBtn: "Einstellungen verwalten",
//                 footer: "<a href=\"#link\">Datenschutz</a>\n<a href=\"#link\">Bedingungen und Konditionen</a>"
//             },
//             preferencesModal: {
//                 title: "Präferenzen für die Zustimmung",
//                 closeIconLabel: "Modal schließen",
//                 acceptAllBtn: "Alle akzeptieren",
//                 acceptNecessaryBtn: "Alle ablehnen",
//                 savePreferencesBtn: "Einstellungen speichern",
//                 serviceCounterLabel: "Dienstleistungen",
//                 sections: [
//                     {
//                         title: "Verwendung von Cookies",
//                         description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
//                     },
//                     {
//                         title: "Technisch notwendige Cookies",
//                         description: "Diese Cookies sind für die Websitesicherheit erforderlich",
//                         linkedCategory: "necessary",
//                         cookieTable: {
//                           headers: {
//                             name: "Name",
//                             domain: "Dienst",
//                             description: "Beschreibung",
//                             expiration: "Ablaufzeit"
//                           },
//                           body: [
//                             {
//                               name: "sentry-*",
//                               domain: "Sentry.io",
//                               description: "Fehlerüberwachung zur Gewährleistung der Websitestabilität",
//                               expiration: "Session"
//                             }
//                           ]
//                         }
//                     },
//                     {
//                         title: "Analyse-Cookies",
//                         description: "Diese Cookies helfen uns, die Websitenutzung zu verstehen",
//                         linkedCategory: "analytics",
//                         cookieTable: {
//                           headers: {
//                             name: "Name",
//                             domain: "Dienst",
//                             description: "Beschreibung",
//                             expiration: "Ablaufzeit"
//                           },
//                           body: [
//                             {
//                               name: "_clarity",
//                               domain: "Microsoft Clarity",
//                               description: "Analyse der Benutzerfreundlichkeit",
//                               expiration: "1 Jahr"
//                             }
//                           ]
//                         }
//                     },
//                     {
//                         title: "Weitere Informationen",
//                         description: "For any query in relation to my policy on cookies and your choices, please <a class=\"cc__link\" href=\"#yourdomain.com\">Kontaktieren Sie uns</a>."
//                     }
//                 ]
//             }
//         },
//         en: {
//             consentModal: {
//                 title: "Hello traveller, it's cookie time!",
//                 description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
//                 acceptAllBtn: "Accept all",
//                 acceptNecessaryBtn: "Reject all",
//                 showPreferencesBtn: "Manage preferences",
//                 footer: "<a href=\"#link\">Privacy Policy</a>\n<a href=\"#link\">Terms and conditions</a>"
//             },
//             preferencesModal: {
//                 title: "Consent Preferences Center",
//                 acceptAllBtn: "Accept all",
//                 acceptNecessaryBtn: "Reject all",
//                 savePreferencesBtn: "Save preferences",
//                 closeIconLabel: "Close modal",
//                 serviceCounterLabel: "Service|Services",
//                 sections: [
//                     {
//                         title: "Cookie Usage",
//                         description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
//                     },
//                     {
//                         title: "Strictly Necessary Cookies <span class=\"pm__badge\">Always Enabled</span>",
//                         description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
//                         linkedCategory: "necessary"
//                     },
//                     {
//                         title: "More information",
//                         description: "For any query in relation to my policy on cookies and your choices, please <a class=\"cc__link\" href=\"#yourdomain.com\">contact me</a>."
//                     }
//                 ]
//             }
//         }
//         },
//       },
//       disablePageInteraction: true
//     };
//     return config;
//   };

//   export default getConfig;
