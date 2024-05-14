import type { CookieConsentConfig } from 'vanilla-cookieconsent';

declare global {
  interface Window {
    dataLayer: any;
  }
}

const getConfig = () => {
  const config: CookieConsentConfig = {
    // root: 'body',
    // autoShow: true,
    // disablePageInteraction: true,
    // hideFromBots: true,
    // mode: 'opt-in',
    // revision: 0,

    cookie: {
      // name: 'cc_cookie',
      // domain: location.hostname,
      // path: '/',
      // sameSite: "Lax",
      // expiresAfterDays: 365,
    },

    /**
     * Callback functions
     */
    // onFirstConsent: ({ cookie }) => {},

    // onConsent: ({ cookie }) => {},

    // onChange: ({ changedCategories, changedServices }) => {},

    // onModalReady: ({ modalName }) => {},

    // onModalShow: ({ modalName }) => {},

    // onModalHide: ({ modalName }) => {},

    // https://cookieconsent.orestbida.com/reference/configuration-reference.html#guioptions
    guiOptions: {
      consentModal: {
        layout: 'box',
        position: 'bottom right',
        equalWeightButtons: true,
        flipButtons: false,
      },
      preferencesModal: {
        layout: 'box',
        equalWeightButtons: true,
        flipButtons: false,
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
            onAccept: () => {
              const GA_MEASUREMENT_ID = `G-H3LSJCK95H`;
              window.dataLayer = window.dataLayer || [];
              function gtag(...args: any[]) {
                window.dataLayer.push(arguments);
              }
              gtag('js', new Date());

              gtag('config', GA_MEASUREMENT_ID);

              // Adding the script tag dynamically to the DOM
              const script = document.createElement('script');
              script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
              script.async = true;
              document.body.appendChild(script);
            },
            onReject: () => {},
          },
          youtube: {
            label: 'Youtube Embed',
            onAccept: () => {},
            onReject: () => {},
          },
        },
      },
      // ads: {},
    },

    language: {
      default: 'en',
      translations: {
        en: {
          consentModal: {
            title: 'We use cookies',
            description:
              'We use cookies primarily for analytics to enhance your experience. By accepting, you agree to our use of these cookies. You can manage your preferences or learn more about our cookie policy.',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            showPreferencesBtn: 'Manage Individual preferences',
            // closeIconLabel: 'Reject all and close modal',
            footer: `
            <a href="#" target="_blank">Privacy Policy</a>
            <a href="#" target="_blank">Terms and Conditions</a>
                    `,
          },
          preferencesModal: {
            title: 'Manage cookie preferences',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            savePreferencesBtn: 'Accept current selection',
            closeIconLabel: 'Close modal',
            serviceCounterLabel: 'Service|Services',
            sections: [
              {
                title: 'Your Privacy Choices',
                description: `In this panel you can express some preferences related to the processing of your personal information. You may review and change expressed choices at any time by resurfacing this panel via the provided link. To deny your consent to the specific processing activities described below, switch the toggles to off or use the “Reject all” button and confirm you want to save your choices.`,
              },
              {
                title: 'Strictly Necessary',
                description:
                  'These cookies are essential for the proper functioning of the website and cannot be disabled.',

                //this field will generate a toggle linked to the 'necessary' category
                linkedCategory: 'necessary',
              },
              {
                title: 'Performance and Analytics',
                description:
                  'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                linkedCategory: 'analytics',
                cookieTable: {
                  caption: 'Cookie table',
                  headers: {
                    name: 'Cookie',
                    domain: 'Domain',
                    desc: 'Description',
                  },
                  body: [
                    {
                      name: '_ga',
                      domain: location.hostname,
                      desc: 'Description 1',
                    },
                    {
                      name: '_gid',
                      domain: location.hostname,
                      desc: 'Description 2',
                    },
                  ],
                },
              },
              // {
              //   title: 'Targeting and Advertising',
              //   description:
              //     'These cookies are used to make advertising messages more relevant to you and your interests. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.',
              //   linkedCategory: 'ads',
              // },
              {
                title: 'More information',
                description:
                  'For any queries in relation to my policy on cookies and your choices, please <a href="#contact-page">contact us</a>',
              },
            ],
          },
        },
      },
    },
  };

  return config;
};

export default getConfig;
