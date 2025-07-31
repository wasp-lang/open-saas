const defaultTheme = require('tailwindcss/defaultTheme');
const { resolveProjectPath } = require('wasp/dev');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [resolveProjectPath('./src/**/*.{js,jsx,ts,tsx}')],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				satoshi: [
					'Satoshi',
					'system-ui',
					'sans-serif'
				]
			},
			colors: {
				current: 'currentColor',
				transparent: 'transparent',
				'black-2': '#010101',

				// Pure ShadCN color system only
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					accent: {
						DEFAULT: 'hsl(var(--card-accent))',
						foreground: 'hsl(var(--card-accent-foreground))'
					},
					subtle: {
						DEFAULT: 'hsl(var(--card-subtle))',
						foreground: 'hsl(var(--card-subtle-foreground))'
					}
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					muted: {
						DEFAULT: 'hsl(var(--secondary-muted))',
						foreground: 'hsl(var(--secondary-muted-foreground))'
					}
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
			},
			screens: {
				'2xsm': '375px',
				xsm: '425px',
				'3xl': '2000px',
				...defaultTheme.screens
			},
			fontSize: {
				'title-xxl': [
					'44px',
					'55px'
				],
				'title-xl': [
					'36px',
					'45px'
				],
				'title-xl2': [
					'33px',
					'45px'
				],
				'title-lg': [
					'28px',
					'35px'
				],
				'title-md': [
					'24px',
					'30px'
				],
				'title-md2': [
					'26px',
					'30px'
				],
				'title-sm': [
					'20px',
					'26px'
				],
				'title-xsm': [
					'18px',
					'24px'
				]
			},
			spacing: {
				'11': '2.75rem',
				'13': '3.25rem',
				'14': '3.5rem',
				'15': '3.75rem',
				'16': '4rem',
				'17': '4.25rem',
				'18': '4.5rem',
				'19': '4.75rem',
				'21': '5.25rem',
				'22': '5.5rem',
				'25': '6.25rem',
				'26': '6.5rem',
				'27': '6.75rem',
				'29': '7.25rem',
				'30': '7.5rem',
				'31': '7.75rem',
				'34': '8.5rem',
				'35': '8.75rem',
				'39': '9.75rem',
				'40': '10rem',
				'44': '11rem',
				'45': '11.25rem',
				'46': '11.5rem',
				'49': '12.25rem',
				'50': '12.5rem',
				'52': '13rem',
				'54': '13.5rem',
				'55': '13.75rem',
				'59': '14.75rem',
				'60': '15rem',
				'65': '16.25rem',
				'67': '16.75rem',
				'70': '17.5rem',
				'73': '18.25rem',
				'75': '18.75rem',
				'90': '22.5rem',
				'94': '23.5rem',
				'95': '23.75rem',
				'100': '25rem',
				'115': '28.75rem',
				'125': '31.25rem',
				'150': '37.5rem',
				'180': '45rem',
				'203': '50.75rem',
				'230': '57.5rem',
				'4.5': '1.125rem',
				'5.5': '1.375rem',
				'6.5': '1.625rem',
				'7.5': '1.875rem',
				'8.5': '2.125rem',
				'9.5': '2.375rem',
				'10.5': '2.625rem',
				'11.5': '2.875rem',
				'12.5': '3.125rem',
				'13.5': '3.375rem',
				'14.5': '3.625rem',
				'15.5': '3.875rem',
				'16.5': '4.125rem',
				'17.5': '4.375rem',
				'18.5': '4.625rem',
				'19.5': '4.875rem',
				'21.5': '5.375rem',
				'22.5': '5.625rem',
				'24.5': '6.125rem',
				'25.5': '6.375rem',
				'27.5': '6.875rem',
				'29.5': '7.375rem',
				'32.5': '8.125rem',
				'34.5': '8.625rem',
				'36.5': '9.125rem',
				'37.5': '9.375rem',
				'39.5': '9.875rem',
				'42.5': '10.625rem',
				'47.5': '11.875rem',
				'52.5': '13.125rem',
				'54.5': '13.625rem',
				'55.5': '13.875rem',
				'62.5': '15.625rem',
				'67.5': '16.875rem',
				'72.5': '18.125rem',
				'132.5': '33.125rem',
				'171.5': '42.875rem',
				'187.5': '46.875rem',
				'242.5': '60.625rem'
			},
			maxWidth: {
				'3': '0.75rem',
				'4': '1rem',
				'11': '2.75rem',
				'13': '3.25rem',
				'14': '3.5rem',
				'15': '3.75rem',
				'25': '6.25rem',
				'30': '7.5rem',
				'34': '8.5rem',
				'35': '8.75rem',
				'40': '10rem',
				'44': '11rem',
				'45': '11.25rem',
				'70': '17.5rem',
				'90': '22.5rem',
				'94': '23.5rem',
				'125': '31.25rem',
				'150': '37.5rem',
				'180': '45rem',
				'203': '50.75rem',
				'230': '57.5rem',
				'270': '67.5rem',
				'280': '70rem',
				'2.5': '0.625rem',
				'22.5': '5.625rem',
				'42.5': '10.625rem',
				'132.5': '33.125rem',
				'142.5': '35.625rem',
				'242.5': '60.625rem',
				'292.5': '73.125rem'
			},
			maxHeight: {
				'35': '8.75rem',
				'70': '17.5rem',
				'90': '22.5rem',
				'300': '18.75rem',
				'550': '34.375rem'
			},
			minWidth: {
				'75': '18.75rem',
				'22.5': '5.625rem',
				'42.5': '10.625rem',
				'47.5': '11.875rem'
			},
			zIndex: {
				'1': '1',
				'9': '9',
				'99': '99',
				'999': '999',
				'9999': '9999',
				'99999': '99999',
				'999999': '999999'
			},
			opacity: {
				'65': '.65'
			},
			content: {
				'icon-copy': 'url("../images/icon/icon-copy-alt.svg")'
			},
			transitionProperty: {
				width: 'width',
				stroke: 'stroke'
			},
			borderWidth: {
				'6': '6px'
			},
			boxShadow: {
				'1': '0px 1px 3px rgba(0, 0, 0, 0.08)',
				'2': '0px 1px 4px rgba(0, 0, 0, 0.12)',
				'3': '0px 1px 5px rgba(0, 0, 0, 0.14)',
				'4': '0px 4px 10px rgba(0, 0, 0, 0.12)',
				'5': '0px 1px 1px rgba(0, 0, 0, 0.15)',
				'6': '0px 3px 15px rgba(0, 0, 0, 0.1)',
				'7': '-5px 0 0 #313D4A, 5px 0 0 #313D4A',
				'8': '1px 0 0 #313D4A, -1px 0 0 #313D4A, 0 1px 0 #313D4A, 0 -1px 0 #313D4A, 0 3px 13px rgb(0 0 0 / 8%)',
				default: '0px 8px 13px -3px rgba(0, 0, 0, 0.07)',
				card: '0px 1px 3px rgba(0, 0, 0, 0.12)',
				'card-2': '0px 1px 2px rgba(0, 0, 0, 0.05)',
				switcher: '0px 2px 4px rgba(0, 0, 0, 0.2), inset 0px 2px 2px #FFFFFF, inset 0px -1px 1px rgba(0, 0, 0, 0.1)',
				'switch-1': '0px 0px 5px rgba(0, 0, 0, 0.15)'
			},
			dropShadow: {
				'1': '0px 1px 0px #E2E8F0',
				'2': '0px 1px 4px rgba(0, 0, 0, 0.12)'
			},
			keyframes: {
				rotating: {
					'0%, 100%': {
						transform: 'rotate(360deg)'
					},
					'50%': {
						transform: 'rotate(0deg)'
					}
				}
			},
			animation: {
				'ping-once': 'ping 5s cubic-bezier(0, 0, 0.2, 1)',
				rotating: 'rotating 30s linear infinite',
				'spin-1.5': 'spin 1.5s linear infinite',
				'spin-2': 'spin 2s linear infinite',
				'spin-3': 'spin 3s linear infinite'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography'), require("tailwindcss-animate")],
};
