export interface LEDBoard {
    ID: number,
    site_code: string;
    address: string;
    city: string;
    region: string;
    site_owner: string;
    board_facing: string;
    size: string;
    spots_count: number;
    spots_price: number;
    remarks?: string;
}
export type LEDBoardOption = Omit<LEDBoard, "city" | "region" | "site_owner" | "remarks">
export type LEDBoardConfigured = Pick<LEDBoard, "site_code" | "spots_count" | "spots_price" | "address"> & {
    from: Date;
    to: Date;
}

export const LEDBoards: LEDBoard[] = [
    {
        "ID": 1,
        "site_code": "A1EDSMDY002-1AA01",
        "address": "GUADALED - EDSA CORNER LIONS STREET, BRGY. BARANGKA ILAYA, MANDALUYONG CITY",
        "city": "EDSA",
        "region": "METRO MANILA",
        "board_facing": "FACING QUEZON CITY",
        "site_owner": "United Neon Advertising, Inc.",
        "size": "59.05 FT x 39.37 FT",
        "spots_count": 6120,
        "spots_price": 39,
    },
    {
        "ID": 2,
        "site_code": "A1EDSMDY004-1AA01",
        "address": "BELSON HOUSE BLDG. No. 271 EDSA WACK WACK, MANDALUYONG CITY (LED)",
        "city": "EDSA",
        "region": "METRO MANILA",
        "board_facing": "FACING QUEZON CITY",
        "site_owner": "United Neon Advertising, Inc.",
        "size": "31.60 FT x 23.70 FT",
        "spots_count": 6120,
        "spots_price": 34,
    },
    {
        "ID": 3,
        "site_code": "A1MKTMGL001-1AA01",
        "address": "PASEO DE MAGALLANES COMMERCIAL CENTER, MAKATI CITY (PASEOLED)",
        "city": "MAKATI",
        "region": "METRO MANILA",
        "board_facing": "FACING MAKATI",
        "site_owner": "Joint Venture",
        "size": "43.30 FT x 23.60 FT",
        "spots_count": 6120,
        "spots_price": 27,
    },
    {
        "ID": 4,
        "site_code": "A1CC5PSG001-1AA01",
        "address": "MENZI LED - JADC COMPOUND #7 E. RODRIGUEZ JR. AVE. BRGY. BAGONG ILOG PASIG CITY (FORMER MENZI-ROAD SIDE)",
        "city": "C5",
        "region": "METRO MANILA",
        "board_facing": "FACING ORTIGAS",
        "site_owner": "United Neon Advertising, Inc.",
        "size": "59.66 FT x 47.30 FT",
        "spots_count": 6120,
        "spots_price": 45,
    },
    {
        "ID": 5,
        "site_code": "A1CC5PSG003-1AA01",
        "address": "LED - NO. 21 J.P. RIZAL STREET, BRGY. BAGONG ILOG, PASIG CITY.",
        "city": "C5",
        "region": "METRO MANILA",
        "board_facing": "FACING MAKATI",
        "site_owner": "United Neon Advertising, Inc.",
        "size": "60.00 FT x 40.00 FT",
        "spots_count": 6120,
        "spots_price": 45,
    },
    {
        "ID": 6,
        "site_code": "A1TAGMKL002-1AA01",
        "address": "LAWTON AVENUE CORNER BAYANI ROAD, TAGUIG CITY (2) MCKINLEY",
        "city": "C5",
        "region": "METRO MANILA",
        "board_facing": "FACING GATE 3",
        "site_owner": "Joint Venture",
        "size": "20.14 FT x 13.43 FT",
        "spots_count": 5760,
        "spots_price": 30,
    },
    {
        "ID": 7,
        "site_code": "A1MNLLWN001-1AA01",
        "address": "LAWTONLED - LAWTON, MANILA",
        "city": "QUIAPO",
        "region": "METRO MANILA",
        "board_facing": "FACING MANILA CITY HALL",
        "site_owner": "Joint Venture",
        "size": "31.50 FT x 18.90 FT",
        "spots_count": 5760,
        "spots_price": 35,
    },
    {
        "ID": 8,
        "site_code": "A4CEBCEB003-1AA01",
        "address": "ESCARIO CENTRAL MALL, ESCARIO ST., CEBU CITY (ESCARIO LED)",
        "city": "CEBU",
        "region": "VISAYAS",
        "board_facing": "FACING CEBU PROVINCIAL CAPITOL",
        "site_owner": "Joint Venture",
        "size": "31.60 FT x 19.68 FT",
        "spots_count": 5760,
        "spots_price": 20,
    },
    {
        "ID": 9,
        "site_code": "A5DDSDAV001-1AA01",
        "address": "DAVAOLED - YL FINANCE BUILDING, JP LAUREL STREET, BAJADA, DAVAO CITY",
        "city": "DAVAO",
        "region": "MINDANAO",
        "board_facing": "FACING ABREEZA MALL AND NEW SM LANANG",
        "site_owner": "United Neon Advertising, Inc.",
        "size": "36.09 FT x 45.93 FT",
        "spots_count": 5760,
        "spots_price": 25,
    }
]