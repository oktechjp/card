
export const DOC_TYPE = 'card'
export const DOC_VERSION = 1


export const Color = {
    red: {
        label: "Red",
        rgb: "#FD4D69"
    },
    green: {
        label: "Green",
        rgb: "#49D773"
    },
    blue: {
        label: "Blue",
        rgb: '#459BC9'
    },
    ocre: {
        label: "Ocre",
        rgb: '#DA9A00'
    },
    torquoise: {
        label: "Torqouise",
        rgb: '#00BFBB'
    },
    violet: {
        label: "Violet",
        rgb: '#AC77E1'
    },
    cyan: {
        label: "Cyan",
        rgb: '#04E9DF'
    },
    magenta: {
        label: "Magenta",
        rgb: '#FC1E96'
    },
    yellow: {
        label: "Yellow",
        rgb: '#FDD618'
    }
} as const

export const ColorType = Object.fromEntries(Object.entries(Color).map(([key, { label }]) => [key, label])) as { [key in keyof typeof Color]: typeof Color[key]['label'] }
export const CountryType = {
    at: 'Austria',
    uk: 'United Kingdom',
    sa: 'Saudi Arabia',
} as const

/* Todo: many other regions to add */
export const RegionType = {
    'osaka-pref': 'Osaka Pref',
    'osaka-city': 'Osaka City',
    'kyoto-pref': 'Kyoto Pref',
    'kyoto-city': 'Kyoto City',
} as const

export type CardType = {
    surname?: string
    surname_kana?: string
    firstname?: string
    firstname_kana?: string
    callname?: string
    callname_kana?: string
    subtitle?: string
    description?: string
    url?: string
    email?: string
    color: keyof typeof ColorType
    country?: keyof typeof CountryType
    region?: keyof typeof RegionType
}
