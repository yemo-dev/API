import { createRoute, z } from '@hono/zod-openapi'
import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE_URL = 'https://bimasislam.kemenag.go.id'
const PROVINCE_MAP = {
    "ACEH": "c4ca4238a0b923820dcc509a6f75849b",
    "SUMATERA UTARA": "c81e728d9d4c2f636f067f89cc14862c",
    "SUMATERA BARAT": "eccbc87e4b5ce2fe28308fd9f2a7baf3",
    "RIAU": "a87ff679a2f3e71d9181a67b7542122c",
    "KEPULAUAN RIAU": "e4da3b7fbbce2345d7772b0674a318d5",
    "JAMBI": "1679091c5a880faf6fb5e6087eb1b2dc",
    "BENGKULU": "8f14e45fceea167a5a36dedd4bea2543",
    "SUMATERA SELATAN": "c9f0f895fb98ab9159f51fd0297e236d",
    "KEPULAUAN BANGKA BELITUNG": "45c48cce2e2d7fbdea1afc51c7c6ad26",
    "LAMPUNG": "d3d9446802a44259755d38e6d163e820",
    "BANTEN": "6512bd43d9caa6e02c990b0a82652dca",
    "JAWA BARAT": "c20ad4d76fe97759aa27a0c99bff6710",
    "DKI JAKARTA": "c51ce410c124a10e0db5e4b97fc2af39",
    "JAWA TENGAH": "aab3238922bcc25a6f606eb525ffdc56",
    "D.I. YOGYAKARTA": "9bf31c7ff062936a96d3c8bd1f8f2ff3",
    "JAWA TIMUR": "c74d97b01eae257e44aa9d5bade97baf",
    "BALI": "70efdf2ec9b086079795c442636b55fb",
    "NUSA TENGGARA BARAT": "6f4922f45568161a8cdf4ad2299f6d23",
    "NUSA TENGGARA TIMUR": "1f0e3dad99908345f7439f8ffabdffc4",
    "KALIMANTAN BARAT": "98f13708210194c475687be6106a3b84",
    "KALIMANTAN SELATAN": "3c59dc048e8850243be8079a5c74d079",
    "KALIMANTAN TENGAH": "b6d767d2f8ed5d21a44b0e5886680cb9",
    "KALIMANTAN TIMUR": "37693cfc748049e45d87b8c7d8b9aacd",
    "KALIMANTAN UTARA": "1ff1de774005f8da13f42943881c655f",
    "GORONTALO": "8e296a067a37563370ded05f5a3bf3ec",
    "SULAWESI SELATAN": "4e732ced3463d06de0ca9a15b6153677",
    "SULAWESI TENGGARA": "02e74f10e0327ad868d138f2b4fdd6f0",
    "SULAWESI TENGAH": "33e75ff09dd601bbe69f351039152189",
    "SULAWESI UTARA": "6ea9ab1baa0efb9e19094440c317e21b",
    "SULAWESI BARAT": "34173cb38f07f89ddbebc2ac9128303f",
    "MALUKU": "c16a5320fa475530d9583c34fd356ef5",
    "MALUKU UTARA": "6364d3f0f495b6ab9dcf8d3b5c6e0b01",
    "PAPUA": "182be0c5cdcd5072bb1864cdee4d3d6e",
    "PAPUA BARAT": "e369853df766fa44e1ed0ff613f563bd"
}

async function getHashIds(provinsiName, kabkotaName) {
    const mainPageResponse = await axios.get(`${BASE_URL}/jadwalshalat`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    })

    const cookies = mainPageResponse.headers['set-cookie']
    const cookieHeader = cookies ? cookies.join('; ') : ''

    const normalizedProv = provinsiName.toUpperCase()
    let provId = PROVINCE_MAP[normalizedProv]

    if (!provId) {
        const partialKey = Object.keys(PROVINCE_MAP).find(k => k.includes(normalizedProv) || normalizedProv.includes(k))
        if (partialKey) {
            return await getHashIds(partialKey, kabkotaName)
        }
        throw new Error(`Provinsi '${provinsiName}' tidak ditemukan.`)
    }

    const { data: cityData } = await axios.post(
        `${BASE_URL}/ajax/getKabkoshalat`,
        new URLSearchParams({ x: provId }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Cookie': cookieHeader,
                'Referer': `${BASE_URL}/jadwalshalat`,
                'Origin': BASE_URL,
                'X-Requested-With': 'XMLHttpRequest'
            }
        }
    )

    const $city = cheerio.load(cityData)
    let cityId = ''

    $city('option').each((i, el) => {
        const text = $city(el).text().trim().toUpperCase()
        if (text === kabkotaName.toUpperCase() || text.includes(kabkotaName.toUpperCase())) {
            cityId = $city(el).val()
            return false
        }
    })

    if (!cityId) throw new Error(`Kabupaten/Kota '${kabkotaName}' tidak ditemukan.`)

    return { provId, cityId, cookieHeader }
}

export const jadwalShalatRoute = createRoute({
    method: 'get',
    path: '/api/jadwalshalat',
    request: {
        query: z.object({
            provinsi: z.string(),
            kabkota: z.string(),
            bulan: z.string().optional(),
            tahun: z.string().optional()
        })
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.any() } },
            description: 'Get prayer schedule'
        }
    }
})

export const jadwalShalatHandler = async (c) => {
    const { provinsi, kabkota, bulan, tahun } = c.req.valid('query')
    const now = new Date()
    const bln = bulan || (now.getMonth() + 1)
    const thn = tahun || now.getFullYear()

    try {
        const { provId, cityId, cookieHeader } = await getHashIds(provinsi, kabkota)

        const { data } = await axios.post(
            `${BASE_URL}/ajax/getShalatbln`,
            new URLSearchParams({ x: provId, y: cityId, bln, thn }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Cookie': cookieHeader,
                    'Referer': `${BASE_URL}/jadwalshalat`,
                    'Origin': BASE_URL,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        )

        return c.json({
            status: true,
            creator: 'yemo',
            data: data.data || []
        })
    } catch (error) {
        return c.json({
            status: false,
            creator: 'yemo',
            message: error.message
        }, 500)
    }
}

export const imsakiyahRoute = createRoute({
    method: 'get',
    path: '/api/jadwalimsakiyah',
    request: {
        query: z.object({
            provinsi: z.string(),
            kabkota: z.string(),
            tahun: z.string().optional()
        })
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.any() } },
            description: 'Get imsakiyah schedule'
        }
    }
})

export const imsakiyahHandler = async (c) => {
    const { provinsi, kabkota, tahun } = c.req.valid('query')
    const now = new Date()
    const thn = tahun || now.getFullYear()

    try {
        const { provId, cityId, cookieHeader } = await getHashIds(provinsi, kabkota)

        const { data } = await axios.post(
            `${BASE_URL}/ajax/getImsyakiyah`,
            new URLSearchParams({ x: provId, y: cityId, thn }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Cookie': cookieHeader,
                    'Referer': `${BASE_URL}/jadwalimsakiyah`,
                    'Origin': BASE_URL,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        )

        return c.json({
            status: true,
            creator: 'yemo',
            data: data.data || []
        })
    } catch (error) {
        return c.json({
            status: false,
            creator: 'yemo',
            message: error.message
        }, 500)
    }
}
